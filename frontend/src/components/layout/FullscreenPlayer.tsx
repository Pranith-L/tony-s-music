import React, { useEffect } from 'react';
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
  ListMusic,
  Music2,
  Trash2,
  Disc3,
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
    queue,
    isMuted,
    shuffle,
    repeatMode,
    isFullscreenPlayer,
    fullscreenView,
    setFullscreenView,
    playTrack,
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
    removeFromQueue,
    clearQueue,
  } = usePlayer();

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
      className="fullscreen-player-modal fixed inset-0 z-50 bg-[#F5F5F7] text-[#0F172A] flex flex-col justify-between overflow-hidden animate-fadeIn select-none h-full h-[100dvh]"
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

      {/* Top Bar: Close / Minimize + Responsive Apple Music / Spotify Tab Switcher */}
      <div className="relative z-10 px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between border-b border-[#E5E5EA] bg-white/80 backdrop-blur-xl shrink-0 gap-2">
        <button
          onClick={toggleFullscreenPlayer}
          className="fullscreen-control-icon p-1.5 sm:p-2 rounded-full hover:bg-black/5 transition-colors"
          title="Minimize player"
        >
          <ChevronDown className="w-5 sm:w-6 h-5 sm:h-6" />
        </button>

        {/* View Switcher Tabs: Now Playing | Lyrics | Up Next Queue */}
        <div className="flex items-center gap-1 bg-[#F5F5F7] p-1 rounded-2xl border border-[#E5E5EA] shadow-inner">
          <button
            onClick={() => setFullscreenView('player')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              fullscreenView === 'player'
                ? 'bg-white text-[#FA243C] shadow-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Now Playing</span>
          </button>

          <button
            onClick={() => setFullscreenView('lyrics')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              fullscreenView === 'lyrics'
                ? 'bg-white text-[#FA243C] shadow-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>

          <button
            onClick={() => setFullscreenView('queue')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 relative ${
              fullscreenView === 'queue'
                ? 'bg-white text-[#FA243C] shadow-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Queue</span>
            {queue.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#FA243C]/15 text-[#FA243C] text-[10px] font-bold">
                {queue.length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={toggleFullscreenPlayer}
          className="fullscreen-control-icon p-1.5 sm:p-2 rounded-full hover:bg-black/5 transition-colors"
          title="Close player"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area based on active view */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-5 lg:p-8 overflow-hidden max-w-6xl mx-auto w-full">
        {/* ================= VIEW 1: PLAYER (Artwork + Synced Lyrics side-by-side on desktop) ================= */}
        {fullscreenView === 'player' && (
          <div className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-8 overflow-hidden animate-fadeIn">
            {/* Left: Album Artwork Container */}
            <div className="flex flex-col items-center justify-center max-w-xs sm:max-w-sm w-full shrink-0">
              <div
                className="relative aspect-square w-40 xs:w-48 sm:w-56 md:w-64 lg:w-72 xl:w-80 max-h-[38vh] rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-700 group"
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
                <h2 className="fullscreen-track-title text-sm sm:text-xl font-bold truncate px-2">
                  {currentTrack.titleEnglish}
                </h2>
                <p
                  className="font-telugu text-xs sm:text-base truncate font-semibold transition-colors duration-500"
                  style={{ color: songTheme.primary }}
                >
                  {currentTrack.titleTelugu}
                </p>
                <p className="fullscreen-track-meta text-[11px] truncate font-medium">
                  {currentTrack.singer || 'Rev. Tony Prakash'} • {currentTrack.category || 'Worship'}
                </p>
              </div>

              {/* Mobile Quick Action Pills */}
              <div className="flex items-center gap-2 mt-2.5 md:hidden">
                <button
                  onClick={() => setFullscreenView('lyrics')}
                  className="px-3 py-1 rounded-full border border-[#E5E5EA] bg-white/80 text-[11px] font-semibold flex items-center gap-1.5 shadow-sm text-gray-700 hover:text-[#FA243C]"
                >
                  <FileText className="w-3.5 h-3.5" style={{ color: songTheme.primary }} />
                  <span>Lyrics</span>
                </button>
                <button
                  onClick={() => setFullscreenView('queue')}
                  className="px-3 py-1 rounded-full border border-[#E5E5EA] bg-white/80 text-[11px] font-semibold flex items-center gap-1.5 shadow-sm text-gray-700 hover:text-[#FA243C]"
                >
                  <ListMusic className="w-3.5 h-3.5" style={{ color: songTheme.primary }} />
                  <span>Up Next ({queue.length})</span>
                </button>
              </div>
            </div>

            {/* Right: Synced Lyrics Display (Visible on desktop) */}
            <div
              className="hidden md:flex flex-1 flex-col h-full max-h-[min(54vh,460px)] bg-white/85 backdrop-blur-xl rounded-3xl border p-4 sm:p-6 shadow-sm overflow-hidden transition-all duration-500"
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
                <span className="fullscreen-composer-text text-[11px] font-mono">
                  Composer: {currentTrack.composer || 'Rev. Tony Prakash'}
                </span>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 text-left no-scrollbar scrollbar-none">
                {currentTrack.lyricsTelugu ? (
                  <div className="fullscreen-lyrics-content space-y-4 font-telugu text-sm sm:text-base leading-relaxed whitespace-pre-line">
                    {currentTrack.lyricsTelugu}
                  </div>
                ) : (
                  <div className="fullscreen-lyrics-empty h-full flex flex-col items-center justify-center text-center space-y-2 py-8">
                    <Music2 className="w-8 h-8 opacity-40" />
                    <p className="text-xs">
                      Instrumental / Studio Minus-One Backing Track. Sing along with the choir backing!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 2: FULL LYRICS VIEW ================= */}
        {fullscreenView === 'lyrics' && (
          <div
            className="w-full max-w-2xl h-full max-h-[min(65vh,520px)] bg-white/90 backdrop-blur-2xl rounded-3xl border p-4 sm:p-7 shadow-xl overflow-hidden flex flex-col animate-fadeIn"
            style={{ borderColor: `rgba(${songTheme.primaryRgb}, 0.3)` }}
          >
            <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-3 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: songTheme.primary }} />
                <span className="font-bold text-sm text-[#1D1D1F]">
                  {currentTrack.titleEnglish} • సాహిత్యం
                </span>
              </div>
              <span className="text-[11px] font-mono text-gray-500">
                {currentTrack.singer || 'Rev. Tony Prakash'}
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-2 text-center no-scrollbar scrollbar-none">
              {currentTrack.lyricsTelugu ? (
                <div className="space-y-4 font-telugu text-sm sm:text-base leading-relaxed whitespace-pre-line text-[#1D1D1F]">
                  {currentTrack.lyricsTelugu}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2 py-12">
                  <Music2 className="w-10 h-10 opacity-30 text-gray-400" />
                  <p className="text-xs text-gray-500">
                    Studio Minus-One backing track with no lead vocals.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= VIEW 3: UP NEXT / QUEUE VIEW (Spotify & Apple Music mobile style) ================= */}
        {fullscreenView === 'queue' && (
          <div className="w-full max-w-2xl h-full max-h-[min(65vh,540px)] bg-white/92 backdrop-blur-2xl rounded-3xl border border-[#E5E5EA] shadow-2xl overflow-hidden flex flex-col p-3.5 sm:p-6 animate-fadeIn">
            {/* Queue Header with Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA] shrink-0">
              <div className="flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-[#FA243C]" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F]">
                    Up Next • రాబోయే గీతాలు
                  </h3>
                  <p className="text-[11px] text-[#86868B]">
                    {queue.length} {queue.length === 1 ? 'song' : 'songs'} in active queue
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleShuffle}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    shuffle
                      ? 'bg-[#FA243C]/10 border-[#FA243C]/40 text-[#FA243C]'
                      : 'bg-[#F5F5F7] border-[#E5E5EA] text-[#86868B]'
                  }`}
                  title="Toggle Shuffle"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Shuffle</span>
                </button>

                <button
                  onClick={clearQueue}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 border border-transparent transition-colors flex items-center gap-1"
                  title="Clear Queue"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Clear</span>
                </button>
              </div>
            </div>

            {/* Scrollable Song Queue */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 py-3 pr-1 no-scrollbar scrollbar-none">
              {/* NOW PLAYING CARD */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent border border-[#FA243C]/30 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-md">
                    <img
                      src={currentTrack.coverImage || '/covers/001_prayermp3.jpg'}
                      alt={currentTrack.titleEnglish}
                      className="w-full h-full object-cover"
                    />
                    {isPlaying && (
                      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center gap-0.5">
                        <div className="w-1 h-3 bg-[#FA243C] rounded-full wave-bar-1" />
                        <div className="w-1 h-4 bg-[#D4A017] rounded-full wave-bar-2" />
                        <div className="w-1 h-2 bg-[#FA243C] rounded-full wave-bar-3" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#FA243C] text-[9px] font-bold text-white uppercase tracking-wider">
                        Now Playing
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1D1D1F] truncate mt-0.5">
                      {currentTrack.titleEnglish}
                    </h4>
                    <p className="text-[11px] font-telugu text-[#D4A017] truncate">
                      {currentTrack.titleTelugu}
                    </p>
                  </div>
                </div>

                <button
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-full bg-[#FA243C] text-white flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-transform shrink-0"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              </div>

              {/* UP NEXT SECTION */}
              <div className="pt-2 pb-1 flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider px-1">
                <span>Playing Next</span>
                <span>{queue.length} Tracks Total</span>
              </div>

              {queue.map((track, idx) => {
                const isThisCurrent = track.id === currentTrack.id;
                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => playTrack(track)}
                    className={`group p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isThisCurrent
                        ? 'bg-[#FA243C]/5 border-[#FA243C]/25 shadow-sm'
                        : 'bg-white hover:bg-[#F2F2F7] border-[#E5E5EA]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] font-mono text-[#86868B] w-5 text-center shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <img
                        src={track.coverImage || '/covers/001_prayermp3.jpg'}
                        alt={track.titleEnglish}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-sm"
                      />
                      <div className="min-w-0">
                        <h5
                          className={`text-xs font-semibold truncate ${
                            isThisCurrent ? 'text-[#FA243C]' : 'text-[#1D1D1F]'
                          }`}
                        >
                          {track.titleEnglish}
                        </h5>
                        <p className="text-[10px] font-telugu text-[#86868B] truncate">
                          {track.titleTelugu}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-[#86868B]">
                        {track.duration || '5:12'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(idx);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100 transition-colors"
                        title="Remove from queue"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
          <div className="flex justify-between text-[11px] font-mono">
            <span className="fullscreen-timestamp">{formatSeconds(currentTime)}</span>
            <span className="fullscreen-timestamp">{formatSeconds(duration)}</span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="max-w-xl mx-auto flex items-center justify-between">
          {/* Like Heart */}
          <button
            onClick={() => toggleLikeTrack(currentTrack.id)}
            className="p-2 rounded-full transition-transform hover:scale-110"
            style={{ color: liked ? songTheme.primary : '#475569' }}
            title={liked ? 'Liked' : 'Like'}
          >
            <Heart className={`w-5 sm:w-6 h-5 sm:h-6 ${liked ? 'fill-current' : ''}`} />
          </button>

          {/* Transport Controls */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={toggleShuffle}
              className="p-2 rounded-full transition-colors relative"
              style={{ color: shuffle ? songTheme.primary : '#475569' }}
              title={shuffle ? 'Shuffle On' : 'Shuffle Off'}
            >
              <Shuffle className="w-4 sm:w-5 h-4 sm:h-5" />
              {shuffle && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: songTheme.primary }}
                />
              )}
            </button>

            <button
              onClick={playPrev}
              className="fullscreen-control-icon p-2 transition-colors hover:scale-105 active:scale-95"
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
              className="fullscreen-control-icon p-2 transition-colors hover:scale-105 active:scale-95"
              title="Next"
            >
              <SkipForward className="w-6 sm:w-7 h-6 sm:h-7 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className="p-2 rounded-full transition-colors relative"
              style={{ color: repeatMode !== 'off' ? songTheme.primary : '#475569' }}
              title={`Repeat: ${repeatMode.toUpperCase()}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 sm:w-5 h-4 sm:h-5" />
              ) : (
                <Repeat className="w-4 sm:w-5 h-4 sm:h-5" />
              )}
              {repeatMode !== 'off' && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: songTheme.primary }}
                />
              )}
            </button>
          </div>

          {/* Right Extras: Queue Switcher & Volume */}
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <button
              onClick={() => setFullscreenView(fullscreenView === 'queue' ? 'player' : 'queue')}
              className={`p-2 rounded-full transition-colors relative ${
                fullscreenView === 'queue' ? 'text-[#FA243C] bg-black/5' : 'text-gray-500 hover:text-black'
              }`}
              title="Up Next / Queue"
            >
              <ListMusic className="w-5 h-5" />
              {queue.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 px-1 min-w-[14px] h-[14px] rounded-full bg-[#FA243C] text-[9px] font-bold text-white flex items-center justify-center">
                  {queue.length}
                </span>
              )}
            </button>

            <div className="hidden lg:flex items-center gap-2 w-28">
              <button onClick={toggleMute} className="fullscreen-control-icon p-1 transition-colors">
                {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#CBD5E1] rounded-full"
                style={{ accentColor: songTheme.primary }}
              />
            </div>

            <button
              onClick={toggleMute}
              className="lg:hidden p-2 fullscreen-control-icon transition-colors"
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