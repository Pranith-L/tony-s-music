import React from 'react';
import { Download, Check, Loader2, Trash2 } from 'lucide-react';
import { Track } from '../types/index.js';
import { useOffline } from '../context/OfflineContext.js';

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

  const downloaded = isDownloaded(track.id);
  const downloading = isDownloading(track.id);
  const progress = downloadingTrackIds[track.id] || 0;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (downloading) return;

    if (downloaded) {
      if (window.confirm(`Remove "${track.titleEnglish}" from in-app offline downloads?`)) {
        await removeDownload(track.id);
      }
    } else {
      await downloadTrack(track);
    }
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
        title={`Downloading "${track.titleEnglish}" for offline play (${progress}%)...`}
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
        title="Downloaded in-app for offline playback. Click to remove."
      >
        <span className="group-hover:hidden flex items-center gap-1.5">
          <Check className={`${iconSizes[size]} stroke-[2.5]`} />
          {showText && <span className="text-xs font-medium">Downloaded</span>}
        </span>
        <span className="hidden group-hover:flex items-center gap-1.5 text-red-600">
          <Trash2 className={`${iconSizes[size]}`} />
          {showText && <span className="text-xs font-medium">Remove</span>}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 p-1.5 rounded-full text-[#86868B] hover:text-[#FA243C] hover:bg-[#FA243C]/10 transition-all ${className}`}
      title="Download for offline listening inside the app (Spotify/Apple Music style)"
    >
      <Download className={iconSizes[size]} />
      {showText && <span className="text-xs font-medium">Download</span>}
    </button>
  );
};
export default DownloadButton;

