import React, { useState } from 'react';
import { Play, Pause, Download, Sparkles, FileText, Music, Check } from 'lucide-react';
import { Track } from '../types/index.js';
import { usePlayer } from '../context/PlayerContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

interface TrackCardProps {
  track: Track;
  onOpenLyrics?: (track: Track) => void;
  index?: number;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, onOpenLyrics, index }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const { user, isSubscriber } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const isThisPlaying = isCurrent && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!track.isDownloadable) {
      alert('This song is currently not configured for download.');
      return;
    }

    if (!user) {
      alert("Please sign in to access downloads or subscribe to Tony's VIP Pass.");
      return;
    }

    setDownloading(true);
    try {
      const res = await api.downloads.requestToken(track.id);
      window.location.href = res.downloadUrl;
    } catch (err: any) {
      alert(err.message || 'Active subscription or single track purchase (₹99) required.');
    } finally {
      setDownloading(false);
    }
  };

  const trackNum = typeof index === 'number' ? String(index + 1).padStart(2, '0') : null;

  return (
    <div
      onClick={() => onOpenLyrics?.(track)}
      className="group editorial-card rounded-2xl p-4 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Album Artwork with tactile vinyl slipcase inset */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-sacred-surface mb-3.5 border border-sacred-gold/15">
          <img
            src={track.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'}
            alt={track.titleEnglish}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Top subtle badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            {trackNum && (
              <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono text-sacred-gold border border-sacred-gold/20">
                #{trackNum}
              </span>
            )}
            {track.isSubscriberOnly ? (
              <span className="px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 text-[10px] font-mono border border-amber-600/40 ml-auto">
                Exclusive
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-black/60 text-[10px] text-sacred-ivoryMuted font-mono ml-auto">
                {track.category}
              </span>
            )}
          </div>

          {/* Center Play Button Overlay */}
          <button
            onClick={handlePlayClick}
            aria-label={isThisPlaying ? `Pause ${track.titleEnglish}` : `Play ${track.titleEnglish}`}
            className={`absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isThisPlaying
                ? 'bg-gold-gradient text-sacred-midnight scale-100 shadow-[0_0_25px_rgba(198,165,101,0.6)]'
                : 'bg-black/70 text-sacred-ivory backdrop-blur-sm opacity-0 group-hover:opacity-100 group-hover:scale-105 hover:bg-gold-gradient hover:text-sacred-midnight'
            }`}
          >
            {isThisPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Titles & Devotional Details */}
        <div className="space-y-1">
          <h3 className="font-telugu text-base sm:text-lg font-bold text-sacred-ivory group-hover:text-sacred-gold transition-colors line-clamp-1 leading-snug">
            {track.titleTelugu}
          </h3>
          <p className="text-xs text-sacred-ivoryMuted font-medium line-clamp-1">
            {track.titleEnglish}
          </p>
          <div className="text-[11px] text-sacred-gold/80 font-light truncate pt-0.5">
            {track.singer || 'Tony Prakash'} • {track.releaseYear}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-sacred-ivoryMuted">
        <span className="font-mono text-[11px] tracking-tight">{track.duration}</span>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenLyrics?.(track);
            }}
            title="సాహిత్యం • View Lyrics"
            className="px-2 py-1 rounded bg-sacred-charcoal/80 hover:text-sacred-gold hover:border-sacred-gold/40 border border-white/5 text-[11px] font-telugu transition-colors"
          >
            సాహిత్యం
          </button>

          {track.isDownloadable && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              title={isSubscriber ? 'Download track' : 'Download (₹99 or Member)'}
              className="px-2 py-1 rounded bg-sacred-charcoal/80 hover:text-sacred-gold hover:border-sacred-gold/40 border border-white/5 text-[11px] transition-colors flex items-center gap-1 font-mono"
            >
              <Download className="w-3 h-3 text-sacred-gold" />
              <span>{isSubscriber ? 'MP3' : '₹99'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
