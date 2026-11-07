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
  ChevronUp,
  FileText,
  ListMusic,
  Music2,
  Trash2,
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
    history,
    clearHistory,
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

  const [showFullscreenHistory, setShowFullscreenHistory] = useState<boolean>(false);

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

  // Queue Calculations: Next In Queue must only show songs AFTER the current song
  const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
  const upNextTracks = currentIndex >= 0 ? queue.slice(currentIndex + 1) : queue;
  const sessionPastTracks = currentIndex > 0 ? queue.slice(0, currentIndex) : [];
  const fullHistory = [
    ...sessionPastTracks,
    ...history.filter((h) => !sessionPastTracks.some((s) => s.id === h.id) && h.id !== currentTrack?.id),
  ];

  // Parse lyrics into stanzas
  const lyricsStanzas = currentTrack.lyricsTelugu
    ? currentTrack.lyricsTelugu
        .split('\n\n')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const scrollToMobileLyrics = () => {
    setFullscreenView('player');
    setTimeout(() => {
      const el = document.getElementById('spotify-mobile-lyrics-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  };

  const scrollToMobileTop = () => {
    const el = document.getElementById('fullscreen-mobile-scroll-container');
    if (el) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

      {/* Top Bar: Close / Minimize */}
      <div className="relative z-10 px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between border-b border-[#E5E5EA] bg-white/80 backdrop-blur-xl shrink-0">
        <button
          onClick={toggleFullscreenPlayer}
          className="fullscreen-control-icon p-1.5 sm:p-2 rounded-full hover:bg-black/5 transition-colors"
          title="Minimize player"
        >
          <ChevronDown className="w-5 sm:w-6 h-5 sm:h-6" />
        </button>

        <div className="flex flex-col items-center justify-center max-w-[60%] text-center">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#86868B]">
            {fullscreenView === 'queue' ? 'Up Next Queue' : 'Now Playing'}
          </span>
          <span className="text-xs sm:text-sm font-semibold truncate text-[#1D1D1F] max-w-full">
            {currentTrack.titleEnglish}
          </span>
        </div>

        <button
          onClick={toggleFullscreenPlayer}
          className="fullscreen-control-icon p-1.5 sm:p-2 rounded-full hover:bg-black/5 transition-colors"
          title="Close player"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center p-2 sm:p-5 lg:p-8 overflow-hidden max-w-6xl mx-auto w-full">
        {/* ================= VIEW 1 & 2: PLAYER / LYRICS VIEW ================= */}
        {fullscreenView !== 'queue' && (
          <div className="w-full h-full flex flex-col overflow-hidden animate-fadeIn">
            {/* ---------------- MOBILE LAYOUT (Spotify-Style Smooth Vertical Scroll) ---------------- */}
            <div
              id="fullscreen-mobile-scroll-container"
              className="md:hidden w-full h-full overflow-y-auto overflow-x-hidden space-y-6 pb-28 pt-2 px-3 no-scrollbar"
            >
              {/* FOLD 1: Album Artwork, Song Info & Quick Pills */}
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-210px)] shrink-0 py-2">
                <div
                  className="relative aspect-square w-64 xs:w-72 sm:w-80 max-w-[80vw] rounded-2xl sm:rounded-3xl overflow-hidden border shadow-2xl transition-all duration-500"
                  style={{
                    borderColor: `rgba(${songTheme.primaryRgb}, 0.35)`,
                    boxShadow: `0 20px 45px -10px rgba(${songTheme.primaryRgb}, 0.45)`,
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

                {/* Song Meta */}
                <div className="w-full text-center mt-4 space-y-1 px-4">
                  <h2 className="text-lg sm:text-xl font-bold truncate text-[#1D1D1F]">
                    {currentTrack.titleEnglish}
                  </h2>
                  <p
                    className="font-telugu text-sm sm:text-base truncate font-semibold"
                    style={{ color: songTheme.primary }}
                  >
                    {currentTrack.titleTelugu}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentTrack.singer || 'Rev. Tony Prakash'} • {currentTrack.category || 'Devotional'}
                  </p>
                </div>

                {/* Quick Navigation Pills */}
                <div className="flex items-center gap-2.5 mt-3.5">
                  <button
                    onClick={scrollToMobileLyrics}
                    className="px-3.5 py-1.5 rounded-full border border-[#E5E5EA] bg-white/90 text-xs font-semibold flex items-center gap-1.5 shadow-sm text-gray-700 hover:text-[#FA243C] active:scale-95 transition-transform"
                  >
                    <FileText className="w-3.5 h-3.5" style={{ color: songTheme.primary }} />
                    <span>Scroll to Lyrics ↓</span>
                  </button>
                  <button
                    onClick={() => setFullscreenView('queue')}
                    className="px-3.5 py-1.5 rounded-full border border-[#E5E5EA] bg-white/90 text-xs font-semibold flex items-center gap-1.5 shadow-sm text-gray-700 hover:text-[#FA243C] active:scale-95 transition-transform"
                  >
                    <ListMusic className="w-3.5 h-3.5" style={{ color: songTheme.primary }} />
                    <span>Up Next ({upNextTracks.length})</span>
                  </button>
                </div>

                {/* Scroll Indicator Cue */}
                <div
                  onClick={scrollToMobileLyrics}
                  className="mt-6 w-full max-w-xs flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-black/5 border border-black/10 text-xs text-gray-600 cursor-pointer animate-bounce"
                >
                  <span>Scroll down for lyrics (సాహిత్యం)</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* FOLD 2: Spotify-Style Continuous Lyrics Card */}
              <div
                id="spotify-mobile-lyrics-card"
                className="w-full rounded-3xl p-5 sm:p-6 shadow-2xl border transition-all duration-500 relative"
                style={{
                  background: `linear-gradient(180deg, rgba(${songTheme.primaryRgb}, 0.95) 0%, rgba(${songTheme.secondaryRgb}, 0.98) 100%)`,
                  borderColor: `rgba(${songTheme.primaryRgb}, 0.5)`,
                }}
              >
                <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-200 block">
                      Official Lyrics • సాహిత్యం
                    </span>
                    <h3 className="text-base font-bold text-white truncate mt-0.5">
                      {currentTrack.titleEnglish}
                    </h3>
                  </div>
                  <button
                    onClick={scrollToMobileTop}
                    className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Top</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {lyricsStanzas.length > 0 ? (
                    lyricsStanzas.map((stanza, sIdx) => (
                      <p
                        key={sIdx}
                        className="font-telugu text-lg sm:text-xl font-bold text-white leading-loose whitespace-pre-line tracking-wide drop-shadow-sm"
                      >
                        {stanza}
                      </p>
                    ))
                  ) : (
                    <div className="py-12 text-center text-white/80 space-y-2">
                      <Music2 className="w-10 h-10 mx-auto opacity-50" />
                      <p className="text-sm font-semibold">Instrumental / Backing Track</p>
                      <p className="text-xs text-white/70">Sing along with the audio backing track!</p>
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-white/20 flex items-center justify-between text-xs text-white/75">
                  <span>Composer: {currentTrack.composer || 'Rev. Tony Prakash'}</span>
                  <button
                    onClick={scrollToMobileTop}
                    className="hover:underline flex items-center gap-1 font-semibold"
                  >
                    Back to Top ↑
                  </button>
                </div>
              </div>
            </div>

            {/* ---------------- DESKTOP / LAPTOP LAYOUT (Apple Music Style Full-Height Experience) ---------------- */}
            <div className="hidden md:flex w-full h-full flex-row items-center justify-center gap-8 lg:gap-12 overflow-hidden animate-fadeIn">
              {/* Left Column: Artwork & Info */}
              <div className="flex flex-col items-center justify-center max-w-xs lg:max-w-sm w-full shrink-0">
                <div
                  className="relative aspect-square w-56 md:w-64 lg:w-72 xl:w-80 max-h-[42vh] rounded-3xl overflow-hidden border transition-all duration-700 shadow-2xl group"
                  style={{
                    borderColor: `rgba(${songTheme.primaryRgb}, 0.35)`,
                    boxShadow: `0 24px 50px -12px rgba(${songTheme.primaryRgb}, 0.45)`,
                  }}
                >
                  <img
                    src={currentTrack.coverImage || '/covers/001_prayermp3.jpg'}
                    alt={currentTrack.titleEnglish}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 pointer-events-none">
                      <div className="flex items-center gap-2 text-xs text-white font-mono">
                        <Sparkles
                          className="w-4 h-4 animate-pulse"
                          style={{ color: songTheme.primary }}
                        />
                        <span>Now Playing</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full text-center mt-4 space-y-1">
                  <h2 className="text-lg lg:text-2xl font-bold truncate px-2 text-[#1D1D1F]">
                    {currentTrack.titleEnglish}
                  </h2>
                  <p
                    className="font-telugu text-sm lg:text-lg truncate font-semibold transition-colors duration-500"
                    style={{ color: songTheme.primary }}
                  >
                    {currentTrack.titleTelugu}
                  </p>
                  <p className="text-xs text-gray-500 truncate font-medium">
                    {currentTrack.singer || 'Rev. Tony Prakash'} • {currentTrack.category || 'Devotional'}
                  </p>
                </div>
              </div>

              {/* Right Column: Apple Music Full-Height Synced Lyrics Canvas */}
              <div
                className="flex-1 flex flex-col h-full max-h-[min(72vh,620px)] bg-white/45 backdrop-blur-2xl rounded-3xl border p-6 lg:p-8 shadow-2xl overflow-hidden transition-all duration-500"
                style={{
                  borderColor: `rgba(${songTheme.primaryRgb}, 0.28)`,
                  boxShadow: `0 24px 60px -15px rgba(${songTheme.primaryRgb}, 0.25)`,
                }}
              >
                <div className="flex items-center justify-between border-b border-black/10 pb-3 mb-4 shrink-0">
                  <div
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors duration-500"
                    style={{ color: songTheme.primary }}
                  >
                    <Music2 className="w-4 h-4" />
                    <span>సాహిత్యం • Devotional Lyrics</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-gray-500">
                    <span>Composer: {currentTrack.composer || 'Rev. Tony Prakash'}</span>
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto space-y-6 pr-3 text-left no-scrollbar scrollbar-none">
                  {lyricsStanzas.length > 0 ? (
                    lyricsStanzas.map((stanza, sIdx) => (
                      <div
                        key={sIdx}
                        className="group/stanza transition-all duration-300 rounded-2xl p-2 -mx-2 hover:bg-black/5 cursor-pointer"
                      >
                        <p className="font-telugu text-xl lg:text-2xl xl:text-3xl font-extrabold leading-loose whitespace-pre-line tracking-wide text-[#1D1D1F] group-hover/stanza:text-[#FA243C] transition-colors">
                          {stanza}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12 text-gray-500">
                      <Music2 className="w-12 h-12 opacity-30" />
                      <p className="text-sm font-semibold">
                        Instrumental / Studio Minus-One Backing Track
                      </p>
                      <p className="text-xs text-gray-400 max-w-xs">
                        Enjoy singing along with the original backing track!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 3: UP NEXT / QUEUE VIEW ================= */}
        {fullscreenView === 'queue' && (
          <div className="w-full h-full flex flex-col overflow-hidden animate-fadeIn">
            {/* ---------------- MOBILE QUEUE VIEW (Top Image Banner | Below it Queue & History) ---------------- */}
            <div className="md:hidden w-full h-full overflow-y-auto space-y-4 pb-28 pt-2 px-3 no-scrollbar">
              {/* TOP: Image Banner Card */}
              <div
                className="w-full p-4 rounded-3xl border shadow-xl flex items-center justify-between gap-3 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, rgba(${songTheme.primaryRgb}, 0.20), rgba(${songTheme.secondaryRgb}, 0.15))`,
                  borderColor: `rgba(${songTheme.primaryRgb}, 0.35)`,
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-md">
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
                    <span className="px-2 py-0.5 rounded bg-[#FA243C] text-[9px] font-bold text-white uppercase tracking-wider">
                      Now Playing
                    </span>
                    <h4 className="text-sm font-bold text-[#1D1D1F] truncate mt-1">
                      {currentTrack.titleEnglish}
                    </h4>
                    <p className="text-xs font-telugu text-[#D4A017] truncate font-semibold">
                      {currentTrack.titleTelugu}
                    </p>
                  </div>
                </div>
              </div>

              {/* BELOW IT: Queue Header */}
              <div className="flex items-center justify-between px-1 pt-1">
                <div>
                  <h3 className="text-sm font-bold text-[#1D1D1F]">
                    Up Next • రాబోయే గీతాలు
                  </h3>
                  <p className="text-[11px] text-[#86868B]">
                    {upNextTracks.length} {upNextTracks.length === 1 ? 'song' : 'songs'} remaining
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleShuffle}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                      shuffle
                        ? 'bg-[#FA243C]/10 border-[#FA243C]/40 text-[#FA243C]'
                        : 'bg-[#F5F5F7] border-[#E5E5EA] text-[#86868B]'
                    }`}
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Shuffle</span>
                  </button>

                  {upNextTracks.length > 0 && (
                    <button
                      onClick={clearQueue}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-500 hover:text-red-600 border border-transparent transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* BELOW IT: Up Next Songs List */}
              <div className="space-y-2">
                {upNextTracks.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#86868B] space-y-1.5 bg-[#F9F9FB] rounded-2xl border border-dashed border-[#E5E5EA] p-4">
                    <ListMusic className="w-7 h-7 opacity-40 mx-auto text-[#FA243C]" />
                    <p className="font-semibold text-[#1D1D1F]">End of Queue</p>
                    <p className="text-[10px] text-[#86868B]">Click any album song to queue its hymns.</p>
                  </div>
                ) : (
                  upNextTracks.map((track, idx) => {
                    const actualQueueIndex = currentIndex >= 0 ? currentIndex + 1 + idx : idx;
                    return (
                      <div
                        key={`mob-${track.id}-${actualQueueIndex}`}
                        onClick={() => playTrack(track, queue)}
                        className="group p-2.5 rounded-2xl border border-[#E5E5EA] bg-white flex items-center justify-between gap-3 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-[11px] font-mono text-[#86868B] w-5 text-center shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <img
                            src={track.coverImage || '/covers/001_prayermp3.jpg'}
                            alt={track.titleEnglish}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm"
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-semibold truncate text-[#1D1D1F]">
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
                              removeFromQueue(actualQueueIndex);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* BELOW IT: History Section with Clear History */}
              {fullHistory.length > 0 && (
                <div className="pt-4 border-t border-[#E5E5EA] mt-4">
                  <div className="flex items-center justify-between py-1 px-1">
                    <button
                      onClick={() => setShowFullscreenHistory((prev) => !prev)}
                      className="flex items-center gap-1.5 text-xs font-mono text-[#86868B] hover:text-[#1D1D1F]"
                    >
                      <span className="uppercase tracking-wider font-semibold">
                        Playback History ({fullHistory.length})
                      </span>
                      {showFullscreenHistory ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={clearHistory}
                      className="text-[10px] text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 font-mono"
                      title="Clear history"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear History</span>
                    </button>
                  </div>

                  {showFullscreenHistory && (
                    <div className="space-y-1.5 mt-2">
                      {fullHistory.map((track, pIdx) => (
                        <div
                          key={`fs-mob-prev-${track.id}-${pIdx}`}
                          onClick={() => playTrack(track, queue)}
                          className="group p-2 rounded-xl bg-black/5 flex items-center justify-between text-xs cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="font-mono text-[9px] text-[#86868B] w-4 text-center shrink-0">
                              {pIdx + 1}
                            </span>
                            <img
                              src={track.coverImage || '/covers/001_prayermp3.jpg'}
                              alt={track.titleEnglish}
                              className="w-7 h-7 rounded-lg object-cover shrink-0"
                            />
                            <span className="truncate text-xs text-[#1D1D1F]">
                              {track.titleEnglish}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#86868B]">
                            {track.duration}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ---------------- DESKTOP SPLIT QUEUE VIEW (Left Image Banner | Right Up Next Queue & History) ---------------- */}
            <div className="hidden md:flex w-full h-full flex-row items-center justify-center gap-8 lg:gap-12 overflow-hidden animate-fadeIn">
              {/* Left Column: Image Banner Card */}
              <div className="flex flex-col items-center justify-center max-w-xs lg:max-w-sm w-full shrink-0">
                <div
                  className="relative aspect-square w-56 md:w-64 lg:w-72 xl:w-80 max-h-[42vh] rounded-3xl overflow-hidden border transition-all duration-700 shadow-2xl group"
                  style={{
                    borderColor: `rgba(${songTheme.primaryRgb}, 0.35)`,
                    boxShadow: `0 24px 50px -12px rgba(${songTheme.primaryRgb}, 0.45)`,
                  }}
                >
                  <img
                    src={currentTrack.coverImage || '/covers/001_prayermp3.jpg'}
                    alt={currentTrack.titleEnglish}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 pointer-events-none">
                      <div className="flex items-center gap-2 text-xs text-white font-mono">
                        <Sparkles
                          className="w-4 h-4 animate-pulse"
                          style={{ color: songTheme.primary }}
                        />
                        <span>Now Playing</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full text-center mt-4 space-y-1">
                  <h2 className="text-lg lg:text-2xl font-bold truncate px-2 text-[#1D1D1F]">
                    {currentTrack.titleEnglish}
                  </h2>
                  <p
                    className="font-telugu text-sm lg:text-lg truncate font-semibold transition-colors duration-500"
                    style={{ color: songTheme.primary }}
                  >
                    {currentTrack.titleTelugu}
                  </p>
                  <p className="text-xs text-gray-500 truncate font-medium">
                    {currentTrack.singer || 'Rev. Tony Prakash'} • {currentTrack.category || 'Devotional'}
                  </p>
                </div>
              </div>

              {/* Right Column: Up Next Queue & Below it History */}
              <div className="flex-1 flex flex-col h-full max-h-[min(74vh,640px)] bg-white/60 dark:bg-black/40 backdrop-blur-2xl rounded-3xl border border-[#E5E5EA] dark:border-white/10 p-5 lg:p-6 shadow-2xl overflow-hidden">
                {/* Header with Title and Controls */}
                <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FA243C]/10 text-[#FA243C] flex items-center justify-center">
                      <ListMusic className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F]">
                        Up Next • రాబోయే గీతాలు
                      </h3>
                      <p className="text-[11px] text-[#86868B]">
                        {upNextTracks.length} {upNextTracks.length === 1 ? 'song' : 'songs'} remaining in queue
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

                    {upNextTracks.length > 0 && (
                      <button
                        onClick={clearQueue}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 border border-transparent transition-colors flex items-center gap-1"
                        title="Clear Queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Clear Queue</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Up Next List */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-2 py-3 pr-2 no-scrollbar scrollbar-none">
                  {upNextTracks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#86868B] space-y-2 bg-[#F9F9FB] rounded-2xl border border-dashed border-[#E5E5EA] p-4">
                      <ListMusic className="w-7 h-7 opacity-40 mx-auto text-[#FA243C]" />
                      {repeatMode === 'all' && fullHistory.length > 0 ? (
                        <div>
                          <p className="font-semibold text-[#1D1D1F]">Repeat All Active</p>
                          <p className="text-[10px] text-[#86868B] mt-0.5">
                            Queue will restart from the beginning ({fullHistory[0]?.titleEnglish}).
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-[#1D1D1F]">End of Queue</p>
                          <p className="text-[10px] text-[#86868B] mt-0.5">
                            Click any album song or select more hymns to add them to your queue.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    upNextTracks.map((track, idx) => {
                      const actualQueueIndex = currentIndex >= 0 ? currentIndex + 1 + idx : idx;
                      return (
                        <div
                          key={`${track.id}-${actualQueueIndex}`}
                          onClick={() => playTrack(track, queue)}
                          className="group p-2.5 rounded-xl border border-[#E5E5EA] bg-white hover:bg-[#F2F2F7] flex items-center justify-between gap-3 cursor-pointer transition-all"
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
                              <h5 className="text-xs font-semibold truncate text-[#1D1D1F] group-hover:text-[#FA243C]">
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
                                removeFromQueue(actualQueueIndex);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100 transition-colors"
                              title="Remove from queue"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Below it: The History Section */}
                  {fullHistory.length > 0 && (
                    <div className="pt-3 border-t border-[#E5E5EA] mt-4">
                      <div className="flex items-center justify-between py-1.5 px-2">
                        <button
                          onClick={() => setShowFullscreenHistory((prev) => !prev)}
                          className="flex items-center gap-1.5 text-[11px] font-mono text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                        >
                          <span className="uppercase tracking-wider">
                            Playback History ({fullHistory.length})
                          </span>
                          {showFullscreenHistory ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={clearHistory}
                          className="text-[10px] text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 font-mono"
                          title="Clear playback history"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Clear History</span>
                        </button>
                      </div>

                      {showFullscreenHistory && (
                        <div className="space-y-1.5 mt-2 opacity-85 max-h-48 overflow-y-auto pr-1">
                          {fullHistory.map((track, pIdx) => (
                            <div
                              key={`fs-prev-${track.id}-${pIdx}`}
                              onClick={() => playTrack(track, queue)}
                              className="group p-2 rounded-lg hover:bg-black/5 flex items-center justify-between text-xs cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="font-mono text-[9px] text-[#86868B] w-4 text-center shrink-0">
                                  {pIdx + 1}
                                </span>
                                <img
                                  src={track.coverImage || '/covers/001_prayermp3.jpg'}
                                  alt={track.titleEnglish}
                                  className="w-7 h-7 rounded object-cover shrink-0"
                                />
                                <span className="truncate text-xs text-[#1D1D1F] group-hover:text-[#FA243C]">
                                  {track.titleEnglish}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-[#86868B]">
                                {track.duration}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
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
              {upNextTracks.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 px-1 min-w-[14px] h-[14px] rounded-full bg-[#FA243C] text-[9px] font-bold text-white flex items-center justify-center">
                  {upNextTracks.length}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenPlayer;
