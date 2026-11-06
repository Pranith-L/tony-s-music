import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Subscription, Purchase } from '../types/index.js';
import { supabase } from '../lib/supabase.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSubscriber: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (data?: any) => Promise<void>;
  loginWithFacebook: (data?: any) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setAuthToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadProfile = async (userId: string, accessToken: string) => {
    try {
      const { data: dbUser, error } = await supabase
        .from('User')
        .select(`
          id, email, name, phone, role, createdAt,
          subscriptions:Subscription(*),
          purchases:Purchase(*, track:Track(id, slug, titleTelugu, titleEnglish, coverImage, duration))
        `)
        .eq('id', userId)
        .single();

      if (error || !dbUser) {
        console.warn('Profile fetch under RLS note:', error?.message);
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser?.user) {
          const fallbackUser: User = {
            id: authUser.user.id,
            email: authUser.user.email || '',
            name: authUser.user.user_metadata?.name || authUser.user.user_metadata?.full_name || 'Listener',
            phone: authUser.user.phone || authUser.user.user_metadata?.phone || null,
            role: (authUser.user.app_metadata?.role || authUser.user.user_metadata?.role || 'USER') as any,
            isSubscriberActive: false,
            activeSubscription: null,
            purchases: [],
          };
          setUser(fallbackUser);
          setToken(accessToken);
        }
        return;
      }

      const subscriptions = (dbUser as any).subscriptions || [];
      const activeSub = subscriptions.find(
        (s: any) => s.status === 'ACTIVE' && new Date(s.currentPeriodEnd) > new Date()
      );

      const mappedUser: User = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name || 'Listener',
        phone: dbUser.phone || null,
        role: dbUser.role as any,
        createdAt: dbUser.createdAt,
        isSubscriberActive: Boolean(activeSub),
        activeSubscription: activeSub || null,
        purchases: (dbUser as any).purchases || [],
      };

      setUser(mappedUser);
      setToken(accessToken);
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    // 1. Initial 14-day persistent session restoration
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (session?.user) {
        loadProfile(session.user.id, session.access_token).finally(() => {
          if (mounted) setIsLoading(false);
        });
      } else {
        setUser(null);
        setToken(null);
        setIsLoading(false);
      }
    });

    // 2. Reactive subscription to Supabase Auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        await loadProfile(session.user.id, session.access_token);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setToken(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }

    if (data.session) {
      await loadProfile(data.session.user.id, data.session.access_token);
    }
    setIsLoading(false);
  };

  const adminLogin = async (email: string, password: string) => {
    setIsLoading(true);
    const normalizedEmail = email.toLowerCase().trim();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }

    if (data.session) {
      await loadProfile(data.session.user.id, data.session.access_token);
      const role =
        data.user.app_metadata?.role ||
        data.user.user_metadata?.role;

      if (role !== 'ADMIN') {
        const { data: dbUser } = await supabase.from('User').select('role').eq('id', data.user.id).single();
        if (dbUser?.role !== 'ADMIN') {
          await supabase.auth.signOut();
          setUser(null);
          setToken(null);
          setIsLoading(false);
          throw new Error('Access denied: Administrator privileges required.');
        }
      }
    }
    setIsLoading(false);
  };

  const loginWithGoogle = async () => {
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
    if (error) {
      throw new Error(error.message);
    }
  };

  const loginWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });
    if (error) {
      throw new Error(error.message);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          full_name: name.trim(),
          phone: phone?.trim() || null,
          role: 'USER',
        },
      },
    });

    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }

    if (data.session) {
      await loadProfile(data.session.user.id, data.session.access_token);
    }
    setIsLoading(false);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    if (error) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await loadProfile(session.user.id, session.access_token);
    } else {
      setUser(null);
      setToken(null);
    }
  };

  const setAuthToken = async (newToken: string) => {
    setToken(newToken);
    await refreshUser();
  };

  const isAdmin = user?.role === 'ADMIN';
  const isSubscriber = Boolean(user?.isSubscriberActive);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        isSubscriber,
        login,
        adminLogin,
        loginWithGoogle,
        loginWithFacebook,
        register,
        resetPassword,
        logout,
        refreshUser,
        setAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
