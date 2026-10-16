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
        <div className="mx-2 mb-1.5 rounded-xl bg-gray-100/95 backdrop-blur-xl border border-[#E5E5EA] shadow-2xl overflow-hidden">
          {/* Top subtle progress line */}
          <div className="h-0.5 bg-white w-full">
            <div
              className="h-full bg-gradient-to-r from-[#FA243C] to-[#D4A017]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="p-2 flex items-center justify-between gap-3">
            {/* Tap track info to expand Fullscreen Player */}
            <div
              onClick={toggleFullscreenPlayer}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 border border-[#E5E5EA]">
                <img
                  src={currentTrack.coverImage || '/covers/001_prayermp3.jpg'}
                  alt={currentTrack.titleEnglish}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-telugu text-xs font-bold text-[#1D1D1F] truncate">
                  {currentTrack.titleTelugu}
                </p>
                <p className="text-[10px] text-[#86868B] truncate flex items-center gap-1">
                  <span>{currentTrack.singer || 'Rev. Tony Prakash'}</span>
                  <span>•</span>
                  <span className="text-[#D4A017]">{currentTrack.duration}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => toggleLikeTrack(currentTrack.id)}
                className={`p-2 transition-colors ${
                  isLiked(currentTrack.id) ? 'text-[#D4A017]' : 'text-[#86868B]'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${isLiked(currentTrack.id) ? 'fill-[#D4A017]' : ''}`}
                />
              </button>

              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FC3C44] to-[#FA243C] text-[#1D1D1F] flex items-center justify-center shadow-md border border-[#D4A017]/30"
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
      <nav className="bg-white/95 backdrop-blur-2xl border-t border-[#E5E5EA] px-4 pt-2 pb-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] flex items-center justify-around">
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            location.pathname === '/' ? 'text-[#FA243C]' : 'text-[#86868B] hover:text-[#1D1D1F]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          to="/music"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            location.pathname === '/music' ? 'text-[#FA243C]' : 'text-[#86868B] hover:text-[#1D1D1F]'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </Link>

        <Link
          to="/library"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            location.pathname.startsWith('/library')
              ? 'text-[#FA243C]'
              : 'text-[#86868B] hover:text-[#1D1D1F]'
          }`}
        >
          <Library className="w-5 h-5" />
          <span>Library</span>
        </Link>

        <Link
          to="/bookings"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            location.pathname === '/bookings'
              ? 'text-[#D4A017]'
              : 'text-[#86868B] hover:text-[#1D1D1F]'
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
