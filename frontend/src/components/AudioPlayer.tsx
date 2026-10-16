import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ListMusic,
  X,
  Download,
  FileText,
  Radio,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

function formatSeconds(secs: number): string {
  if (isNaN(secs) || secs < 0) return '0:00';
  const minutes = Math.floor(secs / 60);
  const remaining = Math.floor(secs % 60);
  return `${minutes}:${remaining < 10 ? '0' : ''}${remaining}`;
}

export const AudioPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    queue,
    togglePlay,
    seek,
    setVolumeLevel,
    toggleMute,
    playNext,
    playPrev,
    playTrack,
    removeFromQueue,
  } = usePlayer();

  const { isSubscriber } = useAuth();
  const [showQueue, setShowQueue] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleDownload = async () => {
    if (!currentTrack.isDownloadable) {
      alert('This song is currently not configured for audio file download.');
      return;
    }
    setDownloading(true);
    try {
      const res = await api.downloads.requestToken(currentTrack.id);
      window.location.href = res.downloadUrl;
    } catch (err: any) {
      alert(err.message || 'Active subscription or single track purchase (₹99) required to download.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {/* High-Fidelity Audiophile Player Dock */}
      <aside
        aria-label="Audio playback controls"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0d12]/95 backdrop-blur-2xl border-t border-sacred-gold/20 shadow-[0_-12px_40px_rgba(0,0,0,0.85)] px-4 sm:px-8 py-3"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-6">
          {/* Left: Track Information */}
          <div className="flex items-center gap-3.5 min-w-0 max-w-[32%] sm:max-w-[26%]">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-sacred-surface border border-sacred-gold/25 shrink-0 shadow-md">
              <img
                src={currentTrack.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80'}
                alt={currentTrack.titleEnglish}
                className="w-full h-full object-cover"
              />
              {/* Subtle Live Waveform Overlay */}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center gap-0.5">
                  <div className="w-0.5 bg-sacred-gold rounded-full wave-bar-1" />
                  <div className="w-0.5 bg-sacred-gold rounded-full wave-bar-2" />
                  <div className="w-0.5 bg-sacred-gold rounded-full wave-bar-3" />
                  <div className="w-0.5 bg-sacred-gold rounded-full wave-bar-4" />
                </div>
              )}
            </div>

            <div className="min-w-0 overflow-hidden space-y-0.5">
              <div className="text-sm font-telugu font-semibold text-sacred-ivory truncate leading-tight">
                {currentTrack.titleTelugu}
              </div>
              <div className="text-[11px] text-sacred-ivoryMuted truncate font-medium">
                {currentTrack.titleEnglish}
              </div>
              <div className="text-[10px] text-sacred-gold font-light truncate">
                {currentTrack.singer}
              </div>
            </div>
          </div>

          {/* Center: Tactile Playback Controls & Scrubber */}
          <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-5">
              <button
                onClick={playPrev}
                aria-label="Previous track"
                className="text-sacred-ivoryMuted hover:text-sacred-gold transition-colors p-1"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-10 h-10 rounded-full bg-gold-gradient text-sacred-midnight flex items-center justify-center shadow-[0_0_20px_rgba(198,165,101,0.45)] hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={playNext}
                aria-label="Next track"
                className="text-sacred-ivoryMuted hover:text-sacred-gold transition-colors p-1"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Time & Needle Track */}
            <div className="w-full flex items-center gap-3 text-[11px] font-mono text-sacred-ivoryMuted/80">
              <span className="w-8 text-right">{formatSeconds(currentTime)}</span>
              <div
                className="flex-1 h-1 bg-sacred-charcoal rounded-full relative cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  seek(pos * duration);
                }}
              >
                <div
                  className="h-full bg-gold-gradient rounded-full relative transition-all"
                  style={{ width: `${progressPercent}%` }}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-sacred-ivory absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow" />
                </div>
              </div>
              <span className="w-8">{formatSeconds(duration)}</span>
            </div>
          </div>

          {/* Right: Master Volume, Queue, Download */}
          <div className="hidden sm:flex items-center gap-3 min-w-0 max-w-[26%] justify-end">
            {/* Download MP3 */}
            {currentTrack.isDownloadable && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                title={isSubscriber ? 'Download Audio' : 'Download track (₹99 or Member)'}
                className="px-2.5 py-1.5 rounded-lg bg-sacred-charcoal/90 hover:text-sacred-gold border border-white/5 text-[11px] font-mono text-sacred-ivoryMuted transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-sacred-gold" />
                <span className="hidden lg:inline">{isSubscriber ? 'MP3' : '₹99'}</span>
              </button>
            )}

            {/* Volume Control */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="text-sacred-ivoryMuted hover:text-sacred-gold transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                aria-label="Volume"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
                className="w-16 h-1 bg-sacred-charcoal accent-sacred-gold cursor-pointer"
              />
            </div>

            {/* Queue Toggle */}
            <button
              onClick={() => setShowQueue(!showQueue)}
              aria-label="Toggle playback queue"
              className={`p-2 rounded-lg transition-colors relative ${
                showQueue
                  ? 'bg-sacred-gold text-sacred-midnight font-bold'
                  : 'bg-sacred-charcoal text-sacred-ivoryMuted hover:text-sacred-gold'
              }`}
            >
              <ListMusic className="w-4 h-4" />
              {queue.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-sacred-gold text-[9px] text-sacred-midnight font-bold flex items-center justify-center">
                  {queue.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Slide-out Queue */}
      {showQueue && (
        <aside
          aria-label="Playback queue"
          className="fixed bottom-20 right-4 sm:right-8 z-40 w-80 max-h-96 editorial-card rounded-2xl p-4 shadow-2xl flex flex-col border border-sacred-gold/30 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-sacred-gold flex items-center gap-1.5 font-semibold">
              <ListMusic className="w-3.5 h-3.5" />
              <span>Playing Queue ({queue.length})</span>
            </span>
            <button
              onClick={() => setShowQueue(false)}
              className="text-sacred-ivoryMuted hover:text-sacred-ivory p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
            {queue.map((track, idx) => {
              const isCurrent = track.id === currentTrack.id;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                    isCurrent
                      ? 'bg-sacred-gold/15 border border-sacred-gold/40'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <button
                    onClick={() => playTrack(track)}
                    className="flex items-center gap-2.5 text-left min-w-0 flex-1"
                  >
                    <span className="text-[10px] font-mono text-sacred-ivoryMuted w-4">{idx + 1}</span>
                    <div className="truncate">
                      <div className="font-telugu text-sacred-ivory font-semibold truncate">
                        {track.titleTelugu}
                      </div>
                      <div className="text-[10px] text-sacred-ivoryMuted truncate">
                        {track.titleEnglish}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => removeFromQueue(idx)}
                    className="text-sacred-ivoryMuted hover:text-red-400 p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </aside>
      )}
    </>
  );
};
