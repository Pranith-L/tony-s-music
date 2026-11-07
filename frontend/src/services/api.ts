import { User, Track, Album, Video, Booking, AdminStats, Purchase } from '../types/index.js';
import { MOCK_TRACKS, MOCK_ALBUMS, MOCK_VIDEOS } from './mockData.js';

import { supabase } from '../lib/supabase.js';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

function getAuthHeaders(): HeadersInit {
  let token: string | null = null;
  try {
    const rawSession = localStorage.getItem('tony_prakash_auth_session');
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      token = parsed.access_token || parsed.currentSession?.access_token || null;
    }
  } catch {}
  if (!token) {
    token = localStorage.getItem('tony_prakash_token');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Authentication powered by Supabase Auth (14-day persistent sessions)
  auth: {
    async register(data: { name: string; email: string; password: string; phone?: string }) {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.toLowerCase().trim(),
        password: data.password,
        options: {
          data: {
            name: data.name.trim(),
            full_name: data.name.trim(),
            phone: data.phone?.trim() || null,
            role: 'USER',
          },
        },
      });

      if (error) throw new Error(error.message);

      const user: User = {
        id: authData.user?.id || '',
        email: authData.user?.email || data.email,
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        role: 'USER',
        isSubscriberActive: false,
        activeSubscription: null,
        purchases: [],
      };

      return {
        message: 'Account created successfully',
        user,
        token: authData.session?.access_token || '',
      };
    },

    async login(data: { email: string; password: string }) {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email.toLowerCase().trim(),
        password: data.password,
      });

      if (error) throw new Error(error.message);

      const { data: dbUser } = await supabase
        .from('User')
        .select('*, subscriptions:Subscription(*), purchases:Purchase(*)')
        .eq('id', authData.user.id)
        .single();

      const user: User = {
        id: authData.user.id,
        email: authData.user.email || data.email,
        name: dbUser?.name || authData.user.user_metadata?.name || 'Listener',
        phone: dbUser?.phone || null,
        role: (dbUser?.role || 'USER') as any,
        isSubscriberActive: dbUser?.subscriptions?.some(
          (s: any) => s.status === 'ACTIVE' && new Date(s.currentPeriodEnd) > new Date()
        ),
        activeSubscription: dbUser?.subscriptions?.find(
          (s: any) => s.status === 'ACTIVE' && new Date(s.currentPeriodEnd) > new Date()
        ) || null,
        purchases: dbUser?.purchases || [],
      };

      return {
        message: 'Logged in successfully',
        user,
        token: authData.session.access_token,
      };
    },

    async adminLogin(data: { email: string; password: string }) {
      const normalizedEmail = data.email.toLowerCase().trim();
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: data.password,
      });

      if (error) throw new Error(error.message);

      const role =
        authData.user.app_metadata?.role ||
        authData.user.user_metadata?.role;

      const { data: dbUser } = await supabase
        .from('User')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (role !== 'ADMIN' && dbUser?.role !== 'ADMIN') {
        await supabase.auth.signOut();
        throw new Error('Unauthorized: Administrator privileges required');
      }

      const user: User = {
        id: authData.user.id,
        email: authData.user.email || normalizedEmail,
        name: dbUser?.name || 'Rev. Tony Prakash (Official Admin)',
        role: 'ADMIN',
        isSubscriberActive: true,
      };

      return {
        message: 'Admin access granted',
        user,
        token: authData.session.access_token,
      };
    },

    async getProfile() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) throw new Error('No active session');

      const { data: dbUser, error } = await supabase
        .from('User')
        .select(`
          id, email, name, phone, role, createdAt,
          subscriptions:Subscription(*),
          purchases:Purchase(*, track:Track(id, slug, titleTelugu, titleEnglish, coverImage, duration))
        `)
        .eq('id', session.user.id)
        .single();

      if (error || !dbUser) {
        return {
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'Listener',
            role: (session.user.app_metadata?.role || 'USER') as any,
            isSubscriberActive: false,
            activeSubscription: null,
            purchases: [],
          },
        };
      }

      const subscriptions = (dbUser as any).subscriptions || [];
      const activeSub = subscriptions.find(
        (s: any) => s.status === 'ACTIVE' && new Date(s.currentPeriodEnd) > new Date()
      );

      return {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name || 'Listener',
          phone: dbUser.phone || null,
          role: dbUser.role as any,
          createdAt: dbUser.createdAt,
          isSubscriberActive: Boolean(activeSub),
          activeSubscription: activeSub || null,
          purchases: (dbUser as any).purchases || [],
        },
      };
    },

    async googleLogin() {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw new Error(error.message);
      return { message: 'Redirecting to Google Sign-In...' };
    },

    async exchangeGoogleCode(code: string, redirectUri?: string) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        const res = await fetch(`${API_BASE}/auth/google/callback?code=${encodeURIComponent(code)}`);
        return handleResponse<{ token: string; user: User }>(res);
      }
      return {
        token: data.session?.access_token || '',
        user: data.user as any,
      };
    },

    async resetPassword(email: string) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      if (error) throw new Error(error.message);
      return { message: 'Password reset link sent to your email.' };
    },

    async logout() {
      await supabase.auth.signOut();
      return { message: 'Logged out successfully' };
    },
  },

  // Tracks
  tracks: {
    async getAll(params?: {
      search?: string;
      category?: string;
      featured?: boolean;
      popular?: boolean;
      subscriberOnly?: boolean;
      albumId?: string;
      includeDrafts?: boolean;
    }) {
      // 1. Direct Supabase Query (fastest, zero 404s)
      try {
        let query = supabase.from('Track').select('*').eq('status', 'PUBLISHED');
        if (params?.category && params.category !== 'ALL') {
          query = query.ilike('category', params.category);
        }
        if (params?.albumId) {
          query = query.eq('albumId', params.albumId);
        }
        if (params?.popular) {
          query = query.eq('isPopular', true);
        }
        if (params?.featured) {
          query = query.eq('isFeatured', true);
        }
        const { data: dbTracks, error: dbError } = await query.order('trackNumber', { ascending: true });
        if (!dbError && dbTracks && dbTracks.length > 0) {
          let filtered = dbTracks as Track[];
          if (params?.search) {
            const s = params.search.toLowerCase();
            filtered = filtered.filter(
              (t) =>
                t.titleTelugu?.toLowerCase().includes(s) ||
                t.titleEnglish?.toLowerCase().includes(s) ||
                t.composer?.toLowerCase().includes(s)
            );
          }
          return filtered;
        }
      } catch {}

      // 2. REST API endpoint fallback if API_BASE is configured
      if (API_BASE && API_BASE !== '/api') {
        try {
          const query = new URLSearchParams();
          if (params?.search) query.set('search', params.search);
          if (params?.category) query.set('category', params.category);
          if (params?.featured) query.set('featured', 'true');
          if (params?.popular) query.set('popular', 'true');
          if (params?.subscriberOnly) query.set('subscriberOnly', 'true');
          if (params?.albumId) query.set('albumId', params.albumId);
          if (params?.includeDrafts) query.set('includeDrafts', 'true');

          const res = await fetch(`${API_BASE}/tracks?${query.toString()}`, {
            headers: getAuthHeaders(),
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              return data;
            }
          }
        } catch {}
      }

      // 3. Official Embedded Devotional Catalogue (125 tracks)
      let filtered = [...MOCK_TRACKS];
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.titleTelugu.toLowerCase().includes(s) ||
            t.titleEnglish.toLowerCase().includes(s) ||
            t.composer.toLowerCase().includes(s)
        );
      }
      if (params?.category && params.category !== 'ALL') {
        filtered = filtered.filter((t) => t.category.toLowerCase() === params.category?.toLowerCase());
      }
      if (params?.albumId) {
        filtered = filtered.filter((t) => t.albumId === params.albumId);
      }
      if (params?.popular) {
        filtered = filtered.filter((t) => t.isPopular);
      }
      if (params?.featured) {
        filtered = filtered.filter((t) => t.isFeatured);
      }
      return filtered;
    },

    async getBySlug(slug: string) {
      try {
        const { data: track } = await supabase
          .from('Track')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (track) {
          return { track: track as Track, entitlement: { hasAccess: true, hasPurchased: false } };
        }
      } catch {}

      if (API_BASE && API_BASE !== '/api') {
        try {
          const res = await fetch(`${API_BASE}/tracks/${slug}`, {
            headers: getAuthHeaders(),
          });
          if (res.ok) {
            return await res.json();
          }
        } catch {}
      }

      const track = MOCK_TRACKS.find((t) => t.slug === slug) || MOCK_TRACKS[0];
      return { track, entitlement: { hasAccess: true, hasPurchased: false } };
    },

    async create(trackData: Partial<Track>) {
      const res = await fetch(`${API_BASE}/tracks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(trackData),
      });
      return handleResponse<Track>(res);
    },

    async update(id: string, trackData: Partial<Track>) {
      const res = await fetch(`${API_BASE}/tracks/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(trackData),
      });
      return handleResponse<Track>(res);
    },

    async delete(id: string) {
      const res = await fetch(`${API_BASE}/tracks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ message: string }>(res);
    },
  },

  // Albums
  albums: {
    async getAll() {
      try {
        const { data: dbAlbums, error } = await supabase
          .from('Album')
          .select('*, tracks:Track(*)')
          .eq('status', 'PUBLISHED')
          .order('releaseYear', { ascending: false });

        if (!error && dbAlbums && dbAlbums.length > 0) {
          return dbAlbums as Album[];
        }
      } catch {}

      if (API_BASE && API_BASE !== '/api') {
        try {
          const res = await fetch(`${API_BASE}/albums`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              return data;
            }
          }
        } catch {}
      }

      return MOCK_ALBUMS;
    },

    async getBySlug(slug: string) {
      try {
        const { data: dbAlbum } = await supabase
          .from('Album')
          .select('*, tracks:Track(*)')
          .eq('slug', slug)
          .maybeSingle();

        if (dbAlbum) {
          return dbAlbum as Album;
        }
      } catch {}

      if (API_BASE && API_BASE !== '/api') {
        try {
          const res = await fetch(`${API_BASE}/albums/${slug}`);
          if (res.ok) {
            return await res.json();
          }
        } catch {}
      }

      const album = MOCK_ALBUMS.find((a) => a.slug === slug) || MOCK_ALBUMS[0];
      const tracks = MOCK_TRACKS.filter((t) => t.albumId === album.id);
      return { ...album, tracks };
    },

    async create(albumData: Partial<Album>) {
      const res = await fetch(`${API_BASE}/albums`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(albumData),
      });
      return handleResponse<Album>(res);
    },

    async update(id: string, albumData: Partial<Album>) {
      const res = await fetch(`${API_BASE}/albums/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(albumData),
      });
      return handleResponse<Album>(res);
    },

    async delete(id: string) {
      const res = await fetch(`${API_BASE}/albums/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ message: string }>(res);
    },
  },

  // Videos
  videos: {
    async getAll() {
      try {
        const { data: dbVideos, error } = await supabase
          .from('Video')
          .select('*')
          .eq('status', 'PUBLISHED')
          .order('publishedAt', { ascending: false });

        if (!error && dbVideos && dbVideos.length > 0) {
          return dbVideos as Video[];
        }
      } catch {}

      if (API_BASE && API_BASE !== '/api') {
        try {
          const res = await fetch(`${API_BASE}/videos`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              return data;
            }
          }
        } catch {}
      }

      return MOCK_VIDEOS;
    },

    async create(videoData: Partial<Video>) {
      const res = await fetch(`${API_BASE}/videos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(videoData),
      });
      return handleResponse<Video>(res);
    },

    async update(id: string, videoData: Partial<Video>) {
      const res = await fetch(`${API_BASE}/videos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(videoData),
      });
      return handleResponse<Video>(res);
    },

    async delete(id: string) {
      const res = await fetch(`${API_BASE}/videos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ message: string }>(res);
    },
  },

  // Bookings
  bookings: {
    async submit(data: Partial<Booking>) {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ message: string; referenceNo: string; booking: any }>(res);
    },

    async getAll(params?: { status?: string; search?: string; eventType?: string }) {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.search) query.set('search', params.search);
      if (params?.eventType) query.set('eventType', params.eventType);

      const res = await fetch(`${API_BASE}/bookings?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse<Booking[]>(res);
    },

    async updateStatus(id: string, data: { status?: string; internalNotes?: string }) {
      const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<Booking>(res);
    },

    getExportCsvUrl() {
      return `${API_BASE}/bookings/export/csv`;
    },
  },

  // Payments & Subscriptions (Cashfree, Instamojo & Unified Gateway)
  payments: {
    async getConfig() {
      const res = await fetch(`${API_BASE}/payments/config`);
      return handleResponse<{
        paymentsPaused: boolean;
        gateways: {
          cashfree: { enabled: boolean; environment: string };
          instamojo: { enabled: boolean; environment: string };
        };
        pricing: {
          vipPassPaise: number;
          vipPassRupees: number;
          trackPaise: number;
          trackRupees: number;
        };
      }>(res);
    },

    async createUnifiedOrder(data: {
      itemType: 'VIP_PASS' | 'TRACK';
      trackId?: string;
      slug?: string;
      gateway: 'CASHFREE' | 'INSTAMOJO';
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
    }) {
      const res = await fetch(`${API_BASE}/payments/create-unified-order`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<{
        success: boolean;
        gateway: string;
        orderId: string;
        cfOrderId?: string;
        paymentSessionId?: string;
        paymentRequestId?: string;
        paymentUrl?: string;
        rzpOrderId?: string;
        keyId?: string;
        amountRupees: number;
        amountPaise: number;
        itemType: string;
        itemTitle: string;
        itemDescription?: string;
      }>(res);
    },

    async verifyUnifiedPayment(data: {
      orderId: string;
      gateway?: string;
      paymentId?: string;
      paymentRequestId?: string;
    }) {
      try {
        const res = await fetch(`${API_BASE}/payments/verify-unified-payment`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          return {
            success: false,
            status: 'PENDING',
            orderId: data.orderId,
            itemType: 'VIP_PASS',
            message: errData.message || errData.error || 'Payment verification pending with bank...',
          };
        }
        return await res.json();
      } catch (err: any) {
        return {
          success: false,
          status: 'PENDING',
          orderId: data.orderId,
          itemType: 'VIP_PASS',
          message: err.message || 'Payment verification in progress...',
        };
      }
    },

    async getOrder(orderId: string) {
      const res = await fetch(`${API_BASE}/payments/order/${encodeURIComponent(orderId)}`);
      return handleResponse<{
        orderId: string;
        gateway: string;
        itemType: string;
        amountPaise: number;
        amountRupees: number;
        status: string;
        customerName?: string;
        customerEmail?: string;
        track?: any;
        createdAt: string;
      }>(res);
    },

    async createOrder(trackId?: string, slug?: string, amount?: number) {
      const res = await fetch(`${API_BASE}/create-order`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ trackId, slug, amount }),
      });
      return handleResponse<{
        order_id: string;
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
        trackTitle?: string;
        isTestMode: boolean;
      }>(res);
    },

    async verifyOrder(data: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature?: string;
      isTestConfirm?: boolean;
    }) {
      const res = await fetch(`${API_BASE}/verify-order`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<{ success: boolean; message: string; track: any }>(res);
    },

    async createSubscription() {
      const res = await fetch(`${API_BASE}/create-subscription`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse<{
        order_id: string;
        orderId: string;
        subscriptionId: string;
        amount: number;
        planName: string;
        currency: string;
        keyId: string;
        isTestMode: boolean;
      }>(res);
    },

    async verifySubscription(data: {
      subscriptionId?: string;
      paymentId?: string;
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    }) {
      const res = await fetch(`${API_BASE}/verify-subscription`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<{ success: boolean; message: string; subscription: any }>(res);
    },

    async verifyPayment(data: {
      order_id?: string;
      payment_id?: string;
      signature?: string;
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    }) {
      const res = await fetch(`${API_BASE}/verify-payment`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<{
        success: boolean;
        message: string;
        order_id: string;
        payment_id: string;
        status: string;
      }>(res);
    },
  },

  // Downloads
  downloads: {
    async requestToken(trackId: string) {
      const res = await fetch(`${API_BASE}/downloads/${trackId}/request-token`, {
        headers: getAuthHeaders(),
      });
      return handleResponse<{
        downloadUrl: string;
        expiresIn: number;
        trackTitle: string;
      }>(res);
    },
  },

  // Admin
  admin: {
    async getStats() {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: getAuthHeaders(),
      });
      return handleResponse<AdminStats>(res);
    },

    async getUsers() {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: getAuthHeaders(),
      });
      return handleResponse<any[]>(res);
    },

    async getPayments() {
      const res = await fetch(`${API_BASE}/admin/payments`, {
        headers: getAuthHeaders(),
      });
      return handleResponse<{
        summary: {
          totalSuccessful: number;
          totalRevenuePaise: number;
          totalRevenueRupees: number;
          pendingPayments: number;
          failedPayments: number;
          byGateway: {
            cashfree: { count: number; revenueRupees: number };
            instamojo: { count: number; revenueRupees: number };
          };
        };
        transactions: any[];
        purchases: any[];
        subscriptions: any[];
      }>(res);
    },

    async getSettings() {
      const res = await fetch(`${API_BASE}/admin/settings`);
      return handleResponse<Record<string, string>>(res);
    },

    async updateSettings(settings: Record<string, string>) {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });
      return handleResponse<{ message: string }>(res);
    },

    async approvePayment(data: { type: 'PURCHASE' | 'SUBSCRIPTION'; id: string }) {
      const res = await fetch(`${API_BASE}/admin/approve-payment`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<{ success: boolean; message: string }>(res);
    },

    async rejectPayment(data: { type: 'PURCHASE' | 'SUBSCRIPTION'; id: string }) {
      const res = await fetch(`${API_BASE}/admin/reject-payment`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<{ success: boolean; message: string }>(res);
    },
  },
};
