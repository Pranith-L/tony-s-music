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
      className={`hidden md:flex flex-col h-full pb-28 bg-[#07151D] border-r border-[#1B7C9D]/20 transition-all duration-300 ease-in-out shrink-0 select-none z-30 ${
        collapsed ? 'w-20' : 'w-72 lg:w-80'
      }`}
    >
      {/* 1. App Header / Brand Crest */}
      <div className="p-4 flex items-center justify-between border-b border-[#1B7C9D]/15 bg-gradient-to-b from-[#0B222E]/40 to-transparent">
        <Link
          to="/"
          className={`flex items-center gap-3 group transition-transform ${collapsed ? 'justify-center w-full' : ''}`}
          title="Tony's Music • Rev. Tony Prakash"
        >
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#09212C] via-[#0E5671] to-[#1B7C9D] border-2 border-[#C9B27C]/70 flex items-center justify-center shadow-[0_0_20px_rgba(201,178,124,0.35)] group-hover:scale-105 transition-transform overflow-hidden shrink-0">
            <img
              src="/tony_avatar_cutout.png"
              alt="Tony Prakash"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-0 right-0 w-3 h-3 bg-[#C9B27C] rounded-full border border-[#07151D]" />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-xl font-bold tracking-tight text-[#EDF5F8] group-hover:text-[#C9B27C] transition-colors truncate">
                  TONY'S MUSIC
                </span>
                <span title="Verified Devotional Music Platform">
                  <ShieldCheck className="w-4 h-4 text-[#C9B27C] shrink-0" />
                </span>
              </div>
              <p className="text-[10px] tracking-wider font-telugu text-[#C9B27C] truncate">
                టోనీ ప్రకాష్ సంగీతం • Official Hub
              </p>
            </div>
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-7 h-7 rounded-lg hover:bg-[#12303E] text-[#A5C1CC] hover:text-[#EDF5F8] flex items-center justify-center transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Primary Navigation Cards */}
      <div className="px-2.5 pt-2 pb-1.5 space-y-0.5">
        {mainNav.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-[#1B7C9D]/30 to-[#0E5671]/20 text-[#EDF5F8] border border-[#1B7C9D]/40 shadow-[0_0_15px_rgba(27,124,157,0.2)]'
                  : 'text-[#A5C1CC] hover:text-[#EDF5F8] hover:bg-[#0B222E]'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={item.name}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-[#1B7C9D]' : 'text-[#A5C1CC]'
                }`}
              />
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="truncate leading-tight text-xs">{item.name}</span>
                  <span className="font-telugu text-[9px] text-[#A5C1CC]/60 font-normal truncate">
                    {item.te}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* 3. "Your Library" Section */}
      <div className="flex-1 flex flex-col min-h-0 mx-2 mt-1.5 bg-[#0B222E]/80 backdrop-blur-md rounded-2xl border border-[#1B7C9D]/20 overflow-hidden">
        {/* Library Header */}
        <div
          onClick={() => navigate('/library')}
          className={`px-3 py-2 flex items-center justify-between border-b border-[#1B7C9D]/15 cursor-pointer hover:bg-[#12303E]/50 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="flex items-center gap-2 text-[#EDF5F8]">
            <Library className="w-4 h-4 text-[#1B7C9D]" />
            {!collapsed && (
              <span className="font-semibold text-[11px] tracking-wider uppercase text-[#EDF5F8]">
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
                className="w-6 h-6 rounded-md hover:bg-[#12303E] text-[#A5C1CC] hover:text-[#EDF5F8] flex items-center justify-center transition-colors"
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
                  ? 'bg-[#1B7C9D] text-[#EDF5F8]'
                  : 'bg-[#12303E] text-[#A5C1CC] hover:text-[#EDF5F8]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('PLAYLISTS')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                filterType === 'PLAYLISTS'
                  ? 'bg-[#1B7C9D] text-[#EDF5F8]'
                  : 'bg-[#12303E] text-[#A5C1CC] hover:text-[#EDF5F8]'
              }`}
            >
              Playlists
            </button>
            <button
              onClick={() => setFilterType('ALBUMS')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                filterType === 'ALBUMS'
                  ? 'bg-[#1B7C9D] text-[#EDF5F8]'
                  : 'bg-[#12303E] text-[#A5C1CC] hover:text-[#EDF5F8]'
              }`}
            >
              Albums
            </button>
          </div>
        )}

        {/* Scrollable Playlist/Album List */}
        <div className="flex-1 overflow-y-auto px-1.5 py-1 space-y-0.5 min-h-[100px] scrollbar-thin scrollbar-thumb-[#1B7C9D]/30 scrollbar-track-transparent">
          {/* Liked Songs Playlist Item */}
          {(filterType === 'ALL' || filterType === 'PLAYLISTS') && (
            <Link
              to="/library"
              className={`flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#12303E] transition-all group ${
                collapsed ? 'justify-center' : ''
              }`}
              title="Liked Songs"
            >
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#1B7C9D] via-[#0E5671] to-[#C9B27C] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Heart className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#EDF5F8] truncate group-hover:text-[#C9B27C] transition-colors leading-tight">
                    Liked Songs
                  </div>
                  <div className="text-[10px] text-[#A5C1CC] truncate flex items-center gap-1">
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
                className={`flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#12303E] transition-all group ${
                  collapsed ? 'justify-center' : ''
                }`}
                title={pl.name}
              >
                <div className="w-8 h-8 rounded-md bg-[#0F2B38] border border-[#C9B27C]/30 flex items-center justify-center shrink-0 group-hover:border-[#C9B27C] transition-colors overflow-hidden">
                  {pl.coverImage ? (
                    <img src={pl.coverImage} alt={pl.name} className="w-full h-full object-cover" />
                  ) : (
                    <ListMusic className="w-3.5 h-3.5 text-[#C9B27C]" />
                  )}
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#EDF5F8] truncate group-hover:text-[#C9B27C] transition-colors leading-tight">
                      {pl.name}
                    </div>
                    <div className="text-[10px] text-[#A5C1CC] truncate">
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
                className={`flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#12303E] transition-all group ${
                  collapsed ? 'justify-center' : ''
                }`}
                title={album.titleEnglish}
              >
                <div className="w-8 h-8 rounded-md overflow-hidden bg-[#0F2B38] border border-[#1B7C9D]/30 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <img
                    src={album.coverImage}
                    alt={album.titleEnglish}
                    className="w-full h-full object-cover"
                  />
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#EDF5F8] truncate group-hover:text-[#1B7C9D] transition-colors leading-tight">
                      {album.titleEnglish}
                    </div>
                    <div className="text-[10px] text-[#A5C1CC] truncate flex items-center gap-1 font-telugu">
                      <span className="text-[#C9B27C]">{album.titleTelugu}</span>
                      <span>•</span>
                      <span>{album.releaseYear}</span>
                    </div>
                  </div>
                )}
              </Link>
            ))}
        </div>

        {/* Bottom Pinned Ministry Card - Compact */}
        {!collapsed && (
          <div className="p-2 border-t border-[#1B7C9D]/15 bg-gradient-to-t from-[#07151D] to-transparent shrink-0">
            <div className="p-2 rounded-xl bg-[#09212C] border border-[#C9B27C]/30 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#C9B27C] font-semibold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Live Ministry</span>
                </span>
                <span className="text-[9px] font-mono uppercase bg-[#C9B27C]/20 px-1 py-0.2 rounded text-[#EDF5F8]">
                  Open
                </span>
              </div>
              <p className="text-[10px] text-[#A5C1CC] leading-tight line-clamp-2">
                Invite Rev. Tony Prakash for worship concerts, gospel conventions & retreats.
              </p>
              <Link
                to="/bookings"
                className="w-full flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-md bg-gradient-to-r from-[#1B7C9D] to-[#0E5671] text-[#EDF5F8] text-[10px] font-bold hover:brightness-110 transition-all shadow-sm"
              >
                <Calendar className="w-3 h-3" />
                <span>Book Ministry</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Collapse/Expand Toggle Button at bottom if collapsed */}
      {collapsed && (
        <div className="p-3 flex justify-center border-t border-[#1B7C9D]/15">
          <button
            onClick={onToggleCollapse}
            className="w-9 h-9 rounded-xl bg-[#0B222E] hover:bg-[#12303E] text-[#A5C1CC] hover:text-[#EDF5F8] flex items-center justify-center transition-colors border border-[#1B7C9D]/30"
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
