import React, { useEffect, useState } from 'react';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  Sparkles,
  ChevronDown,
  FileText,
  Music2,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext.js';

function formatSeconds(secs: number): string {
  if (isNaN(secs) || secs < 0) return '0:00';
  const minutes = Math.floor(secs / 60);
  const remaining = Math.floor(secs % 60);
  return `${minutes}:${remaining < 10 ? '0' : ''}${remaining}`;
}

export const FullscreenPlayer: React.FC = () => {
  const {
    currentTrack,
    songTheme,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    isFullscreenPlayer,
    togglePlay,
    seek,
    setVolumeLevel,
    toggleMute,
    playNext,
    playPrev,
    toggleShuffle,
    toggleRepeat,
    toggleFullscreenPlayer,
    toggleLikeTrack,
    isLiked,
  } = usePlayer();

  const [showMobileLyrics, setShowMobileLyrics] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenPlayer) {
        toggleFullscreenPlayer();
      }
      if (e.code === 'Space' && isFullscreenPlayer) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenPlayer, toggleFullscreenPlayer, togglePlay]);

  if (!isFullscreenPlayer || !currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(currentTrack.id);

  return (
    <div
      data-testid="fullscreen-player-modal"
      className="fixed inset-0 z-50 bg-[#F5F5F7] text-[#1D1D1F] flex flex-col justify-between overflow-hidden animate-fadeIn select-none h-full h-[100dvh]"
    >
      {/* Dynamic Ambient Background Glow matching Song/Album Cover Colors */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(circle at 20% 25%, rgba(${songTheme.primaryRgb}, 0.22), transparent 55%),
                       radial-gradient(circle at 80% 30%, rgba(${songTheme.secondaryRgb}, 0.18), transparent 60%),
                       radial-gradient(circle at 50% 85%, rgba(${songTheme.primaryRgb}, 0.12), transparent 65%),
                       #F5F5F7`,
        }}
      >
        <div
          className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[420px] h-[420px] rounded-full blur-[140px] opacity-40 transition-colors duration-700"
          style={{ backgroundColor: songTheme.primary }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] rounded-full blur-[130px] opacity-30 transition-colors duration-700"
          style={{ backgroundColor: songTheme.secondary }}
        />
      </div>

      {/* Top Bar: Close / Minimize + Track Type info */}
      <div className="relative z-10 px-4 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between border-b border-[#E5E5EA] bg-white/75 backdrop-blur-xl shrink-0">
        <button
          onClick={toggleFullscreenPlayer}
          className="p-1.5 sm:p-2 rounded-full hover:bg-[#F2F2F7] text-[#86868B] hover:text-[#1D1D1F] transition-colors"
          title="Minimize player"
        >
          <ChevronDown className="w-5 sm:w-6 h-5 sm:h-6" />
        </button>

        <div className="text-center">
          <p
            className="text-[10px] sm:text-xs font-mono uppercase tracking-widest font-semibold transition-colors duration-500"
            style={{ color: songTheme.primary }}
          >
            {currentTrack.isTrack ? 'Studio Backing Track' : 'Devotional Vocal Sanctuary'}
          </p>
          <p className="font-heading text-xs sm:text-sm text-[#1D1D1F] font-bold">
            Rev. Tony Prakash
          </p>
        </div>

        <button
          onClick={toggleFullscreenPlayer}
          className="p-1.5 sm:p-2 rounded-full hover:bg-[#F2F2F7] text-[#86868B] hover:text-[#1D1D1F] transition-colors"
          title="Close player"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area: Artwork & Lyrics - FITS POPUP WITH ZERO OUTER SCROLL */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col md:flex-row items-center justify-center p-3 sm:p-5 lg:p-8 gap-4 sm:gap-8 overflow-hidden max-w-6xl mx-auto w-full">
        {/* Left: Album Artwork Container */}
        <div className="flex flex-col items-center justify-center max-w-xs sm:max-w-sm w-full shrink-0">
          <div
            className="relative aspect-square w-36 xs:w-44 sm:w-56 md:w-64 lg:w-72 xl:w-80 max-h-[38vh] rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-700 group"
            style={{
              borderColor: `rgba(${songTheme.primaryRgb}, 0.3)`,
              boxShadow: `0 16px 36px -10px rgba(${songTheme.primaryRgb}, 0.4)`,
            }}
          >
            <img
              src={currentTrack.coverImage || '/covers/001_prayermp3.jpg'}
              alt={currentTrack.titleEnglish}
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 pointer-events-none">
                <div className="flex items-center gap-1.5 text-[11px] text-white font-mono">
                  <Sparkles
                    className="w-3.5 h-3.5 animate-pulse"
                    style={{ color: songTheme.primary }}
                  />
                  <span>Now Playing</span>
                </div>
              </div>
            )}
          </div>

          {/* Song Info Right Under Artwork */}
          <div className="w-full text-center mt-2.5 sm:mt-3 space-y-0.5 sm:space-y-1">
            <h2 className="text-sm sm:text-xl font-bold text-[#1D1D1F] truncate px-2">
              {currentTrack.titleEnglish}
            </h2>
            <p
              className="font-telugu text-xs sm:text-base truncate font-semibold transition-colors duration-500"
              style={{ color: songTheme.primary }}
            >
              {currentTrack.titleTelugu}
            </p>
            <p className="text-[11px] text-[#86868B] truncate">
              {currentTrack.singer || 'Rev. Tony Prakash'} • {currentTrack.category || 'Worship'}
            </p>
          </div>

          {/* Mobile Lyrics Accordion Toggle */}
          <button
            onClick={() => setShowMobileLyrics(!showMobileLyrics)}
            className="md:hidden mt-2 px-3 py-1 rounded-full bg-white/90 border border-[#E5E5EA] text-[11px] text-[#86868B] flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" style={{ color: songTheme.primary }} />
            <span>{showMobileLyrics ? 'Hide Telugu Lyrics' : 'View Telugu Lyrics'}</span>
          </button>
        </div>

        {/* Right: Synced Lyrics Display - ONLY SECTION WITH SCROLL, SCROLLBAR COMPLETELY HIDDEN */}
        <div
          className={`flex-1 flex-col h-full max-h-[min(54vh,460px)] bg-white/85 backdrop-blur-xl rounded-3xl border p-4 sm:p-6 shadow-sm overflow-hidden transition-all duration-500 ${
            showMobileLyrics ? 'flex w-full mt-2' : 'hidden md:flex'
          }`}
          style={{ borderColor: `rgba(${songTheme.primaryRgb}, 0.25)` }}
        >
          <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-2.5 mb-3 shrink-0">
            <div
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-500"
              style={{ color: songTheme.primary }}
            >
              <Music2 className="w-4 h-4" />
              <span>సాహిత్యం • Devotional Lyrics</span>
            </div>
            <span className="text-[11px] font-mono text-[#86868B]">
              Composer: {currentTrack.composer || 'Rev. Tony Prakash'}
            </span>
          </div>

          {/* Scrollable lyrics with invisible scrollbar */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 text-center md:text-left no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {currentTrack.lyricsTelugu ? (
              <div className="space-y-4 font-telugu text-sm sm:text-base leading-relaxed text-[#1D1D1F] whitespace-pre-line">
                {currentTrack.lyricsTelugu}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#86868B] space-y-2 py-8">
                <Music2 className="w-8 h-8 opacity-40" />
                <p className="text-xs">
                  Instrumental / Studio Minus-One Backing Track. Sing along with the choir backing!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="relative z-10 px-4 sm:px-8 py-3 sm:py-4 border-t border-[#E5E5EA] bg-white/85 backdrop-blur-xl shrink-0 space-y-2 sm:space-y-2.5">
        {/* Progress Bar & Timestamps */}
        <div className="max-w-2xl mx-auto space-y-1">
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              seek(pos * duration);
            }}
            className="h-2 bg-[#E5E5EA] rounded-full cursor-pointer relative overflow-hidden group"
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, ${songTheme.primary}, ${songTheme.secondary})`,
              }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-[#86868B]">
            <span>{formatSeconds(currentTime)}</span>
            <span>{formatSeconds(duration)}</span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="max-w-xl mx-auto flex items-center justify-between">
          {/* Like Heart */}
          <button
            onClick={() => toggleLikeTrack(currentTrack.id)}
            className="p-2 rounded-full transition-transform hover:scale-110"
            style={{ color: liked ? songTheme.primary : '#86868B' }}
            title={liked ? 'Liked' : 'Like'}
          >
            <Heart className={`w-5 sm:w-6 h-5 sm:h-6 ${liked ? 'fill-current' : ''}`} />
          </button>

          {/* Transport Controls */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={toggleShuffle}
              className="p-2 rounded-full transition-colors"
              style={{ color: shuffle ? songTheme.primary : '#86868B' }}
              title="Shuffle"
            >
              <Shuffle className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>

            <button
              onClick={playPrev}
              className="p-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              title="Previous"
            >
              <SkipBack className="w-6 sm:w-7 h-6 sm:h-7 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-13 h-13 sm:w-15 sm:h-15 p-3.5 sm:p-4 rounded-full text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
              style={{
                background: `linear-gradient(135deg, ${songTheme.primary}, ${songTheme.secondary})`,
                boxShadow: `0 6px 20px rgba(${songTheme.primaryRgb}, 0.45)`,
              }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 sm:w-7 h-6 sm:h-7 fill-current" />
              ) : (
                <Play className="w-6 sm:w-7 h-6 sm:h-7 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className="p-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              title="Next"
            >
              <SkipForward className="w-6 sm:w-7 h-6 sm:h-7 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className="p-2 rounded-full transition-colors"
              style={{ color: repeatMode !== 'off' ? songTheme.primary : '#86868B' }}
              title="Repeat"
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 sm:w-5 h-4 sm:h-5" />
              ) : (
                <Repeat className="w-4 sm:w-5 h-4 sm:h-5" />
              )}
            </button>
          </div>

          {/* Volume Slider (Desktop) or Audio Indicator (Mobile) */}
          <div className="flex items-center justify-end w-10 lg:w-32">
            <div className="hidden lg:flex items-center gap-2 w-full">
              <button onClick={toggleMute} className="text-[#86868B] hover:text-[#1D1D1F]">
                {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#E5E5EA] rounded-full"
                style={{ accentColor: songTheme.primary }}
              />
            </div>
            <button
              onClick={toggleMute}
              className="lg:hidden p-2 text-[#86868B] hover:text-[#1D1D1F]"
              title="Mute/Unmute"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FullscreenPlayer;
