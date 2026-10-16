import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User as UserIcon,
  Sparkles,
  Download,
  Calendar,
  LogOut,
  Music,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

export const AccountPage: React.FC = () => {
  const { user, isSubscriber, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-sacred-midnight pt-32 pb-24 text-center space-y-4 text-sacred-ivory">
        <h2 className="text-2xl font-heading">Sign In Required</h2>
        <p className="text-xs text-sacred-ivoryMuted">
          Please sign in to view your membership, profile, and download history.
        </p>
        <Link
          to="/auth"
          className="inline-block px-6 py-2.5 rounded-full bg-gold-gradient text-sacred-midnight text-xs font-bold uppercase tracking-wider"
        >
          Go to Sign In
        </Link>
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
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Profile Card */}
        <div className="sacred-glass-glow rounded-3xl p-6 sm:p-10 border border-sacred-gold/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-sacred-gold/20 border border-sacred-gold/40 flex items-center justify-center text-sacred-gold">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-heading font-medium text-sacred-ivory">{user.name}</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-sacred-surface border border-white/10 text-sacred-ivoryMuted">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-sacred-ivoryMuted mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-sacred-gold">
                {isSubscriber ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Tony's VIP Pass Member</span>
                  </span>
                ) : (
                  <span>Standard Listener Account</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl sacred-glass border border-red-500/30 text-red-300 text-xs font-medium hover:bg-red-950/40 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Membership Details */}
        <div className="sacred-glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase font-semibold text-sacred-gold tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Membership Status</span>
            </div>
            {isSubscriber ? (
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                Active • ₹299/mo
              </span>
            ) : (
              <Link
                to="/membership"
                className="px-4 py-1.5 rounded-full bg-gold-gradient text-sacred-midnight text-xs font-bold uppercase tracking-wider"
              >
                Upgrade to Premium (₹299)
              </Link>
            )}
          </div>

          {isSubscriber ? (
            <div className="text-xs text-sacred-ivoryMuted space-y-1 pt-1">
              <p>Your subscription unlocks all exclusive Telugu devotional audio and early releases.</p>
              {user.activeSubscription && (
                <p className="font-mono text-[11px]">
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
            <p className="text-xs text-sacred-ivoryMuted">
              You are currently on the free public streaming plan. Subscribe for ₹299/month to unlock subscriber-only songs and early downloads.
            </p>
          )}
        </div>

        {/* Purchased Downloads History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading text-sacred-ivory font-medium">
              Purchased Downloads ({purchases.length})
            </h2>
            <Link to="/music" className="text-xs text-sacred-gold hover:underline">
              Browse More Tracks
            </Link>
          </div>

          {purchases.length === 0 ? (
            <div className="sacred-glass rounded-2xl p-8 border border-white/5 text-center space-y-3">
              <Music className="w-10 h-10 text-sacred-gold/40 mx-auto" />
              <p className="text-xs text-sacred-ivoryMuted">
                You haven’t purchased any individual song downloads yet.
              </p>
              <Link
                to="/music"
                className="inline-block px-5 py-2 rounded-full sacred-glass gold-border text-xs text-sacred-gold hover:bg-sacred-gold/10"
              >
                Browse Song Catalogue
              </Link>
            </div>
          ) : (
            <div className="sacred-glass rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden">
              {purchases.map((p) => {
                const track = p.track;
                if (!track) return null;
                return (
                  <div key={p.id} className="p-4 sm:px-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-sacred-surface shrink-0">
                        <img
                          src={track.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80'}
                          alt={track.titleEnglish}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate">
                        <div className="font-telugu text-sm font-semibold text-sacred-ivory truncate">
                          {track.titleTelugu}
                        </div>
                        <div className="text-xs text-sacred-ivoryMuted truncate">
                          {track.titleEnglish} • {track.duration}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadTrack(track.id)}
                      disabled={downloadingId === track.id}
                      className="px-4 py-2 rounded-xl sacred-glass gold-border text-xs text-sacred-gold hover:bg-sacred-gold/15 transition-colors flex items-center gap-1.5 shrink-0"
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
    </div>
  );
};
