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
      className={`hidden md:flex flex-col h-full pb-[86px] bg-[#0E0305] border-r border-[#C41E3A]/20 transition-all duration-300 ease-in-out shrink-0 select-none z-30 ${
        collapsed ? 'w-20' : 'w-72 lg:w-80'
      }`}
    >
      {/* 1. App Header / Brand Crest */}
      <div className="py-2.5 px-3.5 flex items-center justify-between border-b border-[#C41E3A]/15 bg-gradient-to-b from-[#1A060A]/40 to-transparent">
        <Link
          to="/"
          className={`flex items-center gap-2.5 group transition-transform ${collapsed ? 'justify-center w-full' : ''}`}
          title="Tony's Music • Rev. Tony Prakash"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#22070D] via-[#8B1524] to-[#C41E3A] border border-[#C9B27C]/70 flex items-center justify-center shadow-[0_0_15px_rgba(201,178,124,0.3)] group-hover:scale-105 transition-transform overflow-hidden shrink-0">
            <img
              src="/tony_avatar_cutout.png"
              alt="Tony Prakash"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#C9B27C] rounded-full border border-[#0E0305]" />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-lg font-bold tracking-tight text-[#FFFFFF] group-hover:text-[#C9B27C] transition-colors truncate">
                  TONY'S MUSIC
                </span>
                <span title="Verified Devotional Music Platform">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C9B27C] shrink-0" />
                </span>
              </div>
              <p className="text-[9px] tracking-wider font-telugu text-[#C9B27C] truncate">
                టోనీ ప్రకాష్ సంగీతం • Official Hub
              </p>
            </div>
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-6 h-6 rounded-md hover:bg-[#340C14] text-[#E2CBD0] hover:text-[#FFFFFF] flex items-center justify-center transition-colors"
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
                  ? 'bg-gradient-to-r from-[#C41E3A]/30 to-[#8B1524]/20 text-[#FFFFFF] border border-[#C41E3A]/40 shadow-[0_0_15px_rgba(27,124,157,0.2)]'
                  : 'text-[#E2CBD0] hover:text-[#FFFFFF] hover:bg-[#1A060A]'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={item.name}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-[#C41E3A]' : 'text-[#E2CBD0]'
                }`}
              />
              {!collapsed && (
                <div className="flex items-center justify-between min-w-0 flex-1">
                  <span className="truncate text-xs">{item.name}</span>
                  {item.path === '/tracks' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#C9B27C]/20 text-[#C9B27C] font-mono shrink-0">
                      ₹99
                    </span>
                  )}
                  {item.path === '/music' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#C41E3A]/20 text-[#F5D77F] font-mono shrink-0">
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
      <div className="flex-1 flex flex-col min-h-0 mx-2 mt-1.5 bg-[#1A060A]/80 backdrop-blur-md rounded-2xl border border-[#C41E3A]/20 overflow-hidden">
        {/* Library Header */}
        <div
          onClick={() => navigate('/library')}
          className={`px-3 py-2 flex items-center justify-between border-b border-[#C41E3A]/15 cursor-pointer hover:bg-[#340C14]/50 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="flex items-center gap-2 text-[#FFFFFF]">
            <Library className="w-4 h-4 text-[#C41E3A]" />
            {!collapsed && (
              <span className="font-semibold text-[11px] tracking-wider uppercase text-[#FFFFFF]">
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
                className="w-6 h-6 rounded-md hover:bg-[#340C14] text-[#E2CBD0] hover:text-[#FFFFFF] flex items-center justify-center transition-colors"
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
                  ? 'bg-[#C41E3A] text-[#FFFFFF]'
                  : 'bg-[#340C14] text-[#E2CBD0] hover:text-[#FFFFFF]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('PLAYLISTS')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                filterType === 'PLAYLISTS'
                  ? 'bg-[#C41E3A] text-[#FFFFFF]'
                  : 'bg-[#340C14] text-[#E2CBD0] hover:text-[#FFFFFF]'
              }`}
            >
              Playlists
            </button>
            <button
              onClick={() => setFilterType('ALBUMS')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                filterType === 'ALBUMS'
                  ? 'bg-[#C41E3A] text-[#FFFFFF]'
                  : 'bg-[#340C14] text-[#E2CBD0] hover:text-[#FFFFFF]'
              }`}
            >
              Albums
            </button>
          </div>
        )}

        {/* Scrollable Playlist/Album List */}
        <div className="flex-1 overflow-y-auto px-1.5 py-1 space-y-0.5 min-h-[100px] scrollbar-thin scrollbar-thumb-[#C41E3A]/30 scrollbar-track-transparent">
          {/* Liked Songs Playlist Item */}
          {(filterType === 'ALL' || filterType === 'PLAYLISTS') && (
            <Link
              to="/library"
              className={`flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#340C14] transition-all group ${
                collapsed ? 'justify-center' : ''
              }`}
              title="Liked Songs"
            >
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#C41E3A] via-[#8B1524] to-[#C9B27C] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Heart className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#FFFFFF] truncate group-hover:text-[#C9B27C] transition-colors leading-tight">
                    Liked Songs
                  </div>
                  <div className="text-[10px] text-[#E2CBD0] truncate flex items-center gap-1">
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
                className={`flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#340C14] transition-all group ${
                  collapsed ? 'justify-center' : ''
                }`}
                title={pl.name}
              >
                <div className="w-8 h-8 rounded-md bg-[#26080F] border border-[#C9B27C]/30 flex items-center justify-center shrink-0 group-hover:border-[#C9B27C] transition-colors overflow-hidden">
                  {pl.coverImage ? (
                    <img src={pl.coverImage} alt={pl.name} className="w-full h-full object-cover" />
                  ) : (
                    <ListMusic className="w-3.5 h-3.5 text-[#C9B27C]" />
                  )}
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#FFFFFF] truncate group-hover:text-[#C9B27C] transition-colors leading-tight">
                      {pl.name}
                    </div>
                    <div className="text-[10px] text-[#E2CBD0] truncate">
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
                className={`flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#340C14] transition-all group ${
                  collapsed ? 'justify-center' : ''
                }`}
                title={album.titleEnglish}
              >
                <div className="w-8 h-8 rounded-md overflow-hidden bg-[#26080F] border border-[#C41E3A]/30 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <img
                    src={album.coverImage}
                    alt={album.titleEnglish}
                    className="w-full h-full object-cover"
                  />
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#FFFFFF] truncate group-hover:text-[#C41E3A] transition-colors leading-tight">
                      {album.titleEnglish}
                    </div>
                    <div className="text-[10px] text-[#E2CBD0] truncate flex items-center gap-1 font-telugu">
                      <span className="text-[#C9B27C]">{album.titleTelugu}</span>
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
          <div className="p-2 border-t border-[#C41E3A]/15 bg-gradient-to-t from-[#0E0305] to-transparent shrink-0">
            <div className="p-2 rounded-xl bg-[#22070D]/95 border border-[#C9B27C]/30 flex items-center justify-between gap-2 shadow-sm">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[11px] text-[#C9B27C] font-semibold">
                  <Sparkles className="w-3 h-3 text-[#C9B27C] shrink-0" />
                  <span className="truncate">Live Ministry</span>
                </div>
                <p className="text-[9px] text-[#E2CBD0] truncate">
                  Concerts & Conventions
                </p>
              </div>
              <Link
                to="/bookings"
                className="px-2.5 py-1 rounded-md bg-gradient-to-r from-[#C41E3A] to-[#8B1524] text-[#FFFFFF] text-[10px] font-bold hover:brightness-110 transition-all shadow-sm shrink-0 flex items-center gap-1"
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
        <div className="p-3 flex justify-center border-t border-[#C41E3A]/15">
          <button
            onClick={onToggleCollapse}
            className="w-9 h-9 rounded-xl bg-[#1A060A] hover:bg-[#340C14] text-[#E2CBD0] hover:text-[#FFFFFF] flex items-center justify-center transition-colors border border-[#C41E3A]/30"
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
