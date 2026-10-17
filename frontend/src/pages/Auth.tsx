import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, Phone, Sparkles, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

declare global {
  interface Window {
    google?: any;
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, adminLogin, setAuthToken } = useAuth();

  const redirectPath = searchParams.get('redirect') || '/account';

  const handleClose = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [oauthStatus, setOauthStatus] = useState<string | null>(null);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  // Handle callback return from traditional Passport Google OAuth or direct code redirect
  useEffect(() => {
    const oauth = searchParams.get('oauth');
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const code = searchParams.get('code');

    if (oauth === 'success' && token) {
      setIsLoading(true);
      setOauthStatus('Signing in with Google Account...');
      setAuthToken(token)
        .then(() => {
          navigate(redirectPath, { replace: true });
        })
        .catch((err) => {
          console.error('Session establishment error:', err);
          setErrorMsg('Authentication succeeded but session could not be established.');
        })
        .finally(() => {
          setIsLoading(false);
          setOauthStatus(null);
        });
    } else if (code) {
      setIsLoading(true);
      setOauthStatus('Completing Google authentication...');
      const redirectUri = window.location.origin + window.location.pathname;
      api.auth
        .exchangeGoogleCode(code, redirectUri)
        .then(async (data) => {
          await setAuthToken(data.token);
          navigate(redirectPath, { replace: true });
        })
        .catch((err) => {
          console.error('Google code exchange error:', err);
          setErrorMsg(err.message || 'Failed to complete Google authentication.');
        })
        .finally(() => {
          setIsLoading(false);
          setOauthStatus(null);
        });
    } else if (error) {
      setErrorMsg('Google Sign-In failed or was cancelled. Please verify your Google Console settings.');
    }
  }, [searchParams, redirectPath, navigate, setAuthToken]);

  const handleGoogleClick = () => {
    setIsLoading(true);
    setErrorMsg(null);
    setOauthStatus('Redirecting to Google Sign-In...');
    // Traditional Passport Google OAuth initiation endpoint on backend
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'LOGIN') {
        if (email.toLowerCase().trim() === 'tonyprakash.l@admin.in') {
          await adminLogin(email, password);
          navigate('/admin');
        } else {
          await login(email, password);
          navigate(redirectPath);
        }
      } else {
        await register(name, email, password, phone);
        navigate(redirectPath);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div
      onClick={handleClose}
      className="fixed inset-0 z-[250] w-screen h-screen min-h-[100dvh] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E5EA] shadow-2xl space-y-6 my-auto text-[#1D1D1F] animate-in zoom-in-95 duration-200"
      >
        {/* Modal Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-full text-[#86868B] hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Crest & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FC3C44] to-[#FA243C] text-white flex items-center justify-center mx-auto mb-1 shadow-md border border-[#D4A017]/40">
            <Sparkles className="w-6 h-6 text-[#F5D77F]" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#1D1D1F]">
            {mode === 'LOGIN' ? "Welcome to Tony's Music" : "Join Tony's Music"}
          </h1>
          <p className="text-xs text-[#86868B] font-telugu">
            టోనీ ప్రకాష్ భక్తి సంగీత వేదిక • Official Music Portal
          </p>
        </div>

        {/* Mode Toggle Tabs (Sign In / Register) */}
        <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-2xl border border-[#E5E5EA] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setErrorMsg(null);
              setShowForgotNotice(false);
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'LOGIN'
                ? 'bg-gradient-to-r from-[#FC3C44] to-[#FA243C] text-white shadow-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setErrorMsg(null);
              setShowForgotNotice(false);
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'REGISTER'
                ? 'bg-gradient-to-r from-[#FC3C44] to-[#FA243C] text-white shadow-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            Create Account
          </button>
        </div>

        {oauthStatus && (
          <div className="p-3 rounded-xl bg-red-50 border border-[#E5E5EA] text-[#FA243C] text-xs text-center font-medium animate-pulse">
            {oauthStatus}
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {showForgotNotice && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs">
            Password reset link sent to your email. You can also contact support or login as official admin.
          </div>
        )}

        {/* ================= PRIMARY FORM ================= */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'REGISTER' && (
            <div className="space-y-1">
              <div className="relative">
                <UserIcon className="w-5 h-5 text-[#86868B] absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 hover:bg-white focus:bg-white border border-[#E5E5EA] focus:border-[#FA243C] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-[#1D1D1F] placeholder-gray-400 focus:outline-none transition-colors shadow-inner"
                />
              </div>
            </div>
          )}

          {/* Email Input Field */}
          <div className="relative">
            <Mail className="w-5 h-5 text-[#86868B] absolute left-4 top-3.5" />
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 hover:bg-white focus:bg-white border border-[#E5E5EA] focus:border-[#FA243C] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-[#1D1D1F] placeholder-gray-400 focus:outline-none transition-colors shadow-inner"
            />
          </div>

          {/* Password Input Field with Eye Toggle */}
          <div className="space-y-1.5">
            <div className="relative">
              <Lock className="w-5 h-5 text-[#86868B] absolute left-4 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 hover:bg-white focus:bg-white border border-[#E5E5EA] focus:border-[#FA243C] rounded-2xl pl-12 pr-12 py-3.5 text-sm text-[#1D1D1F] placeholder-gray-400 focus:outline-none transition-colors shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-[#86868B] hover:text-gray-700 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => setShowForgotNotice(true)}
                className="text-xs text-[#86868B] hover:text-[#FA243C] transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {mode === 'REGISTER' && (
            <div className="relative">
              <Phone className="w-5 h-5 text-[#86868B] absolute left-4 top-3.5" />
              <input
                type="tel"
                placeholder="Phone Number (Optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 hover:bg-white focus:bg-white border border-[#E5E5EA] focus:border-[#FA243C] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-[#1D1D1F] placeholder-gray-400 focus:outline-none transition-colors shadow-inner"
              />
            </div>
          )}

          {/* CTA Button: Get Started */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FC3C44] to-[#FA243C] hover:brightness-110 border border-[#E5E5EA] text-white font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
          >
            {isLoading
              ? 'Please wait...'
              : mode === 'LOGIN'
              ? 'Get Started'
              : 'Create Account'}
          </button>
        </form>

        {/* ================= DIVIDER ================= */}
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-[#E5E5EA] w-full" />
          <span className="bg-white px-4 text-xs text-[#86868B] whitespace-nowrap absolute">
            Or sign in with
          </span>
        </div>

        {/* ================= GOOGLE OAUTH SECTION ================= */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full h-12 rounded-2xl bg-white hover:bg-gray-50 border border-[#E5E5EA] flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 text-gray-700 text-sm font-semibold"
            title="Sign in with Google"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
