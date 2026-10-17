import { User, Track, Album, Video, Booking, AdminStats, Purchase } from '../types/index.js';
import { MOCK_TRACKS, MOCK_ALBUMS, MOCK_VIDEOS } from './mockData.js';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('tony_prakash_token');
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
  // Authentication
  auth: {
    async register(data: { name: string; email: string; password: string; phone?: string }) {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ message: string; user: User; token: string }>(res);
    },

    async login(data: { email: string; password: string }) {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ message: string; user: User; token: string }>(res);
    },

    async adminLogin(data: { email: string; password: string }) {
      const res = await fetch(`${API_BASE}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ message: string; user: User; token: string }>(res);
    },

    async getProfile() {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      });
      return handleResponse<{ user: User }>(res);
    },

    async googleLogin(data: { credential?: string; userInfo?: any }) {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ message: string; user: User; token: string }>(res);
    },

    async exchangeGoogleCode(code: string, redirectUri?: string) {
      const res = await fetch(`${API_BASE}/auth/google/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri }),
      });
      return handleResponse<{ message: string; user: User; token: string }>(res);
    },

    async facebookLogin(data: {
      accessToken?: string;
      userID?: string;
      name?: string;
      email?: string;
      picture?: string;
    }) {
      const res = await fetch(`${API_BASE}/auth/facebook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ message: string; user: User; token: string }>(res);
    },

    async logout() {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ message: string }>(res);
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
        return await handleResponse<Track[]>(res);
      } catch (err) {
        console.warn('Backend unavailable, using rich devotional catalogue:', err);
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
      }
    },

    async getBySlug(slug: string) {
      try {
        const res = await fetch(`${API_BASE}/tracks/${slug}`, {
          headers: getAuthHeaders(),
        });
        return await handleResponse<{ track: Track; entitlement: { hasAccess: boolean; hasPurchased: boolean } }>(res);
      } catch {
        const track = MOCK_TRACKS.find((t) => t.slug === slug) || MOCK_TRACKS[0];
        return { track, entitlement: { hasAccess: true, hasPurchased: false } };
      }
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
        const res = await fetch(`${API_BASE}/albums`);
        return await handleResponse<Album[]>(res);
      } catch {
        return MOCK_ALBUMS;
      }
    },

    async getBySlug(slug: string) {
      try {
        const res = await fetch(`${API_BASE}/albums/${slug}`);
        return await handleResponse<Album>(res);
      } catch {
        const album = MOCK_ALBUMS.find((a) => a.slug === slug) || MOCK_ALBUMS[0];
        const tracks = MOCK_TRACKS.filter((t) => t.albumId === album.id);
        return { ...album, tracks };
      }
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
        const res = await fetch(`${API_BASE}/videos`);
        return await handleResponse<Video[]>(res);
      } catch {
        return MOCK_VIDEOS;
      }
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

  // Payments & Subscriptions
  payments: {
    async createOrder(trackId: string) {
      const res = await fetch(`${API_BASE}/payments/create-order`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ trackId }),
      });
      return handleResponse<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
        trackTitle: string;
        isTestMode: boolean;
      }>(res);
    },

    async verifyOrder(data: {
      razorpay_order_id: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      isTestConfirm?: boolean;
    }) {
      const res = await fetch(`${API_BASE}/payments/verify-order`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<{ success: boolean; message: string; track: any }>(res);
    },

    async createSubscription() {
      const res = await fetch(`${API_BASE}/payments/create-subscription`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse<{
        subscriptionId: string;
        amount: number;
        planName: string;
        currency: string;
        keyId: string;
        isTestMode: boolean;
      }>(res);
    },

    async verifySubscription(data: { subscriptionId: string; paymentId?: string }) {
      const res = await fetch(`${API_BASE}/payments/verify-subscription`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<{ success: boolean; message: string; subscription: any }>(res);
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
      return handleResponse<{ purchases: Purchase[]; subscriptions: any[] }>(res);
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
  },
};
