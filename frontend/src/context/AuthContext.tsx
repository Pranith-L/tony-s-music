import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSubscriber: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (data: { credential?: string; userInfo?: any }) => Promise<void>;
  loginWithFacebook: (data: { accessToken?: string; userID?: string; name?: string; email?: string; picture?: string }) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('tony_prakash_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const storedToken = localStorage.getItem('tony_prakash_token');
      if (!storedToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const data = await api.auth.getProfile();
      setUser(data.user);
    } catch (err) {
      console.error('Failed to restore session:', err);
      localStorage.removeItem('tony_prakash_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.auth.login({ email, password });
    localStorage.setItem('tony_prakash_token', data.token);
    setToken(data.token);
    setUser(data.user);
    await refreshUser();
  };

  const adminLogin = async (email: string, password: string) => {
    const data = await api.auth.adminLogin({ email, password });
    localStorage.setItem('tony_prakash_token', data.token);
    setToken(data.token);
    setUser(data.user);
    await refreshUser();
  };

  const loginWithGoogle = async (credentialOrUserInfo: { credential?: string; userInfo?: any }) => {
    const data = await api.auth.googleLogin(credentialOrUserInfo);
    localStorage.setItem('tony_prakash_token', data.token);
    setToken(data.token);
    setUser(data.user);
    await refreshUser();
  };

  const loginWithFacebook = async (fbData: {
    accessToken?: string;
    userID?: string;
    name?: string;
    email?: string;
    picture?: string;
  }) => {
    const data = await api.auth.facebookLogin(fbData);
    localStorage.setItem('tony_prakash_token', data.token);
    setToken(data.token);
    setUser(data.user);
    await refreshUser();
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const data = await api.auth.register({ name, email, password, phone });
    localStorage.setItem('tony_prakash_token', data.token);
    setToken(data.token);
    setUser(data.user);
    await refreshUser();
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      localStorage.removeItem('tony_prakash_token');
      setToken(null);
      setUser(null);
    }
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
        logout,
        refreshUser,
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
