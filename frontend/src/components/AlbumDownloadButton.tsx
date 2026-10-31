import React from 'react';
import { Download, Check, Loader2, HardDrive, Trash2 } from 'lucide-react';
import { Album, Track } from '../types/index.js';
import { useOffline } from '../context/OfflineContext.js';

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
    } else {
      await downloadAlbum(album.id, tracks);
    }
  };

  if (variant === 'compact') {
    if (isDownloading) {
      return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FA243C]/10 text-[#FA243C] text-[11px] font-mono font-medium animate-pulse ${className}`}>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{progress.current}/{progress.total}</span>
        </div>
      );
    }

    if (isDownloaded) {
      return (
        <button
          onClick={handleDownload}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium hover:bg-red-500/15 hover:text-red-600 transition-colors ${className}`}
          title="Album downloaded for offline listening. Click to remove."
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Offline</span>
        </button>
      );
    }

    return (
      <button
        onClick={handleDownload}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 hover:bg-[#FA243C]/10 text-[#86868B] hover:text-[#FA243C] text-[11px] font-medium transition-colors ${className}`}
        title="Download full album for offline play in app"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Download Album</span>
      </button>
    );
  }

  // Primary large variant for Album Detail Header
  if (isDownloading) {
    return (
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
    );
  }

  if (isDownloaded) {
    return (
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
    );
  }

  return (
    <button
      onClick={handleDownload}
      className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#1D1D1F] to-[#2C2C2E] hover:from-[#FA243C] hover:to-[#FC3C44] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] ${className}`}
      title="Download all songs in this album to your device for offline in-app playback"
    >
      <Download className="w-4 h-4" />
      <span>Download Full Album ({tracks.length} Songs Offline)</span>
    </button>
  );
};
export default AlbumDownloadButton;

