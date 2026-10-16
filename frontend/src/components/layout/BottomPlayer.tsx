import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  FileText,
  ListMusic,
  Maximize2,
  Minimize2,
  SidebarClose,
  SidebarOpen,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext.js';
import { useAuth } from '../../context/AuthContext.js';

function formatSeconds(secs: number): string {
  if (isNaN(secs) || secs < 0) return '0:00';
  const minutes = Math.floor(secs / 60);
  const remaining = Math.floor(secs % 60);
  return `${minutes}:${remaining < 10 ? '0' : ''}${remaining}`;
}

export const BottomPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    isRightSidebarOpen,
    rightSidebarTab,
    isFullscreenPlayer,
    togglePlay,
    seek,
    setVolumeLevel,
    toggleMute,
    playNext,
    playPrev,
    toggleShuffle,
    toggleRepeat,
    toggleLikeTrack,
    isLiked,
    toggleRightSidebar,
    setRightSidebarTab,
    toggleFullscreenPlayer,
    remainingSkips,
    isBackingTrack,
    hasTrackAccess,
    setShowPreviewLimitModal,
  } = usePlayer();

  const { isSubscriber } = useAuth();
  const [hoverSeekTime, setHoverSeekTime] = useState<number | null>(null);
  const [hoverSeekPos, setHoverSeekPos] = useState<number>(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const liked = isLiked(currentTrack.id);

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * duration);
  };

  const handleProgressBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, hoverX / rect.width));
    setHoverSeekTime(ratio * duration);
    setHoverSeekPos(hoverX);
  };

  const handleLyricsToggle = () => {
    if (isRightSidebarOpen && rightSidebarTab === 'lyrics') {
      toggleRightSidebar();
    } else {
      setRightSidebarTab('lyrics');
      if (!isRightSidebarOpen) toggleRightSidebar();
    }
  };

  const handleQueueToggle = () => {
    if (isRightSidebarOpen && rightSidebarTab === 'queue') {
      toggleRightSidebar();
    } else {
      setRightSidebarTab('queue');
      if (!isRightSidebarOpen) toggleRightSidebar();
    }
  };

  const handleNowPlayingToggle = () => {
    if (isRightSidebarOpen && rightSidebarTab === 'now-playing') {
      toggleRightSidebar();
    } else {
      setRightSidebarTab('now-playing');
      if (!isRightSidebarOpen) toggleRightSidebar();
    }
  };

  return (
    <footer
      aria-label="Audio playback controls"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-2xl border-t border-gray-200 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-3 sm:px-6 py-2.5 sm:py-3 transition-all"
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* ================= LEFT SECTION: Track Info ================= */}
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 w-[30%] sm:w-[28%] lg:w-[24%]">
          {/* Track Cover Thumbnail */}
          <div
            onClick={handleNowPlayingToggle}
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-md group cursor-pointer"
            title="Toggle Now Playing view"
          >
            <img
              src={currentTrack.coverImage || '/covers/001_prayermp3.jpg'}
              alt={currentTrack.titleEnglish}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center gap-0.5 pointer-events-none">
                <div className="w-1 bg-[#C41E3A] rounded-full wave-bar-1" />
                <div className="w-1 bg-[#C9B27C] rounded-full wave-bar-2" />
                <div className="w-1 bg-[#C41E3A] rounded-full wave-bar-3" />
                <div className="w-1 bg-[#C9B27C] rounded-full wave-bar-4" />
              </div>
            )}
          </div>

          {/* Title & Artist with Telugu Script */}
          <div className="min-w-0 overflow-hidden space-y-0.5">
            <div className="flex items-center gap-2">
              <span
                className="text-xs sm:text-sm font-semibold text-gray-900 truncate leading-tight hover:underline cursor-pointer"
                onClick={handleNowPlayingToggle}
              >
                {currentTrack.titleEnglish}
              </span>
              {isBackingTrack(currentTrack) && !hasTrackAccess(currentTrack) && (
                <button
                  onClick={() => setShowPreviewLimitModal(true)}
                  className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C9B27C]/20 text-[#E8DCB8] border border-[#C9B27C]/50 hover:bg-[#C9B27C] hover:text-[#0E0305] transition-colors shrink-0"
                  title="30s Studio Preview • Click to Unlock"
                >
                  30s Preview • ₹99
                </button>
              )}
            </div>
            <div className="text-[11px] font-telugu text-[#C9B27C] truncate flex items-center gap-1.5">
              <span className="truncate">{currentTrack.titleTelugu}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500 text-[10px] font-sans truncate">
                {currentTrack.singer || 'Rev. Tony Prakash'}
              </span>
            </div>
          </div>

          {/* Like / Heart Action */}
          <button
            onClick={() => toggleLikeTrack(currentTrack.id)}
            className={`p-1.5 rounded-full transition-transform hover:scale-110 shrink-0 ${
              liked ? 'text-[#C9B27C]' : 'text-gray-500 hover:text-gray-900'
            }`}
            title={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${liked ? 'fill-[#C9B27C]' : ''}`} />
          </button>
        </div>

        {/* ================= CENTER SECTION: Controls & Scrub Bar ================= */}
        <div className="flex flex-col items-center gap-1.5 w-[45%] sm:w-[44%] lg:w-[48%] max-w-2xl">
          {/* Top Control Buttons */}
          <div className="flex items-center gap-2 sm:gap-5">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-full transition-colors relative ${
                shuffle ? 'text-[#C41E3A]' : 'text-gray-500 hover:text-gray-900'
              }`}
              title={shuffle ? 'Shuffle enabled' : 'Shuffle disabled'}
            >
              <Shuffle className="w-4 h-4" />
              {shuffle && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#C41E3A] rounded-full" />
              )}
            </button>

            {/* Previous */}
            <button
              onClick={playPrev}
              className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors hover:scale-105"
              title="Previous song"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>

            {/* Play / Pause Center Button */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#C41E3A] via-[#8B1524] to-[#C41E3A] text-gray-900 flex items-center justify-center shadow-[0_0_20px_rgba(27,124,157,0.5)] border border-[#C9B27C]/40 hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Next */}
            <div className="relative group/skip">
              <button
                onClick={playNext}
                className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors hover:scale-105"
                title={
                  isSubscriber
                    ? 'Next song (Unlimited VIP skips)'
                    : `Next song (${remainingSkips}/6 skips left today)`
                }
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>
              {!isSubscriber && (
                <span
                  className="hidden sm:inline-block absolute -top-1 -right-1 text-[8px] font-mono px-1 rounded-full bg-[#C41E3A]/40 text-[#8CE2FF] border border-[#C41E3A]/60 pointer-events-none"
                  title={`${remainingSkips} free skips left`}
                >
                  {remainingSkips}
                </span>
              )}
            </div>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-full transition-colors relative ${
                repeatMode !== 'off' ? 'text-[#C41E3A]' : 'text-gray-500 hover:text-gray-900'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
              {repeatMode !== 'off' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#C41E3A] rounded-full" />
              )}
            </button>
          </div>

          {/* Bottom Scrub Bar */}
          <div className="w-full flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-mono text-gray-500">
            <span className="w-8 text-right select-none">{formatSeconds(currentTime)}</span>

            {/* Interactive Progress Bar */}
            <div
              ref={progressBarRef}
              onClick={handleProgressBarClick}
              onMouseMove={handleProgressBarMouseMove}
              onMouseLeave={() => setHoverSeekTime(null)}
              className="relative flex-1 h-1.5 bg-gray-100 rounded-full cursor-pointer group py-1 -my-1"
            >
              <div className="absolute inset-0 bg-gray-100 rounded-full overflow-hidden border border-[#C41E3A]/20">
                <div
                  className="h-full bg-gradient-to-r from-[#C41E3A] to-[#C9B27C] rounded-full transition-all group-hover:brightness-110"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#FFFFFF] border border-[#C41E3A] rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-x-1/2"
                style={{ left: `${progressPercent}%` }}
              />

              {hoverSeekTime !== null && (
                <div
                  className="absolute -top-7 -translate-x-1/2 bg-gray-100 border border-gray-200 text-gray-900 text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none"
                  style={{ left: `${hoverSeekPos}px` }}
                >
                  {formatSeconds(hoverSeekTime)}
                </div>
              )}
            </div>

            <span className="w-8 select-none">{formatSeconds(duration)}</span>
          </div>
        </div>

        {/* ================= RIGHT SECTION: Volume & Extras ================= */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 w-[25%] sm:w-[28%] lg:w-[24%]">
          {/* Lyrics Button */}
          <button
            onClick={handleLyricsToggle}
            className={`p-1.5 rounded-lg transition-colors hidden sm:flex ${
              isRightSidebarOpen && rightSidebarTab === 'lyrics'
                ? 'text-[#C9B27C] bg-[#340C14]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            title="Lyrics (సాహిత్యం)"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Queue Button */}
          <button
            onClick={handleQueueToggle}
            className={`p-1.5 rounded-lg transition-colors hidden sm:flex ${
              isRightSidebarOpen && rightSidebarTab === 'queue'
                ? 'text-[#C41E3A] bg-[#340C14]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            title="Queue (రాబోయే గీతాలు)"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Now Playing Panel Toggle */}
          <button
            onClick={handleNowPlayingToggle}
            className={`p-1.5 rounded-lg transition-colors hidden md:flex ${
              isRightSidebarOpen && rightSidebarTab === 'now-playing'
                ? 'text-[#C41E3A] bg-[#340C14]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            title="Now Playing View"
          >
            {isRightSidebarOpen ? (
              <SidebarClose className="w-4 h-4" />
            ) : (
              <SidebarOpen className="w-4 h-4" />
            )}
          </button>

          {/* Volume Control */}
          <div className="hidden lg:flex items-center gap-1.5 w-24 xl:w-28">
            <button
              onClick={toggleMute}
              className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-100 accent-[#C41E3A] rounded-full cursor-pointer"
            />
          </div>

          {/* Fullscreen Player Toggle */}
          <button
            onClick={toggleFullscreenPlayer}
            className={`p-1.5 rounded-lg transition-colors ${
              isFullscreenPlayer
                ? 'text-[#C41E3A] bg-[#340C14]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            title={isFullscreenPlayer ? 'Exit Full Screen' : 'Full Screen Player'}
          >
            {isFullscreenPlayer ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </footer>
  );
};
export default BottomPlayer;
