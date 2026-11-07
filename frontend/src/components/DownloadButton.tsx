import React, { useState } from 'react';
import { Download, Check, Loader2, Trash2, Lock } from 'lucide-react';
import { Track } from '../types/index.js';
import { useOffline } from '../context/OfflineContext.js';
import { useAuth } from '../context/AuthContext.js';
import { usePlayer } from '../context/PlayerContext.js';
import { UnifiedCheckoutModal } from './UnifiedCheckoutModal.js';
import { useNavigate } from 'react-router-dom';

interface DownloadButtonProps {
  track: Track;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  track,
  showText = false,
  size = 'md',
  className = '',
}) => {
  const { isDownloaded, isDownloading, downloadingTrackIds, downloadTrack, removeDownload } = useOffline();
  const { user, isSubscriber } = useAuth();
  const { isBackingTrack, hasTrackAccess } = usePlayer();
  const navigate = useNavigate();

  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutItemType, setCheckoutItemType] = useState<'VIP_PASS' | 'TRACK'>('VIP_PASS');

  const downloaded = isDownloaded(track.id);
  const downloading = isDownloading(track.id);
  const progress = downloadingTrackIds[track.id] || 0;

  const isBacking = isBackingTrack(track);
  // Devotional songs require VIP Pass; Backing tracks require individual track purchase
  const isEntitled = isBacking ? hasTrackAccess(track) : Boolean(isSubscriber);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (downloading) return;

    if (downloaded) {
      if (window.confirm(`Remove "${track.titleEnglish}" from in-app offline downloads?`)) {
        await removeDownload(track.id);
      }
      return;
    }

    // Access control verification
    if (!user) {
      if (window.confirm('Please sign in to save songs for in-app offline listening. Go to sign in?')) {
        navigate('/auth');
      }
      return;
    }

    if (!isEntitled) {
      if (isBacking) {
        setCheckoutItemType('TRACK');
        setShowCheckout(true);
      } else {
        setCheckoutItemType('VIP_PASS');
        setShowCheckout(true);
      }
      return;
    }

    // Authorized: download track into in-app offline storage
    await downloadTrack(track);
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (downloading) {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#FA243C]/10 text-[#FA243C] text-xs font-mono font-medium animate-pulse transition-all ${className}`}
        title={`Downloading "${track.titleEnglish}" into in-app offline storage (${progress}%)...`}
      >
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
        {showText && <span>{progress > 0 ? `${progress}%` : 'Saving...'}</span>}
      </button>
    );
  }

  if (downloaded) {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 p-1.5 rounded-full bg-emerald-500/15 hover:bg-red-500/15 text-emerald-600 dark:text-emerald-400 hover:text-red-600 transition-all group ${className}`}
        title="Downloaded in-app for offline playback (Spotify/Apple Music style). Click to remove."
      >
        <span className="group-hover:hidden flex items-center gap-1.5">
          <Check className={`${iconSizes[size]} stroke-[2.5]`} />
          {showText && <span className="text-xs font-medium">Offline</span>}
        </span>
        <span className="hidden group-hover:flex items-center gap-1.5 text-red-600">
          <Trash2 className={`${iconSizes[size]}`} />
          {showText && <span className="text-xs font-medium">Remove</span>}
        </span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 p-1.5 rounded-full transition-all ${
          isEntitled
            ? 'text-[#86868B] hover:text-[#FA243C] hover:bg-[#FA243C]/10'
            : 'text-amber-600/80 hover:text-amber-600 hover:bg-amber-500/10'
        } ${className}`}
        title={
          isEntitled
            ? 'Download for in-app offline listening (Spotify/Apple Music style)'
            : isBacking
            ? 'Studio backing track requires purchase (₹1 Live Test) for in-app offline download'
            : "Devotional vocal songs require Tony's VIP Lifetime Pass (₹1 Live Test) for in-app offline download"
        }
      >
        <div className="relative flex items-center">
          <Download className={iconSizes[size]} />
          {!isEntitled && (
            <Lock className="w-2.5 h-2.5 text-amber-600 absolute -top-1 -right-1" />
          )}
        </div>
        {showText && (
          <span className="text-xs font-medium">
            {isEntitled ? 'Download' : isBacking ? 'Unlock & Download' : 'VIP Download'}
          </span>
        )}
      </button>

      {/* Instant Checkout Modal if clicked while locked */}
      <UnifiedCheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        itemType={checkoutItemType}
        track={track}
        onSuccess={async () => {
          setShowCheckout(false);
          await downloadTrack(track);
        }}
      />
    </>
  );
};

export default DownloadButton;
