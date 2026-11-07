import React, { useState } from 'react';
import { Download, Check, Loader2, HardDrive, Trash2, Lock } from 'lucide-react';
import { Album, Track } from '../types/index.js';
import { useOffline } from '../context/OfflineContext.js';
import { useAuth } from '../context/AuthContext.js';
import { UnifiedCheckoutModal } from './UnifiedCheckoutModal.js';
import { useNavigate } from 'react-router-dom';

interface AlbumDownloadButtonProps {
  album: Album;
  tracks: Track[];
  variant?: 'primary' | 'compact';
  className?: string;
}

export const AlbumDownloadButton: React.FC<AlbumDownloadButtonProps> = ({
  album,
  tracks,
  variant = 'primary',
  className = '',
}) => {
  const { downloadAlbum, isAlbumDownloaded, albumProgress, removeDownload } = useOffline();
  const { user, isSubscriber } = useAuth();
  const navigate = useNavigate();

  const [showCheckout, setShowCheckout] = useState(false);

  const progress = albumProgress[album.id];
  const isDownloading = !!progress;
  const isDownloaded = isAlbumDownloaded(tracks);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isDownloading) return;

    if (isDownloaded) {
      if (
        window.confirm(
          `Remove all ${tracks.length} downloaded songs of "${album.titleEnglish}" from in-app offline storage?`
        )
      ) {
        for (const t of tracks) {
          await removeDownload(t.id);
        }
      }
      return;
    }

    // Access control: full album downloads require Tony's VIP Lifetime Pass
    if (!user) {
      if (window.confirm('Please sign in to save full albums for offline playback. Go to sign in?')) {
        navigate('/auth');
      }
      return;
    }

    if (!isSubscriber) {
      setShowCheckout(true);
      return;
    }

    await downloadAlbum(album.id, tracks);
  };

  return (
    <>
      {variant === 'compact' ? (
        isDownloading ? (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FA243C]/10 text-[#FA243C] text-[11px] font-mono font-medium animate-pulse ${className}`}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>{progress.current}/{progress.total}</span>
          </div>
        ) : isDownloaded ? (
          <button
            onClick={handleDownload}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium hover:bg-red-500/15 hover:text-red-600 transition-colors ${className}`}
            title="Album downloaded for offline listening. Click to remove."
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Offline</span>
          </button>
        ) : (
          <button
            onClick={handleDownload}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
              isSubscriber
                ? 'bg-black/5 hover:bg-[#FA243C]/10 text-[#86868B] hover:text-[#FA243C]'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400'
            } text-[11px] font-medium transition-colors ${className}`}
            title={
              isSubscriber
                ? 'Download full album for offline in-app playback'
                : "Tony's VIP Lifetime Pass (₹1 Live Test) required to download full album offline"
            }
          >
            <div className="relative flex items-center">
              <Download className="w-3.5 h-3.5" />
              {!isSubscriber && <Lock className="w-2 h-2 text-amber-600 absolute -top-1 -right-1" />}
            </div>
            <span>{isSubscriber ? 'Download Album' : 'VIP Album Download'}</span>
          </button>
        )
      ) : isDownloading ? (
        <div className={`inline-flex flex-col gap-1.5 p-3 rounded-2xl bg-[#FA243C]/10 border border-[#FA243C]/20 text-[#FA243C] ${className}`}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-[#FA243C]" />
            <span>Downloading Album Offline: {progress.current} of {progress.total} songs ({progress.progressPercent}%)</span>
          </div>
          {progress.currentSongTitle && (
            <p className="text-[11px] text-[#86868B] truncate max-w-xs font-mono">
              Saving: {progress.currentSongTitle}
            </p>
          )}
          <div className="w-full h-1.5 bg-[#FA243C]/20 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-[#FA243C] transition-all duration-300"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
        </div>
      ) : isDownloaded ? (
        <button
          onClick={handleDownload}
          className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-500/15 hover:bg-red-500/15 border border-emerald-500/30 hover:border-red-500/30 text-emerald-700 dark:text-emerald-300 hover:text-red-600 text-xs font-bold uppercase tracking-wider transition-all shadow-sm group ${className}`}
          title="All tracks cached in-app for offline playback. Click to remove."
        >
          <span className="flex items-center gap-2 group-hover:hidden">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Album Downloaded ({tracks.length} Songs Offline)</span>
          </span>
          <span className="hidden group-hover:flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>Remove Album Downloads</span>
          </span>
        </button>
      ) : (
        <button
          onClick={handleDownload}
          className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl ${
            isSubscriber
              ? 'bg-gradient-to-r from-[#1D1D1F] to-[#2C2C2E] hover:from-[#FA243C] hover:to-[#FC3C44] text-white'
              : 'bg-gradient-to-r from-[#D4A017] via-[#E8DCB8] to-[#D4A017] text-[#0E0305] shadow-lg'
          } text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] ${className}`}
          title={
            isSubscriber
              ? 'Download all songs in this album to your device for offline in-app playback'
              : "Unlock Tony's VIP Lifetime Pass (₹1 Live Test) to download full album offline"
          }
        >
          {isSubscriber ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4 text-[#0E0305]" />}
          <span>
            {isSubscriber
              ? `Download Full Album (${tracks.length} Songs Offline)`
              : `Unlock VIP Pass (₹1) to Download Album (${tracks.length} Songs)`}
          </span>
        </button>
      )}

      {/* Instant VIP Checkout Modal */}
      <UnifiedCheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        itemType="VIP_PASS"
        onSuccess={async () => {
          setShowCheckout(false);
          await downloadAlbum(album.id, tracks);
        }}
      />
    </>
  );
};

export default AlbumDownloadButton;
