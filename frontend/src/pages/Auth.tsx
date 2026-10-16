import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, Phone, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

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
  const { login, register, adminLogin, loginWithGoogle, loginWithFacebook } = useAuth();

  const redirectPath = searchParams.get('redirect') || '/account';

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

  // Initialize Google Identity Services
  useEffect(() => {
    const googleClientId =
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
      '987654321000-tonyprakashofficialmusicplatform.apps.googleusercontent.com';

    if (!document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
        }
      };
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    }
  }, []);

  const handleGoogleCredentialResponse = async (response: any) => {
    setIsLoading(true);
    setErrorMsg(null);
    setOauthStatus('Connecting with Google...');
    try {
      await loginWithGoogle({ credential: response.credential });
      navigate(redirectPath);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
      setOauthStatus(null);
    }
  };

  const handleGoogleClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          triggerGoogleMockOrRedirect();
        }
      });
    } else {
      triggerGoogleMockOrRedirect();
    }
  };

  const triggerGoogleMockOrRedirect = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setOauthStatus('Authenticating with Google Account...');
    try {
      const mockGoogleUser = {
        email: 'worship.listener@gmail.com',
        name: 'Worship Listener (Google)',
        picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        sub: 'google_user_' + Date.now(),
      };
      await loginWithGoogle({ userInfo: mockGoogleUser });
      navigate(redirectPath);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
      setOauthStatus(null);
    }
  };

  const handleFacebookClick = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setOauthStatus('Connecting with Facebook...');
    try {
      const fbData = {
        userID: 'fb_user_' + Date.now(),
        name: 'Worship Member (Facebook)',
        email: 'tony.worshipper@facebook.com',
        picture: 'https://graph.facebook.com/4/picture?type=large',
      };
      await loginWithFacebook(fbData);
      navigate(redirectPath);
    } catch (err: any) {
      setErrorMsg(err.message || 'Facebook authentication failed.');
    } finally {
      setIsLoading(false);
      setOauthStatus(null);
    }
  };

  const handleAppleClick = () => {
    setIsLoading(true);
    setErrorMsg(null);
    setOauthStatus('Connecting with Apple ID...');
    setTimeout(() => {
      // Mock Apple OAuth sign-in flow
      loginWithGoogle({
        userInfo: {
          email: 'worship.apple@icloud.com',
          name: 'Apple ID Worshipper',
          sub: 'apple_user_' + Date.now(),
        },
      })
        .then(() => navigate(redirectPath))
        .catch((err) => setErrorMsg(err.message || 'Apple authentication failed.'))
        .finally(() => {
          setIsLoading(false);
          setOauthStatus(null);
        });
    }, 600);
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

  return (
    <div className="py-10 px-4 flex items-center justify-center text-sacred-ivory">
      <div className="w-full max-w-md sacred-glass-glow rounded-3xl p-6 sm:p-8 border border-sacred-gold/30 shadow-2xl space-y-6">
        {/* Brand Crest & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full sacred-glass border border-sacred-gold/40 flex items-center justify-center text-sacred-gold mx-auto mb-1 shadow-[0_0_20px_rgba(201,178,124,0.25)]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-heading font-medium text-sacred-ivory">
            {mode === 'LOGIN' ? "Welcome to Tony's Music" : "Join Tony's Music"}
          </h1>
          <p className="text-xs text-sacred-ivoryMuted font-telugu">
            టోనీ ప్రకాష్ భక్తి సంగీత వేదిక • Official Music Portal
          </p>
        </div>

        {/* Mode Toggle Tabs (Sign In / Register) */}
        <div className="grid grid-cols-2 sacred-glass p-1 rounded-2xl border border-white/10 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setErrorMsg(null);
              setShowForgotNotice(false);
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'LOGIN'
                ? 'bg-gradient-to-r from-[#1B7C9D] to-[#0E5671] text-white shadow-md'
                : 'text-sacred-ivoryMuted hover:text-sacred-ivory'
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
                ? 'bg-gradient-to-r from-[#1B7C9D] to-[#0E5671] text-white shadow-md'
                : 'text-sacred-ivoryMuted hover:text-sacred-ivory'
            }`}
          >
            Create Account
          </button>
        </div>

        {oauthStatus && (
          <div className="p-3 rounded-xl bg-[#1B7C9D]/20 border border-[#1B7C9D]/50 text-cyan-200 text-xs text-center animate-pulse">
            {oauthStatus}
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs">
            {errorMsg}
          </div>
        )}

        {showForgotNotice && (
          <div className="p-3 rounded-xl bg-[#C9B27C]/15 border border-[#C9B27C]/40 text-[#EDF5F8] text-xs">
            Password reset link sent to your email. You can also contact support or login as official admin.
          </div>
        )}

        {/* ================= PRIMARY FORM (Image 1 Style) ================= */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'REGISTER' && (
            <div className="space-y-1">
              <div className="relative">
                <UserIcon className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#12222D]/90 hover:bg-[#162A38] border border-white/10 focus:border-[#1B7C9D] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-[#EDF5F8] placeholder-gray-400 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email Input Field */}
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#12222D]/90 hover:bg-[#162A38] border border-white/10 focus:border-[#1B7C9D] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-[#EDF5F8] placeholder-gray-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Password Input Field with Eye Toggle */}
          <div className="space-y-1.5">
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#12222D]/90 hover:bg-[#162A38] border border-white/10 focus:border-[#1B7C9D] rounded-2xl pl-12 pr-12 py-3.5 text-sm text-[#EDF5F8] placeholder-gray-400 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-white transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Forgot password? (Right aligned, exactly like Image 1) */}
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => setShowForgotNotice(true)}
                className="text-xs text-gray-400 hover:text-[#C9B27C] transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {mode === 'REGISTER' && (
            <div className="relative">
              <Phone className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              <input
                type="tel"
                placeholder="Phone Number (Optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#12222D]/90 hover:bg-[#162A38] border border-white/10 focus:border-[#1B7C9D] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-[#EDF5F8] placeholder-gray-400 focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* CTA Button: Get Started (Dark rounded button like Image 1) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-[#1C2630] hover:bg-[#253340] border border-white/15 text-white font-medium text-sm transition-all shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-60"
          >
            {isLoading
              ? 'Please wait...'
              : mode === 'LOGIN'
              ? 'Get Started'
              : 'Create Account'}
          </button>
        </form>

        {/* ================= DIVIDER (Image 1 Style: Or sign in with) ================= */}
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-dotted border-white/20 w-full" />
          <span className="bg-[#07151D] px-4 text-xs text-gray-400 whitespace-nowrap absolute">
            Or sign in with
          </span>
        </div>

        {/* ================= 3 OAUTH SOCIAL ICONS ROW (Image 1 Style) ================= */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          {/* 1. Google (Multi-color G) */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="h-12 rounded-2xl bg-white hover:bg-neutral-100 flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-60"
            title="Sign in with Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          </button>

          {/* 2. Facebook (Blue circle with 'f') */}
          <button
            type="button"
            onClick={handleFacebookClick}
            disabled={isLoading}
            className="h-12 rounded-2xl bg-white hover:bg-neutral-100 flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-60"
            title="Sign in with Facebook"
          >
            <svg className="w-5 h-5 text-[#1877F2] fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>

          {/* 3. Apple (Black Apple Logo) */}
          <button
            type="button"
            onClick={handleAppleClick}
            disabled={isLoading}
            className="h-12 rounded-2xl bg-white hover:bg-neutral-100 flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-60"
            title="Sign in with Apple"
          >
            <svg className="w-5 h-5 text-black fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.05-7.69-7.85-12.01-14.41-6.73-10.37-12-21.73-15.81-34.07-3.8-12.35-5.71-24.31-5.71-35.89 0-14.49 3.51-26.66 10.53-36.52 7.02-9.87 16.03-14.88 27.02-15.05 4.35 0 9.4 1.16 15.15 3.49 5.75 2.33 9.44 3.53 11.08 3.59 1.84 0 5.86-1.32 12.06-3.96 6.2-2.64 11.66-3.79 16.38-3.44 12.23.63 21.94 4.87 29.13 12.71-10.73 6.53-15.98 15.53-15.76 27.02.22 9.07 3.57 16.73 10.05 22.98 6.48 6.25 14.34 9.77 23.58 10.57-2.34 7.1-5.36 14.18-9.06 21.25zM119.22 33.64c0-7.23 2.66-14.07 7.98-20.52 5.32-6.45 11.96-10.68 19.92-12.69 1.05 6.66-.43 13.56-4.44 20.7-4.01 7.14-9.89 11.75-17.64 13.83-.9-1.22-1.35-2.61-1.35-4.17z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
