import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ListMusic,
  Plus,
  Play,
  Pause,
  Shuffle,
  Trash2,
  Edit2,
  Heart,
  Disc3,
  Search,
  Music,
  Check,
  X,
  ChevronLeft,
  Share2,
  LogIn,
  Sparkles,
} from 'lucide-react';
import { usePlaylists, Playlist } from '../context/PlaylistContext.js';
import { usePlayer } from '../context/PlayerContext.js';
import { useAuth } from '../context/AuthContext.js';
import { Track } from '../types/index.js';
import { api } from '../services/api.js';
import { TrackActionMenu } from '../components/layout/TrackActionMenu.js';
import { Link } from 'react-router-dom';

export const LibraryPage: React.FC = () => {
  const { user } = useAuth();
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    updatePlaylist,
    removeTrackFromPlaylist,
    addTrackToPlaylist,
    isTrackInPlaylist,
  } = usePlaylists();

  const {
    playTrack,
    playOrToggleTrack,
    currentTrack,
    isPlaying,
    isLiked,
    likedTrackIds,
    hasTrackAccess,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<'playlists' | 'liked' | 'purchased'>('playlists');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

  // Delete Playlist confirmation modal state
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);

  // New Playlist Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  // Edit Playlist Modal state
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Add Songs Drawer / Modal within playlist
  const [showAddSongsModal, setShowAddSongsModal] = useState(false);
  const [searchSongQuery, setSearchSongQuery] = useState('');

  // Load all tracks from API / mock catalog
  useEffect(() => {
    let mounted = true;
    const fetchCatalog = async () => {
      setIsLoadingTracks(true);
      try {
        const data = await api.tracks.getAll();
        if (mounted) setAllTracks(data);
      } catch (e) {
        console.error('Failed to load catalog for library', e);
      } finally {
        if (mounted) setIsLoadingTracks(false);
      }
    };
    fetchCatalog();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedPlaylist = useMemo(() => {
    return playlists.find((p) => p.id === selectedPlaylistId) || null;
  }, [playlists, selectedPlaylistId]);

  // Tracks in the selected playlist
  const playlistTracks = useMemo(() => {
    if (!selectedPlaylist) return [];
    return selectedPlaylist.trackIds
      .map((id) => allTracks.find((t) => t.id === id))
      .filter((t): t is Track => Boolean(t));
  }, [selectedPlaylist, allTracks]);

  // Liked tracks from catalog
  const userLikedTracks = useMemo(() => {
    return allTracks.filter((t) => likedTrackIds.includes(t.id));
  }, [allTracks, likedTrackIds]);

  // Purchased backing tracks
  const userPurchasedTracks = useMemo(() => {
    return allTracks.filter((t) => t.isTrack && hasTrackAccess(t));
  }, [allTracks, user?.purchases]);

  // Handle Play Playlist
  const handlePlayPlaylist = (tracksToPlay: Track[], shuffle = false) => {
    if (tracksToPlay.length === 0) return;
    const list = shuffle ? [...tracksToPlay].sort(() => Math.random() - 0.5) : tracksToPlay;
    playTrack(list[0], list);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const created = createPlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreateModal(false);
    setSelectedPlaylistId(created.id);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlaylist || !editName.trim()) return;
    updatePlaylist(editingPlaylist.id, editName.trim(), editDesc.trim());
    setEditingPlaylist(null);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-red-50/60 via-white to-amber-50/50 border border-[#E5E5EA] shadow-apple-card overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#FA243C]/10 text-[#FA243C] border border-[#FA243C]/20">
                Personal Library
              </span>
              <span className="font-telugu text-xs text-[#D4A017]">మీ వ్యక్తిగత లైబ్రరీ</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#1D1D1F]">
              {user ? `${user.name}'s Sanctuary` : 'Your Music Library'}
            </h1>
            <p className="text-xs sm:text-sm text-[#86868B]">
              Manage custom devotional playlists, explore your liked hymns, and replay purchased backing tracks.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!user ? (
              <Link
                to="/auth"
                className="px-4 py-2.5 rounded-2xl bg-white border border-[#E5E5EA] text-xs font-bold text-[#1D1D1F] hover:bg-[#F2F2F7] flex items-center gap-2 transition-all shadow-sm"
              >
                <LogIn className="w-4 h-4 text-[#FA243C]" />
                <span>Log In / Sign Up</span>
              </Link>
            ) : null}

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#FA243C] hover:bg-[#D71A30] text-xs font-bold text-white flex items-center gap-2 shadow-sm shadow-[#FA243C]/25 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Playlist</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Library Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E5EA] dark:border-[#27272A] pb-3 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          onClick={() => {
            setActiveTab('playlists');
            setSelectedPlaylistId(null);
          }}
          className={`px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === 'playlists'
              ? 'bg-[#FA243C] text-white shadow-sm'
              : 'text-[#86868B] dark:text-[#A1A1AA] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-[#F2F2F7] dark:hover:bg-white/5'
          }`}
        >
          <ListMusic className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">Playlists ({playlists.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('liked');
            setSelectedPlaylistId(null);
          }}
          className={`px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === 'liked'
              ? 'bg-[#FA243C] text-white shadow-sm'
              : 'text-[#86868B] dark:text-[#A1A1AA] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-[#F2F2F7] dark:hover:bg-white/5'
          }`}
        >
          <Heart className="w-4 h-4 text-[#D4A017] shrink-0" />
          <span className="whitespace-nowrap">Liked Songs ({userLikedTracks.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('purchased');
            setSelectedPlaylistId(null);
          }}
          className={`px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === 'purchased'
              ? 'bg-[#FA243C] text-white shadow-sm'
              : 'text-[#86868B] dark:text-[#A1A1AA] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-[#F2F2F7] dark:hover:bg-white/5'
          }`}
        >
          <Disc3 className="w-4 h-4 text-[#D4A017] shrink-0" />
          <span className="whitespace-nowrap">Purchased Tracks ({userPurchasedTracks.length})</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* ================= PLAYLISTS TAB ================= */}
      {activeTab === 'playlists' && (
        <div>
          {/* Detail View of a Selected Playlist */}
          {selectedPlaylist ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Back to Playlists Button */}
              <button
                onClick={() => setSelectedPlaylistId(null)}
                className="inline-flex items-center gap-1.5 text-xs text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to all playlists</span>
              </button>

              {/* Playlist Billboard */}
              <div className="rounded-3xl p-4 sm:p-8 bg-white border border-[#E5E5EA] shadow-apple-card flex flex-col md:flex-row gap-5 sm:gap-6 items-start md:items-end">
                <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#FFF0F2] via-white to-red-100 border border-[#E5E5EA] shadow-md flex items-center justify-center shrink-0">
                  {selectedPlaylist.coverImage ? (
                    <img
                      src={selectedPlaylist.coverImage}
                      alt={selectedPlaylist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ListMusic className="w-16 h-16 text-[#FA243C]" />
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1 w-full">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D4A017]">
                    Devotional Playlist
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#1D1D1F] truncate">
                    {selectedPlaylist.name}
                  </h2>
                  {selectedPlaylist.description && (
                    <p className="text-xs sm:text-sm text-[#86868B] max-w-2xl line-clamp-2 sm:line-clamp-none">
                      {selectedPlaylist.description}
                    </p>
                  )}
                  <p className="text-xs text-[#86868B]/80 pt-0.5">
                    Created by <strong className="text-[#1D1D1F] font-semibold">{user?.name || 'You'}</strong> •{' '}
                    {playlistTracks.length} {playlistTracks.length === 1 ? 'song' : 'songs'}
                  </p>
                </div>

                {/* Playlist Action Toolbar: Circular round play button so all actions fit cleanly */}
                <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto pt-2 sm:pt-0 shrink-0">
                  {/* Round Play All Button */}
                  <button
                    onClick={() => handlePlayPlaylist(playlistTracks, false)}
                    disabled={playlistTracks.length === 0}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#FC3C44] to-[#FA243C] text-white hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg hover:shadow-red-500/30 transition-all shrink-0 disabled:opacity-40"
                    title="Play All"
                    aria-label="Play All"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>

                  {/* Round Shuffle Button */}
                  <button
                    onClick={() => handlePlayPlaylist(playlistTracks, true)}
                    disabled={playlistTracks.length === 0}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F5F5F7] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#27272A] text-[#86868B] hover:text-[#FA243C] hover:bg-[#FEE2E2] dark:hover:bg-white/10 flex items-center justify-center transition-all shrink-0 disabled:opacity-40"
                    title="Shuffle Play"
                    aria-label="Shuffle Play"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>

                  {/* Add Songs Pill Button */}
                  <button
                    onClick={() => setShowAddSongsModal(true)}
                    className="h-10 sm:h-11 px-3.5 sm:px-4 rounded-full bg-[#F5F5F7] dark:bg-[#202023] border border-[#FA243C]/40 text-xs font-bold text-[#FA243C] hover:text-white hover:bg-[#FA243C] flex items-center gap-1.5 transition-all shrink-0"
                    title="Add Songs to Playlist"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Songs</span>
                  </button>

                  {/* Round Edit Button */}
                  <button
                    onClick={() => {
                      setEditingPlaylist(selectedPlaylist);
                      setEditName(selectedPlaylist.name);
                      setEditDesc(selectedPlaylist.description || '');
                    }}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F5F5F7] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#27272A] text-[#86868B] hover:text-[#FA243C] hover:bg-[#FEE2E2] dark:hover:bg-white/10 flex items-center justify-center transition-all shrink-0"
                    title="Edit Playlist Details"
                    aria-label="Edit Playlist Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Round Delete Button */}
                  <button
                    type="button"
                    onClick={() => setPlaylistToDelete(selectedPlaylist)}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F5F5F7] dark:bg-[#202023] border border-rose-300 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-500 transition-all flex items-center justify-center shrink-0"
                    title="Delete Playlist"
                    aria-label="Delete Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Playlist Tracks Table */}
              <div className="bg-[#F5F5F7]/60 dark:bg-[#1C1C1E]/60 rounded-3xl border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-xl overflow-hidden">
                {playlistTracks.length === 0 ? (
                  <div className="py-16 text-center space-y-4 px-4">
                    <Music className="w-12 h-12 text-[#86868B]/40 mx-auto" />
                    <h4 className="text-base font-semibold text-[#1D1D1F]">This playlist is empty</h4>
                    <p className="text-xs text-[#86868B] max-w-sm mx-auto">
                      Add your favorite Telugu devotional hymns and worship tracks to start listening.
                    </p>
                    <button
                      onClick={() => setShowAddSongsModal(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FA243C] hover:bg-[#D71A30] text-xs font-bold text-white transition-all shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Find & Add Songs</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#FA243C]/10">
                    {playlistTracks.map((track, idx) => {
                      const isCurrent = currentTrack?.id === track.id;
                      const isThisPlaying = isCurrent && isPlaying;

                      return (
                        <div
                          key={track.id}
                          onClick={() => playOrToggleTrack(track, playlistTracks)}
                          className={`group flex items-center justify-between px-3.5 py-3 sm:px-6 sm:py-3.5 transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-[#FA243C]/10 dark:bg-[#FA243C]/20 border-l-4 border-l-[#FA243C]'
                              : 'hover:bg-[#F2F2F7] dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            <span className="font-mono text-xs text-[#86868B] w-5 text-center shrink-0">
                              {isThisPlaying ? (
                                <div className="flex items-end justify-center gap-0.5 h-3.5">
                                  <span className="w-0.5 bg-[#D4A017] rounded-full wave-bar-1" />
                                  <span className="w-0.5 bg-[#D4A017] rounded-full wave-bar-2" />
                                  <span className="w-0.5 bg-[#D4A017] rounded-full wave-bar-3" />
                                </div>
                              ) : (
                                idx + 1
                              )}
                            </span>

                            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#F2F2F7] dark:bg-[#202023] shrink-0 border border-[#E5E5EA] dark:border-[#27272A]">
                              <img
                                src={track.coverImage || '/covers/001_prayermp3.jpg'}
                                alt={track.titleEnglish}
                                className="w-full h-full object-cover"
                              />
                              <div
                                className={`absolute inset-0 bg-black/45 flex items-center justify-center transition-all ${
                                  isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}
                              >
                                {isThisPlaying ? (
                                  <Pause className="w-4 h-4 text-white fill-current" />
                                ) : (
                                  <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                                )}
                              </div>
                            </div>

                            <div className="min-w-0 flex-1 pr-2">
                              <h4
                                className={`text-sm font-bold truncate transition-colors ${
                                  isCurrent
                                    ? 'text-[#FA243C] dark:text-[#FF455A]'
                                    : 'text-[#1D1D1F] dark:text-white group-hover:text-[#FA243C]'
                                }`}
                              >
                                {track.titleEnglish}
                              </h4>
                              <p
                                className={`font-telugu text-xs truncate mt-0.5 transition-colors ${
                                  isCurrent
                                    ? 'text-[#D4A017] dark:text-[#E5B842] font-semibold'
                                    : 'text-[#86868B] dark:text-[#A1A1AA] group-hover:text-[#48484A] dark:group-hover:text-zinc-300'
                                }`}
                              >
                                {track.titleTelugu}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`font-mono text-xs hidden sm:inline-block px-2 ${
                                isCurrent ? 'text-[#FA243C] font-semibold' : 'text-[#86868B] dark:text-[#A1A1AA]'
                              }`}
                            >
                              {track.duration}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTrackFromPlaylist(selectedPlaylist.id, track.id);
                              }}
                              className="p-1.5 rounded-full text-[#86868B] hover:text-rose-500 hover:bg-white dark:hover:bg-white/10 transition-colors"
                              title="Remove from playlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <TrackActionMenu track={track} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Playlists Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 animate-fadeIn">
              {/* Create New Card */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="group flex flex-col items-center justify-center p-6 rounded-3xl bg-[#F5F5F7]/40 border-2 border-dashed border-[#E5E5EA] hover:border-[#D4A017] hover:bg-[#F5F5F7]/80 transition-all text-center space-y-3 min-h-[220px]"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#F2F2F7] border border-[#E5E5EA] group-hover:scale-110 flex items-center justify-center transition-transform text-[#FA243C] group-hover:text-[#D4A017]">
                  <Plus className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1D1D1F] group-hover:text-[#FA243C] transition-colors">
                    Create Playlist
                  </h4>
                  <p className="text-[11px] text-[#86868B] mt-1">కొత్త ప్లేలిస్ట్ తయారుచేయండి</p>
                </div>
              </button>

              {/* User Playlists */}
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylistId(pl.id)}
                  className="group relative flex flex-col justify-between p-4 rounded-3xl bg-white hover:bg-[#F2F2F7] border border-[#E5E5EA] hover:border-[#FA243C]/40 transition-all cursor-pointer shadow-apple-card hover:shadow-apple-hover hover:-translate-y-1"
                >
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-tr from-[#FFF0F2] via-white to-red-100 border border-[#E5E5EA] mb-3 flex items-center justify-center">
                    {pl.coverImage ? (
                      <img src={pl.coverImage} alt={pl.name} className="w-full h-full object-cover" />
                    ) : (
                      <ListMusic className="w-12 h-12 text-[#FA243C]" />
                    )}

                    {/* Quick Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FC3C44] to-[#FA243C] text-white flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Delete Button on Card */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlaylistToDelete(pl);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-10 shadow-md"
                      title="Delete Playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <h4 className="font-bold text-sm text-[#1D1D1F] truncate group-hover:text-[#FA243C] transition-colors">
                      {pl.name}
                    </h4>
                    <p className="text-[11px] text-[#86868B] truncate">
                      {pl.trackIds.length} {pl.trackIds.length === 1 ? 'song' : 'songs'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= LIKED SONGS TAB ================= */}
      {activeTab === 'liked' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#86868B]">
              {userLikedTracks.length} Saved Devotional Songs
            </span>
            {userLikedTracks.length > 0 && (
              <button
                onClick={() => handlePlayPlaylist(userLikedTracks, false)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FC3C44] to-[#FA243C] text-xs font-bold text-white flex items-center gap-2 hover:brightness-110 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play All Liked</span>
              </button>
            )}
          </div>

          <div className="bg-[#F5F5F7]/60 dark:bg-[#1C1C1E]/60 rounded-3xl border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-xl overflow-hidden">
            {userLikedTracks.length === 0 ? (
              <div className="py-16 text-center space-y-3 px-4">
                <Heart className="w-12 h-12 text-[#86868B]/30 mx-auto" />
                <h4 className="text-base font-semibold text-[#1D1D1F]">No liked songs yet</h4>
                <p className="text-xs text-[#86868B]">
                  Tap the heart icon on any song while listening to save it to your library.
                </p>
                <Link
                  to="/music"
                  className="inline-block mt-2 px-5 py-2.5 rounded-full bg-[#FA243C] text-xs font-bold text-white"
                >
                  Explore Songs
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#FA243C]/10">
                {userLikedTracks.map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  const isThisPlaying = isCurrent && isPlaying;

                  return (
                    <div
                      key={track.id}
                      onClick={() => playOrToggleTrack(track, userLikedTracks)}
                      className={`group flex items-center justify-between px-3.5 py-3 sm:px-6 sm:py-3.5 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#FA243C]/10 dark:bg-[#FA243C]/20 border-l-4 border-l-[#FA243C]'
                          : 'hover:bg-[#F2F2F7] dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <span className="font-mono text-xs text-[#86868B] w-5 text-center shrink-0">
                          {isThisPlaying ? (
                            <div className="flex items-end justify-center gap-0.5 h-3.5">
                              <span className="w-0.5 bg-[#D4A017] rounded-full wave-bar-1" />
                              <span className="w-0.5 bg-[#D4A017] rounded-full wave-bar-2" />
                              <span className="w-0.5 bg-[#D4A017] rounded-full wave-bar-3" />
                            </div>
                          ) : (
                            idx + 1
                          )}
                        </span>

                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#F2F2F7] dark:bg-[#202023] shrink-0 border border-[#E5E5EA] dark:border-[#27272A]">
                          <img
                            src={track.coverImage || '/covers/001_prayermp3.jpg'}
                            alt={track.titleEnglish}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className={`absolute inset-0 bg-black/45 flex items-center justify-center transition-all ${
                              isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {isThisPlaying ? (
                              <Pause className="w-4 h-4 text-white fill-current" />
                            ) : (
                              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                            )}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1 pr-2">
                          <h4
                            className={`text-sm font-bold truncate transition-colors ${
                              isCurrent
                                ? 'text-[#FA243C] dark:text-[#FF455A]'
                                : 'text-[#1D1D1F] dark:text-white group-hover:text-[#FA243C]'
                            }`}
                          >
                            {track.titleEnglish}
                          </h4>
                          <p
                            className={`font-telugu text-xs truncate mt-0.5 transition-colors ${
                              isCurrent
                                ? 'text-[#D4A017] dark:text-[#E5B842] font-semibold'
                                : 'text-[#86868B] dark:text-[#A1A1AA] group-hover:text-[#48484A] dark:group-hover:text-zinc-300'
                            }`}
                          >
                            {track.titleTelugu}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`font-mono text-xs hidden sm:inline-block px-2 ${
                            isCurrent ? 'text-[#FA243C] font-semibold' : 'text-[#86868B] dark:text-[#A1A1AA]'
                          }`}
                        >
                          {track.duration}
                        </span>
                        <TrackActionMenu track={track} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= PURCHASED BACKING TRACKS TAB ================= */}
      {activeTab === 'purchased' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#86868B]">
              {userPurchasedTracks.length} Unlocked Studio Backing Tracks
            </span>
            {userPurchasedTracks.length > 0 && (
              <button
                onClick={() => handlePlayPlaylist(userPurchasedTracks, false)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FC3C44] to-[#FA243C] text-xs font-bold text-white flex items-center gap-2 hover:brightness-110 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play All Backing Tracks</span>
              </button>
            )}
          </div>

          <div className="bg-[#F5F5F7]/60 dark:bg-[#1C1C1E]/60 rounded-3xl border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-xl overflow-hidden">
            {userPurchasedTracks.length === 0 ? (
              <div className="py-16 text-center space-y-3 px-4">
                <Disc3 className="w-12 h-12 text-[#86868B]/30 mx-auto" />
                <h4 className="text-base font-semibold text-[#1D1D1F]">
                  No purchased backing tracks yet
                </h4>
                <p className="text-xs text-[#86868B] max-w-sm mx-auto">
                  Browse studio minus-one backing tracks (karaoke) for choirs and live ministry. Individual tracks are unlocked for ₹99 each.
                </p>
                <Link
                  to="/tracks"
                  className="inline-block mt-2 px-5 py-2.5 rounded-full bg-[#FA243C] text-xs font-bold text-white"
                >
                  Browse Backing Tracks
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#FA243C]/10">
                {userPurchasedTracks.map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  const isThisPlaying = isCurrent && isPlaying;

                  return (
                    <div
                      key={track.id}
                      onClick={() => playOrToggleTrack(track, userPurchasedTracks)}
                      className={`group flex items-center justify-between px-3.5 py-3 sm:px-6 sm:py-3.5 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#FA243C]/10 dark:bg-[#FA243C]/20 border-l-4 border-l-[#FA243C]'
                          : 'hover:bg-[#F2F2F7] dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <span className="font-mono text-xs text-[#86868B] w-5 text-center shrink-0">
                          {isThisPlaying ? (
                            <div className="flex items-end justify-center gap-0.5 h-3.5">
                              <span className="w-0.5 bg-[#D4A017] rounded-full wave-bar-1" />
                              <span className="w-0.5 bg-[#D4A017] rounded-full wave-bar-2" />
                              <span className="w-0.5 bg-[#D4A017] rounded-full wave-bar-3" />
                            </div>
                          ) : (
                            idx + 1
                          )}
                        </span>

                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#F2F2F7] dark:bg-[#202023] shrink-0 border border-[#E5E5EA] dark:border-[#27272A]">
                          <img
                            src={track.coverImage || '/dad_white_suit.jpg'}
                            alt={track.titleEnglish}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className={`absolute inset-0 bg-black/45 flex items-center justify-center transition-all ${
                              isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {isThisPlaying ? (
                              <Pause className="w-4 h-4 text-white fill-current" />
                            ) : (
                              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                            )}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1 pr-2">
                          <h4
                            className={`text-sm font-bold truncate transition-colors ${
                              isCurrent
                                ? 'text-[#FA243C] dark:text-[#FF455A]'
                                : 'text-[#1D1D1F] dark:text-white group-hover:text-[#FA243C]'
                            }`}
                          >
                            {track.titleEnglish}
                          </h4>
                          <p
                            className={`font-telugu text-xs truncate mt-0.5 transition-colors ${
                              isCurrent
                                ? 'text-[#D4A017] dark:text-[#E5B842] font-semibold'
                                : 'text-[#86868B] dark:text-[#A1A1AA] group-hover:text-[#48484A] dark:group-hover:text-zinc-300'
                            }`}
                          >
                            {track.titleTelugu}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          Full Access
                        </span>
                        <TrackActionMenu track={track} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE PLAYLIST ================= */}
      {showCreateModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] w-screen h-screen min-h-[100dvh] bg-black/92 sm:bg-black/88 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="w-full max-w-md bg-[#F5F5F7] dark:bg-[#18181B] border border-[#E5E5EA] dark:border-[#27272A] rounded-3xl p-6 sm:p-7 shadow-2xl text-[#1D1D1F] dark:text-white space-y-5 animate-scaleUp my-auto max-h-[92dvh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA] dark:border-[#27272A]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F2F2F7] dark:bg-white/5 border border-[#E5E5EA] dark:border-white/10 flex items-center justify-center">
                    <ListMusic className="w-5 h-5 text-[#FA243C]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-[#1D1D1F] dark:text-white">Create New Playlist</h3>
                    <p className="text-xs text-[#86868B]">కొత్త ప్లేలిస్ట్‌ను ప్రారంభించండి</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-full text-[#86868B] hover:text-[#FA243C] hover:bg-[#FEE2E2] dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#86868B] mb-1.5">
                    Playlist Title *
                  </label>
                  <input
                    type="text"
                    autoFocus
                    required
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="e.g. Sunday Morning Hymns, Prayer Sanctuary..."
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#121214] border border-[#E5E5EA] dark:border-[#27272A] text-sm text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:border-[#FA243C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#86868B] mb-1.5">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newPlaylistDesc}
                    onChange={(e) => setNewPlaylistDesc(e.target.value)}
                    placeholder="A short note about the theme of this playlist..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-[#121214] border border-[#E5E5EA] dark:border-[#27272A] text-xs text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:border-[#FA243C] resize-none"
                  />
                </div>

                {/* Suggestions */}
                <div>
                  <p className="text-[11px] text-[#86868B] mb-2">Suggestions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Morning Worship', 'Sunday Choir', 'Quiet Devotion', 'Fast & Praise'].map(
                      (tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setNewPlaylistName(tag)}
                          className="px-2.5 py-1 rounded-xl bg-white dark:bg-white/5 border border-[#E5E5EA] dark:border-white/10 text-[11px] text-[#FA243C] hover:border-[#FA243C] transition-colors"
                        >
                          + {tag}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs text-[#86868B] hover:text-[#FA243C]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newPlaylistName.trim()}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FC3C44] to-[#FA243C] text-xs font-bold text-white hover:brightness-110 disabled:opacity-50 shadow-md"
                  >
                    Create Playlist
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ================= MODAL: EDIT PLAYLIST ================= */}
      {editingPlaylist &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] w-screen h-screen min-h-[100dvh] bg-black/92 sm:bg-black/88 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
            onClick={() => setEditingPlaylist(null)}
          >
            <div
              className="w-full max-w-md bg-[#F5F5F7] dark:bg-[#18181B] border border-[#E5E5EA] dark:border-[#27272A] rounded-3xl p-6 sm:p-7 shadow-2xl text-[#1D1D1F] dark:text-white space-y-5 animate-scaleUp my-auto max-h-[92dvh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA] dark:border-[#27272A]">
                <h3 className="font-heading font-bold text-lg text-[#1D1D1F] dark:text-white">Edit Playlist</h3>
                <button
                  onClick={() => setEditingPlaylist(null)}
                  className="p-1.5 rounded-full text-[#86868B] hover:text-[#FA243C] hover:bg-[#FEE2E2] dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#86868B] mb-1.5">
                    Playlist Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#121214] border border-[#E5E5EA] dark:border-[#27272A] text-sm text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#FA243C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#86868B] mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-[#121214] border border-[#E5E5EA] dark:border-[#27272A] text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#FA243C] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingPlaylist(null)}
                    className="px-4 py-2.5 rounded-xl text-xs text-[#86868B] hover:text-[#FA243C]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!editName.trim()}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FC3C44] to-[#FA243C] text-xs font-bold text-white hover:brightness-110 disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ================= MODAL: ADD SONGS TO PLAYLIST ================= */}
      {showAddSongsModal && selectedPlaylist &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] w-screen h-screen min-h-[100dvh] bg-black/92 sm:bg-black/88 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
            onClick={() => setShowAddSongsModal(false)}
          >
            <div
              className="w-full max-w-xl bg-[#F5F5F7] dark:bg-[#18181B] border border-[#E5E5EA] dark:border-[#27272A] rounded-3xl p-5 sm:p-7 shadow-2xl text-[#1D1D1F] dark:text-white space-y-4 my-auto max-h-[88dvh] flex flex-col animate-scaleUp overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA] dark:border-[#27272A] shrink-0">
                <div>
                  <h3 className="font-heading font-bold text-lg text-[#1D1D1F] dark:text-white">Add Songs to Playlist</h3>
                  <p className="text-xs text-[#86868B]">
                    Adding to <strong className="text-[#FA243C]">{selectedPlaylist.name}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setShowAddSongsModal(false)}
                  className="p-1.5 rounded-full text-[#86868B] hover:text-[#FA243C] hover:bg-[#FEE2E2] dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
                <input
                  type="text"
                  value={searchSongQuery}
                  onChange={(e) => setSearchSongQuery(e.target.value)}
                  placeholder="Search by Telugu or English song name..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#121214] border border-[#E5E5EA] dark:border-[#27272A] text-xs text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:border-[#FA243C]"
                />
              </div>

              {/* Song Catalog List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 divide-y divide-[#E5E5EA] dark:divide-[#27272A]">
                {allTracks
                  .filter((t) => {
                    if (!searchSongQuery.trim()) return true;
                    const q = searchSongQuery.toLowerCase();
                    return (
                      t.titleEnglish.toLowerCase().includes(q) ||
                      t.titleTelugu.toLowerCase().includes(q)
                    );
                  })
                  .map((track) => {
                    const alreadyIn = isTrackInPlaylist(selectedPlaylist.id, track.id);

                    return (
                      <div
                        key={track.id}
                        className="pt-2 flex items-center justify-between gap-3 px-2 py-2 rounded-xl hover:bg-[#FEE2E2]/50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#F2F2F7] dark:bg-[#202023] shrink-0 border border-[#E5E5EA] dark:border-[#27272A]">
                            <img
                              src={track.coverImage || '/covers/001_prayermp3.jpg'}
                              alt={track.titleEnglish}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-[#1D1D1F] dark:text-white truncate">
                              {track.titleEnglish}
                            </p>
                            <p className="font-telugu text-[11px] text-[#86868B] truncate">
                              {track.titleTelugu}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          data-testid="modal-add-track-btn"
                          onClick={() => {
                            if (alreadyIn) {
                              removeTrackFromPlaylist(selectedPlaylist.id, track.id);
                            } else {
                              addTrackToPlaylist(selectedPlaylist.id, track);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            alreadyIn
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-[#FA243C] text-white hover:bg-[#D71A30]'
                          }`}
                        >
                          {alreadyIn ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
              </div>

              <div className="pt-2 border-t border-[#E5E5EA] dark:border-[#27272A] shrink-0">
                <button
                  onClick={() => setShowAddSongsModal(false)}
                  className="w-full py-2.5 rounded-xl bg-white dark:bg-[#121214] border border-[#E5E5EA] dark:border-[#27272A] hover:bg-[#FEE2E2] dark:hover:bg-white/10 text-xs font-bold text-[#1D1D1F] dark:text-white hover:text-[#FA243C] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ================= MODAL: DELETE PLAYLIST CONFIRMATION ================= */}
      {playlistToDelete &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] w-screen h-screen min-h-[100dvh] bg-black/92 sm:bg-black/88 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
            onClick={() => setPlaylistToDelete(null)}
          >
            <div
              className="w-full max-w-md bg-[#F5F5F7] dark:bg-[#18181B] border border-[#E5E5EA] dark:border-[#27272A] rounded-3xl p-6 sm:p-7 shadow-2xl text-[#1D1D1F] dark:text-white space-y-4 animate-scaleUp my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3.5 pb-3 border-b border-[#E5E5EA] dark:border-[#27272A]">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800/40">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading font-bold text-lg text-[#1D1D1F] dark:text-white">Delete Playlist?</h3>
                  <p className="text-xs text-[#86868B]">ఈ ప్లేలిస్ట్‌ను తొలగించాలా?</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPlaylistToDelete(null)}
                  className="p-1.5 rounded-full text-[#86868B] hover:text-rose-600 hover:bg-[#FEE2E2] dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-[#86868B] dark:text-zinc-300 leading-relaxed">
                Are you sure you want to delete <strong className="text-[#1D1D1F] dark:text-white font-bold">"{playlistToDelete.name}"</strong>? This will remove the playlist from your sanctuary. (Original catalog songs will remain unaffected.)
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPlaylistToDelete(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-white dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deletePlaylist(playlistToDelete.id);
                    if (selectedPlaylistId === playlistToDelete.id) {
                      setSelectedPlaylistId(null);
                    }
                    setPlaylistToDelete(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-md shadow-rose-600/30"
                >
                  Yes, Delete Playlist
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
export default LibraryPage;
