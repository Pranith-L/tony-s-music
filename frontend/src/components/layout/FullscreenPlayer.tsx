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
      className="fixed inset-0 z-50 bg-[#0E0305] text-[#FFFFFF] flex flex-col justify-between overflow-hidden animate-fadeIn select-none"
    >
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C41E3A] rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#C9B27C] rounded-full blur-[120px]" />
      </div>

      {/* Top Bar: Close / Minimize + Track Type info */}
      <div className="relative z-10 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between border-b border-[#C41E3A]/15 bg-[#0E0305]/60 backdrop-blur-md shrink-0">
        <button
          onClick={toggleFullscreenPlayer}
          className="p-1.5 sm:p-2 rounded-full hover:bg-[#340C14] text-[#E2CBD0] hover:text-[#FFFFFF] transition-colors"
          title="Minimize player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#C9B27C]">
            {currentTrack.isTrack ? 'Studio Backing Track' : 'Devotional Vocal Sanctuary'}
          </p>
          <p className="font-heading text-xs sm:text-sm text-[#FFFFFF] font-bold">
            Rev. Tony Prakash
          </p>
        </div>

        <button
          onClick={toggleFullscreenPlayer}
          className="p-1.5 sm:p-2 rounded-full hover:bg-[#340C14] text-[#E2CBD0] hover:text-[#FFFFFF] transition-colors"
          title="Close player"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area: Artwork & Lyrics */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col md:flex-row items-center justify-center p-3 sm:p-6 lg:p-10 gap-4 sm:gap-8 overflow-y-auto max-w-6xl mx-auto w-full">
        {/* Left: Album Artwork Container */}
        <div className="flex flex-col items-center justify-center max-w-xs sm:max-w-md w-full shrink-0">
          <div className="relative aspect-square w-44 xs:w-52 sm:w-72 md:w-80 lg:w-96 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[#C41E3A]/40 group">
            <img
              src={currentTrack.coverImage || '/covers/001_prayermp3.jpg'}
              alt={currentTrack.titleEnglish}
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 pointer-events-none">
                <div className="flex items-center gap-1.5 text-xs text-[#E8DCB8] font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9B27C] animate-pulse" />
                  <span>Now Playing • Live Audio Stream</span>
                </div>
              </div>
            )}
          </div>

          {/* Song Info Right Under Artwork (Essential for compact mobile screens) */}
          <div className="w-full text-center mt-3 sm:mt-4 space-y-1">
            <h2 className="text-base sm:text-2xl font-bold text-[#FFFFFF] truncate px-2">
              {currentTrack.titleEnglish}
            </h2>
            <p className="font-telugu text-sm sm:text-lg text-[#C9B27C] truncate font-semibold">
              {currentTrack.titleTelugu}
            </p>
            <p className="text-xs text-[#E2CBD0]">
              {currentTrack.singer || 'Rev. Tony Prakash'} • {currentTrack.category || 'Worship'}
            </p>
          </div>

          {/* Mobile Lyrics Accordion Toggle */}
          <button
            onClick={() => setShowMobileLyrics(!showMobileLyrics)}
            className="md:hidden mt-2 px-3 py-1 rounded-full bg-[#1A060A] border border-[#C41E3A]/30 text-[11px] text-[#E2CBD0] hover:text-[#FFFFFF] flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[#C9B27C]" />
            <span>{showMobileLyrics ? 'Hide Telugu Lyrics' : 'View Telugu Lyrics'}</span>
          </button>
        </div>

        {/* Right: Synced Lyrics Display */}
        <div
          className={`flex-1 flex-col h-full max-h-[460px] bg-[#1A060A]/80 backdrop-blur-md rounded-3xl border border-[#C41E3A]/25 p-5 sm:p-6 overflow-hidden ${
            showMobileLyrics ? 'flex w-full mt-2' : 'hidden md:flex'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#C41E3A]/20 pb-3 mb-4 shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C9B27C]">
              <Music2 className="w-4 h-4" />
              <span>సాహిత్యం • Devotional Lyrics</span>
            </div>
            <span className="text-[11px] font-mono text-[#E2CBD0]">
              Composer: {currentTrack.composer || 'Rev. Tony Prakash'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-center md:text-left">
            {currentTrack.lyricsTelugu ? (
              <div className="space-y-4 font-telugu text-sm sm:text-base leading-relaxed text-[#FFFFFF]/90 whitespace-pre-line">
                {currentTrack.lyricsTelugu}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#E2CBD0]/60 space-y-2 py-8">
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
      <div className="relative z-10 px-4 sm:px-8 py-3 sm:py-5 border-t border-[#C41E3A]/20 bg-[#0E0305]/90 backdrop-blur-xl shrink-0 space-y-2 sm:space-y-3">
        {/* Progress Bar & Timestamps */}
        <div className="max-w-2xl mx-auto space-y-1">
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              seek(pos * duration);
            }}
            className="h-2 bg-[#26080F] rounded-full cursor-pointer relative overflow-hidden group"
          >
            <div
              className="h-full bg-gradient-to-r from-[#C41E3A] to-[#C9B27C] rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-[#E2CBD0]">
            <span>{formatSeconds(currentTime)}</span>
            <span>{formatSeconds(duration)}</span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="max-w-xl mx-auto flex items-center justify-between">
          {/* Like Heart */}
          <button
            onClick={() => toggleLikeTrack(currentTrack.id)}
            className={`p-2 rounded-full transition-transform hover:scale-110 ${
              liked ? 'text-[#C9B27C]' : 'text-[#E2CBD0] hover:text-[#FFFFFF]'
            }`}
            title={liked ? 'Liked' : 'Like'}
          >
            <Heart className={`w-5 sm:w-6 h-5 sm:h-6 ${liked ? 'fill-[#C9B27C]' : ''}`} />
          </button>

          {/* Transport Controls */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition-colors ${
                shuffle ? 'text-[#C41E3A]' : 'text-[#E2CBD0] hover:text-[#FFFFFF]'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>

            <button
              onClick={playPrev}
              className="p-2 text-[#E2CBD0] hover:text-[#FFFFFF] transition-colors"
              title="Previous"
            >
              <SkipBack className="w-6 sm:w-7 h-6 sm:h-7 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#C41E3A] via-[#8B1524] to-[#C41E3A] text-[#FFFFFF] flex items-center justify-center shadow-[0_0_30px_rgba(27,124,157,0.7)] border-2 border-[#C9B27C]/50 hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-7 sm:w-8 h-7 sm:h-8 fill-current" />
              ) : (
                <Play className="w-7 sm:w-8 h-7 sm:h-8 fill-current ml-1" />
              )}
            </button>

            <button
              onClick={playNext}
              className="p-2 text-[#E2CBD0] hover:text-[#FFFFFF] transition-colors"
              title="Next"
            >
              <SkipForward className="w-6 sm:w-7 h-6 sm:h-7 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-full transition-colors ${
                repeatMode !== 'off' ? 'text-[#C41E3A]' : 'text-[#E2CBD0] hover:text-[#FFFFFF]'
              }`}
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
              <button onClick={toggleMute} className="text-[#E2CBD0] hover:text-[#FFFFFF]">
                {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#26080F] accent-[#C41E3A] rounded-full"
              />
            </div>
            <button
              onClick={toggleMute}
              className="lg:hidden p-2 text-[#E2CBD0] hover:text-[#FFFFFF]"
              title="Mute/Unmute"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FullscreenPlayer;
