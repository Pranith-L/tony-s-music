import React from 'react';
import {
  X,
  Music,
  FileText,
  ListMusic,
  Play,
  Pause,
  Sparkles,
  Heart,
  Share2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Disc3,
} from 'lucide-react';
import { usePlayer, RightSidebarTab } from '../../context/PlayerContext.js';

export const RightSidebar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    queue,
    isRightSidebarOpen,
    rightSidebarTab,
    toggleRightSidebar,
    setRightSidebarTab,
    playTrack,
    togglePlay,
    removeFromQueue,
    clearQueue,
    isLiked,
    toggleLikeTrack,
  } = usePlayer();

  if (!isRightSidebarOpen || !currentTrack) return null;

  return (
    <aside className="hidden lg:flex flex-col w-80 xl:w-96 h-full pb-28 bg-white border-l border-gray-200 select-none z-30 shrink-0 transition-all">
      {/* 1. Header with Tab Switcher & Close Button */}
      <div className="p-3.5 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-[#F9FAFB] p-1 rounded-xl border border-[#C41E3A]/25">
          <button
            onClick={() => setRightSidebarTab('now-playing')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              rightSidebarTab === 'now-playing'
                ? 'bg-[#C41E3A] text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span>Now Playing</span>
          </button>

          <button
            onClick={() => setRightSidebarTab('lyrics')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              rightSidebarTab === 'lyrics'
                ? 'bg-[#C41E3A] text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>

          <button
            onClick={() => setRightSidebarTab('queue')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              rightSidebarTab === 'queue'
                ? 'bg-[#C41E3A] text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Queue ({queue.length})</span>
          </button>
        </div>

        <button
          onClick={toggleRightSidebar}
          className="w-7 h-7 rounded-lg hover:bg-[#340C14] text-gray-600 hover:text-gray-900 flex items-center justify-center transition-colors"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Body based on active tab */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ================= TAB 1: NOW PLAYING ================= */}
        {rightSidebarTab === 'now-playing' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Big Artwork Card */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F9FAFB] border border-gray-200 shadow-2xl group">
              <img
                src={currentTrack.coverImage || '/covers/001_prayermp3.jpg'}
                alt={currentTrack.titleEnglish}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9B27C]">
                  {currentTrack.isTrack ? 'Backing Track' : 'Devotional Hymn'}
                </span>
                <h3 className="font-heading text-xl font-bold text-gray-900 truncate">
                  {currentTrack.titleEnglish}
                </h3>
                <p className="font-telugu text-sm text-[#C9B27C] truncate">
                  {currentTrack.titleTelugu}
                </p>
              </div>
            </div>

            {/* Quick Track Meta Details */}
            <div className="p-3.5 rounded-2xl bg-[#F9FAFB]/70 border border-gray-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Singer / Lead</span>
                <span className="font-semibold text-gray-900">
                  {currentTrack.singer || 'Rev. Tony Prakash'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Lyrics & Tunes</span>
                <span className="font-semibold text-gray-900">
                  {currentTrack.lyricist || 'Rev. Tony Prakash'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Category & Year</span>
                <span className="font-semibold text-[#C9B27C]">
                  {currentTrack.category} • {currentTrack.releaseYear}
                </span>
              </div>
            </div>

            {/* About the Artist Card */}
            <div className="rounded-2xl bg-[#F9FAFB] border border-gray-200 overflow-hidden relative group">
              <div className="h-28 overflow-hidden relative">
                <img
                  src="/dad_live.jpg"
                  alt="Rev. Tony Prakash"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A060A] via-[#1A060A]/40 to-transparent" />
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#C41E3A]/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C41E3A]" />
                  <span className="text-[10px] font-mono text-gray-900 font-bold">Verified Artist</span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading text-lg font-bold text-gray-900">Rev. Tony Prakash</h4>
                  <span className="text-[10px] font-mono text-[#C9B27C] bg-[#C9B27C]/15 px-2 py-0.5 rounded-full">
                    30+ Years
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                  Pioneer Telugu Christian gospel songwriter, pastor, and worship leader known for profound devotional classics including ‘శ్రీ యేసు నీ పాద సేవ’ and ‘అబ్రహాము దేవుడవు’.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-gray-900">
                  <span className="text-gray-600">500,000+ Listeners</span>
                  <a
                    href="/about"
                    className="text-[#C41E3A] hover:underline flex items-center gap-1 text-[11px] font-semibold"
                  >
                    View Ministry Bio
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: LYRICS ================= */}
        {rightSidebarTab === 'lyrics' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-[#C41E3A]/25 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9B27C]">
                Official Lyrics
              </span>
              <h4 className="text-sm font-bold text-gray-900 truncate">{currentTrack.titleEnglish}</h4>
              <p className="font-telugu text-xs text-[#C9B27C]">{currentTrack.titleTelugu}</p>
            </div>

            {currentTrack.lyricsTelugu ? (
              <div className="p-4 rounded-2xl bg-[#F9FAFB]/60 border border-[#C41E3A]/15 font-telugu text-xs sm:text-sm leading-loose text-gray-900/90 whitespace-pre-line space-y-3">
                {currentTrack.lyricsTelugu}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-gray-600 space-y-2">
                <FileText className="w-8 h-8 opacity-40 mx-auto text-[#C41E3A]" />
                <p>Instrumental track or minus-one backing track.</p>
                <p className="text-[10px] text-gray-600/70">Enjoy singing along with the audio!</p>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: QUEUE ================= */}
        {rightSidebarTab === 'queue' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Currently Playing Card */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-600 mb-2 block">
                Now Playing
              </span>
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#340C14] border border-[#C41E3A]/40">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0">
                  <img
                    src={currentTrack.coverImage || '/covers/001_prayermp3.jpg'}
                    alt={currentTrack.titleEnglish}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {currentTrack.titleEnglish}
                  </p>
                  <p className="font-telugu text-[10px] text-[#C9B27C] truncate">
                    {currentTrack.titleTelugu}
                  </p>
                </div>
                <button
                  onClick={togglePlay}
                  className="w-7 h-7 rounded-full bg-[#C41E3A] text-white flex items-center justify-center shrink-0"
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Next in Queue */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-600">
                  Next in Queue ({queue.length})
                </span>
                {queue.length > 0 && (
                  <button
                    onClick={clearQueue}
                    className="text-[11px] text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {queue.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-600 space-y-2">
                  <ListMusic className="w-8 h-8 opacity-40 mx-auto text-[#C41E3A]" />
                  <p>Queue is empty.</p>
                  <p className="text-[10px] text-gray-600/70">
                    Use the 3-dots menu on any song to 'Play Next' or 'Add to Queue'.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {queue.map((track, idx) => (
                    <div
                      key={`${track.id}-${idx}`}
                      onClick={() => playTrack(track, queue)}
                      className="group flex items-center justify-between p-2 rounded-xl hover:bg-[#F9FAFB] border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="font-mono text-[10px] text-gray-600 w-4 text-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shrink-0">
                          <img
                            src={track.coverImage || '/covers/001_prayermp3.jpg'}
                            alt={track.titleEnglish}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-[#C41E3A]">
                            {track.titleEnglish}
                          </p>
                          <p className="font-telugu text-[10px] text-[#C9B27C] truncate">
                            {track.titleTelugu}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="font-mono text-[10px] text-gray-600 pr-1">
                          {track.duration}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromQueue(idx);
                          }}
                          className="p-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
export default RightSidebar;
