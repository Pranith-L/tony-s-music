import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User as UserIcon,
  Sparkles,
  Download,
  LogOut,
  Music,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

export const AccountPage: React.FC = () => {
  const { user, isSubscriber, logout } = useAuth();
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-[#18181B] border border-[#E5E5EA] dark:border-[#27272A] rounded-3xl p-8 sm:p-10 shadow-apple-card text-center relative overflow-hidden backdrop-blur-xl">
          {/* Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-br from-[#FA243C]/20 to-[#D4A017]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 bg-[#FA243C]/10 dark:bg-[#FA243C]/20 border border-[#FA243C]/30 flex items-center justify-center text-[#FA243C] shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-heading font-extrabold text-[#1D1D1F] dark:text-white">
            Sign In Required
          </h2>
          <p className="font-telugu text-xs text-[#D4A017] dark:text-[#F5D77F] font-semibold mt-1">
            ఖాతా లాగిన్ అవసరం
          </p>
          <p className="text-sm text-[#86868B] dark:text-[#A1A1AA] mt-3 leading-relaxed">
            Please sign in to view your membership pass, manage your profile, and download purchased studio audio tracks.
          </p>

          <div className="mt-8">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#FA243C] to-[#D71A30] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#FA243C]/25 transition-all active:scale-95"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadTrack = async (trackId: string) => {
    setDownloadingId(trackId);
    try {
      const res = await api.downloads.requestToken(trackId);
      window.location.href = res.downloadUrl;
    } catch (err: any) {
      alert(err.message || 'Download request failed.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const purchases = user.purchases || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Profile Card */}
      <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 sm:p-10 border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0 shadow-sm">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-heading font-extrabold text-[#1D1D1F] dark:text-white">
                {user.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#F2F2F7] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#27272A] text-[#1D1D1F] dark:text-[#E4E4E7]">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-[#86868B] dark:text-[#A1A1AA] mt-1">{user.email}</p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              {isSubscriber ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active Tony's VIP Pass Member</span>
                </span>
              ) : (
                <span className="text-[#86868B] dark:text-[#A1A1AA] text-[11px]">
                  Standard Listener Account
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold transition-all flex items-center gap-2 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Membership Details */}
      <div className="bg-white dark:bg-[#18181B] rounded-2xl p-6 sm:p-8 border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs uppercase font-semibold text-[#D4A017] dark:text-[#F5D77F] tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Membership Status</span>
          </div>
          {isSubscriber ? (
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs font-semibold">
              Active • ₹299/mo
            </span>
          ) : (
            <Link
              to="/membership"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FA243C] to-[#D71A30] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95"
            >
              Upgrade to Premium (₹299)
            </Link>
          )}
        </div>

        {isSubscriber ? (
          <div className="text-xs text-[#86868B] dark:text-[#A1A1AA] space-y-1 pt-1">
            <p>Your subscription unlocks all exclusive Telugu devotional audio, early releases, and VIP events.</p>
            {user.activeSubscription && (
              <p className="font-mono text-[11px] text-[#1D1D1F] dark:text-white font-semibold">
                Valid through:{' '}
                {new Date(user.activeSubscription.currentPeriodEnd).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#86868B] dark:text-[#A1A1AA]">
            You are currently on the free public streaming plan. Subscribe for ₹299/month to unlock subscriber-only songs and early downloads.
          </p>
        )}
      </div>

      {/* Purchased Downloads History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold text-[#1D1D1F] dark:text-white">
            Purchased Downloads ({purchases.length})
          </h2>
          <Link to="/music" className="text-xs text-[#FA243C] hover:underline font-semibold">
            Browse More Tracks
          </Link>
        </div>

        {purchases.length === 0 ? (
          <div className="bg-white dark:bg-[#18181B] rounded-2xl p-10 border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl mx-auto bg-[#F2F2F7] dark:bg-[#202023] flex items-center justify-center text-[#86868B] dark:text-[#A1A1AA]">
              <Music className="w-6 h-6" />
            </div>
            <p className="text-xs text-[#86868B] dark:text-[#A1A1AA]">
              You haven’t purchased any individual song downloads yet.
            </p>
            <Link
              to="/music"
              className="inline-block px-5 py-2 rounded-full border border-[#E5E5EA] dark:border-[#27272A] text-xs font-semibold text-[#1D1D1F] dark:text-white hover:bg-[#F2F2F7] dark:hover:bg-white/5 transition-colors"
            >
              Browse Song Catalogue
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card divide-y divide-[#E5E5EA] dark:divide-[#27272A] overflow-hidden">
            {purchases.map((p) => {
              const track = p.track;
              if (!track) return null;
              return (
                <div key={p.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-[#F2F2F7] dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F2F2F7] dark:bg-[#202023] shrink-0 border border-[#E5E5EA] dark:border-[#27272A]">
                      <img
                        src={track.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80'}
                        alt={track.titleEnglish}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <div className="font-telugu text-sm font-bold text-[#D4A017] dark:text-[#F5D77F] truncate">
                        {track.titleTelugu}
                      </div>
                      <div className="text-xs text-[#1D1D1F] dark:text-white font-medium truncate">
                        {track.titleEnglish} • <span className="text-[#86868B] dark:text-[#A1A1AA]">{track.duration}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadTrack(track.id)}
                    disabled={downloadingId === track.id}
                    className="px-4 py-2 rounded-xl bg-[#FA243C]/10 hover:bg-[#FA243C]/20 border border-[#FA243C]/30 text-[#FA243C] text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingId === track.id ? 'Preparing...' : 'Download MP3'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
