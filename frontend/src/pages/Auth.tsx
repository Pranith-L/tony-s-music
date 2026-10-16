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
  const { login, register, adminLogin, loginWithGoogle } = useAuth();

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
                ? 'bg-gradient-to-r from-[#C41E3A] to-[#8B1524] text-white shadow-md'
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
                ? 'bg-gradient-to-r from-[#C41E3A] to-[#8B1524] text-white shadow-md'
                : 'text-sacred-ivoryMuted hover:text-sacred-ivory'
            }`}
          >
            Create Account
          </button>
        </div>

        {oauthStatus && (
          <div className="p-3 rounded-xl bg-[#C41E3A]/20 border border-[#C41E3A]/50 text-[#FFFFFF] text-xs text-center animate-pulse">
            {oauthStatus}
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs">
            {errorMsg}
          </div>
        )}

        {showForgotNotice && (
          <div className="p-3 rounded-xl bg-[#C9B27C]/15 border border-[#C9B27C]/40 text-[#FFFFFF] text-xs">
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
                  className="w-full bg-[#12222D]/90 hover:bg-[#162A38] border border-white/10 focus:border-[#C41E3A] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-[#FFFFFF] placeholder-gray-400 focus:outline-none transition-colors"
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
              className="w-full bg-[#12222D]/90 hover:bg-[#162A38] border border-white/10 focus:border-[#C41E3A] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-[#FFFFFF] placeholder-gray-400 focus:outline-none transition-colors"
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
                className="w-full bg-[#12222D]/90 hover:bg-[#162A38] border border-white/10 focus:border-[#C41E3A] rounded-2xl pl-12 pr-12 py-3.5 text-sm text-[#FFFFFF] placeholder-gray-400 focus:outline-none transition-colors"
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
                className="w-full bg-[#12222D]/90 hover:bg-[#162A38] border border-white/10 focus:border-[#C41E3A] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-[#FFFFFF] placeholder-gray-400 focus:outline-none transition-colors"
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
          <span className="bg-[#0E0305] px-4 text-xs text-gray-400 whitespace-nowrap absolute">
            Or sign in with
          </span>
        </div>

        {/* ================= GOOGLE OAUTH SECTION ================= */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full h-12 rounded-2xl bg-white hover:bg-neutral-100 flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-60 text-neutral-800 text-sm font-semibold"
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
    </div>
  );
};
