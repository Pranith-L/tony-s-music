import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  Library,
  Calendar,
  Play,
  Pause,
  Heart,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext.js';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    toggleLikeTrack,
    isLiked,
    toggleFullscreenPlayer,
  } = usePlayer();

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-40 transform-gpu pointer-events-auto select-none">
      {/* 1. Mobile Floating Mini-Player */}
      {currentTrack && (
        <div className="mx-2 mb-1.5 rounded-xl bg-gray-100/95 backdrop-blur-xl border border-[#C41E3A]/40 shadow-2xl overflow-hidden">
          {/* Top subtle progress line */}
          <div className="h-0.5 bg-[#26080F] w-full">
            <div
              className="h-full bg-gradient-to-r from-[#C41E3A] to-[#C9B27C]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="p-2 flex items-center justify-between gap-3">
            {/* Tap track info to expand Fullscreen Player */}
            <div
              onClick={toggleFullscreenPlayer}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#26080F] shrink-0 border border-gray-200">
                <img
                  src={currentTrack.coverImage || '/covers/001_prayermp3.jpg'}
                  alt={currentTrack.titleEnglish}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-telugu text-xs font-bold text-gray-900 truncate">
                  {currentTrack.titleTelugu}
                </p>
                <p className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                  <span>{currentTrack.singer || 'Rev. Tony Prakash'}</span>
                  <span>•</span>
                  <span className="text-[#C9B27C]">{currentTrack.duration}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => toggleLikeTrack(currentTrack.id)}
                className={`p-2 transition-colors ${
                  isLiked(currentTrack.id) ? 'text-[#C9B27C]' : 'text-gray-500'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${isLiked(currentTrack.id) ? 'fill-[#C9B27C]' : ''}`}
                />
              </button>

              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C41E3A] to-[#8B1524] text-gray-900 flex items-center justify-center shadow-md border border-[#C9B27C]/30"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Mobile 4-Tab Bottom Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-2xl border-t border-[#C41E3A]/20 px-4 pt-2 pb-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] flex items-center justify-around">
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            location.pathname === '/' ? 'text-[#C41E3A]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          to="/music"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            location.pathname === '/music' ? 'text-[#C41E3A]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </Link>

        <Link
          to="/library"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            location.pathname.startsWith('/library')
              ? 'text-[#C41E3A]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Library className="w-5 h-5" />
          <span>Library</span>
        </Link>

        <Link
          to="/bookings"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            location.pathname === '/bookings'
              ? 'text-[#C9B27C]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Ministry</span>
        </Link>
      </nav>
    </div>
  );
};
export default MobileNav;
