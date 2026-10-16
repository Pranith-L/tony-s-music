import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Library,
  Music,
  Disc3,
  Video as VideoIcon,
  Heart,
  Plus,
  Sparkles,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ListMusic,
  Radio,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePlaylists } from '../../context/PlaylistContext.js';
import { MOCK_ALBUMS } from '../../services/mockData.js';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { likedTrackIds } = usePlayer();
  const { user } = useAuth();
  const { playlists } = usePlaylists();
  const [filterType, setFilterType] = useState<'ALL' | 'PLAYLISTS' | 'ALBUMS'>('ALL');

  const mainNav = [
    { name: 'Home', te: 'ముఖ్యాంశం', path: '/', icon: Home },
    { name: 'Devotional Songs', te: 'భక్తి గీతాలు (Free)', path: '/music', icon: Music },
    { name: 'Studio Tracks', te: 'స్టూడియో ట్రాక్స్ (₹99)', path: '/tracks', icon: Disc3 },
    { name: 'My Library', te: 'నా లైబ్రరీ', path: '/library', icon: Library },
    { name: 'Worship Videos', te: 'వీడియోలు', path: '/videos', icon: VideoIcon },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col h-full pb-[86px] bg-[#F5F5F7] border-r border-[#E5E5EA] transition-all duration-300 ease-in-out shrink-0 select-none z-30 ${
        collapsed ? 'w-20' : 'w-72 lg:w-80'
      }`}
    >
      {/* 1. App Header / Brand Crest */}
      <div className="py-2.5 px-3.5 flex items-center justify-between border-b border-[#E5E5EA] bg-gradient-to-b from-[#1A060A]/40 to-transparent">
        <Link
          to="/"
          className={`flex items-center gap-2.5 group transition-transform ${collapsed ? 'justify-center w-full' : ''}`}
          title="Tony's Music • Rev. Tony Prakash"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#22070D] via-[#D71A30] to-[#FA243C] border border-[#D4A017]/50 flex items-center justify-center shadow-[0_0_15px_rgba(212,160,23,0.2)] group-hover:scale-105 transition-transform overflow-hidden shrink-0">
            <img
              src="/tony_avatar_cutout.png"
              alt="Tony Prakash"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#D4A017] rounded-full border border-[#0E0305]" />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-lg font-bold tracking-tight text-[#1D1D1F] group-hover:text-[#D4A017] transition-colors truncate">
                  TONY'S MUSIC
                </span>
                <span title="Verified Devotional Music Platform">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
                </span>
              </div>
              <p className="text-[9px] tracking-wider font-telugu text-[#D4A017] truncate">
                టోనీ ప్రకాష్ సంగీతం • Official Hub
              </p>
            </div>
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-6 h-6 rounded-md hover:bg-[#F2F2F7] text-[#86868B] hover:text-[#1D1D1F] flex items-center justify-center transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Primary Navigation Cards */}
      <div className="px-2 pt-1.5 pb-1 space-y-0.5">
        {mainNav.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-[#FA243C]/30 to-[#D71A30]/20 text-[#1D1D1F] border border-[#E5E5EA] shadow-[0_0_15px_rgba(250,36,60,0.15)]'
                  : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={item.name}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-[#FA243C]'
                }`}
              />
              {!collapsed && (
                <div className="flex items-center justify-between min-w-0 flex-1">
                  <span className="truncate text-xs">{item.name}</span>
                  {item.path === '/tracks' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D4A017]/20 text-[#D4A017] font-mono shrink-0">
                      ₹99
                    </span>
                  )}
                  {item.path === '/music' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FA243C]/20 text-[#F5D77F] font-mono shrink-0">
                      Free
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* 3. "Your Library" Section */}
      <div className="flex-1 flex flex-col min-h-0 mx-2 mt-1.5 bg-white rounded-2xl border border-[#E5E5EA] shadow-sm overflow-hidden">
        {/* Library Header */}
        <div
          onClick={() => navigate('/library')}
          className={`px-3 py-2 flex items-center justify-between border-b border-[#E5E5EA] cursor-pointer hover:bg-[#F2F2F7] transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="flex items-center gap-2 text-[#1D1D1F]">
            <Library className="w-4 h-4 text-[#FA243C]" />
            {!collapsed && (
              <span className="font-semibold text-[11px] tracking-wider uppercase text-[#1D1D1F]">
                Your Library
              </span>
            )}
          </div>
          {!collapsed && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/library');
                }}
                className="w-6 h-6 rounded-md hover:bg-[#F2F2F7] text-[#86868B] hover:text-[#1D1D1F] flex items-center justify-center transition-colors"
                title="Create / Open Library"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Library Quick Filter Pills */}
        {!collapsed && (
          <div className="px-2.5 pt-1.5 pb-1 flex gap-1 text-xs overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                filterType === 'ALL'
                  ? 'bg-[#FA243C] text-white'
                  : 'bg-[#F2F2F7] text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('PLAYLISTS')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                filterType === 'PLAYLISTS'
                  ? 'bg-[#FA243C] text-white'
                  : 'bg-[#F2F2F7] text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              Playlists
            </button>
            <button
              onClick={() => setFilterType('ALBUMS')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                filterType === 'ALBUMS'
                  ? 'bg-[#FA243C] text-white'
                  : 'bg-[#F2F2F7] text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              Albums
            </button>
          </div>
        )}

        {/* Scrollable Playlist/Album List */}
        <div className="flex-1 overflow-y-auto px-1.5 py-1 space-y-0.5 min-h-[100px] scrollbar-thin scrollbar-thumb-[#FA243C]/30 scrollbar-track-transparent">
          {/* Liked Songs Playlist Item */}
          {(filterType === 'ALL' || filterType === 'PLAYLISTS') && (
            <Link
              to="/library"
              className={`flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#F2F2F7] transition-all group ${
                collapsed ? 'justify-center' : ''
              }`}
              title="Liked Songs"
            >
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#FA243C] via-[#D71A30] to-[#D4A017] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Heart className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#1D1D1F] truncate group-hover:text-[#D4A017] transition-colors leading-tight">
                    Liked Songs
                  </div>
                  <div className="text-[10px] text-[#86868B] truncate flex items-center gap-1">
                    <span>Playlist</span>
                    <span>•</span>
                    <span className="font-telugu">హృదయ గీతాలు ({likedTrackIds.length})</span>
                  </div>
                </div>
              )}
            </Link>
          )}

          {/* User Playlists */}
          {(filterType === 'ALL' || filterType === 'PLAYLISTS') &&
            playlists.map((pl) => (
              <Link
                key={pl.id}
                to="/library"
                className={`flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#F2F2F7] transition-all group ${
                  collapsed ? 'justify-center' : ''
                }`}
                title={pl.name}
              >
                <div className="w-8 h-8 rounded-md bg-white border border-[#D4A017]/30 flex items-center justify-center shrink-0 group-hover:border-[#D4A017] transition-colors overflow-hidden">
                  {pl.coverImage ? (
                    <img src={pl.coverImage} alt={pl.name} className="w-full h-full object-cover" />
                  ) : (
                    <ListMusic className="w-3.5 h-3.5 text-[#D4A017]" />
                  )}
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#1D1D1F] truncate group-hover:text-[#D4A017] transition-colors leading-tight">
                      {pl.name}
                    </div>
                    <div className="text-[10px] text-[#86868B] truncate">
                      Playlist • {pl.trackIds.length} songs
                    </div>
                  </div>
                )}
              </Link>
            ))}

          {/* Albums in Library */}
          {(filterType === 'ALL' || filterType === 'ALBUMS') &&
            MOCK_ALBUMS.map((album) => (
              <Link
                key={album.id}
                to={`/albums/${album.slug}`}
                className={`flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#F2F2F7] transition-all group ${
                  collapsed ? 'justify-center' : ''
                }`}
                title={album.titleEnglish}
              >
                <div className="w-8 h-8 rounded-md overflow-hidden bg-white border border-[#E5E5EA] shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <img
                    src={album.coverImage}
                    alt={album.titleEnglish}
                    className="w-full h-full object-cover"
                  />
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#1D1D1F] truncate group-hover:text-[#FA243C] transition-colors leading-tight">
                      {album.titleEnglish}
                    </div>
                    <div className="text-[10px] text-[#86868B] truncate flex items-center gap-1 font-telugu">
                      <span className="text-[#D4A017]">{album.titleTelugu}</span>
                      <span>•</span>
                      <span>{album.releaseYear}</span>
                    </div>
                  </div>
                )}
              </Link>
            ))}
        </div>

        {/* Bottom Pinned Ministry Card - Sleek Inline Fit */}
        {!collapsed && (
          <div className="p-2 border-t border-[#E5E5EA] bg-white shrink-0">
            <div className="p-2 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-between gap-2 shadow-sm">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[11px] text-[#D4A017] font-semibold">
                  <Sparkles className="w-3 h-3 text-[#D4A017] shrink-0" />
                  <span className="truncate">Live Ministry</span>
                </div>
                <p className="text-[9px] text-[#86868B] truncate">
                  Concerts & Conventions
                </p>
              </div>
              <Link
                to="/bookings"
                className="px-2.5 py-1 rounded-md bg-[#FA243C] hover:bg-[#D71A30] text-white text-[10px] font-bold transition-all shadow-sm shrink-0 flex items-center gap-1"
              >
                <Calendar className="w-3 h-3" />
                <span>Book</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Collapse/Expand Toggle Button at bottom if collapsed */}
      {collapsed && (
        <div className="p-3 flex justify-center border-t border-[#E5E5EA]">
          <button
            onClick={onToggleCollapse}
            className="w-9 h-9 rounded-xl bg-[#F5F5F7] hover:bg-[#F2F2F7] text-[#86868B] hover:text-[#1D1D1F] flex items-center justify-center transition-colors border border-[#E5E5EA]"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
};
export default Sidebar;
