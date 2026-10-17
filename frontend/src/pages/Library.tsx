import React, { useState, useEffect, useMemo } from 'react';
import {
  ListMusic,
  Plus,
  Play,
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
      <div className="flex items-center gap-2 border-b border-[#E5E5EA] pb-3">
        <button
          onClick={() => {
            setActiveTab('playlists');
            setSelectedPlaylistId(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'playlists'
              ? 'bg-[#FA243C] text-white shadow-sm'
              : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F2F2F7]'
          }`}
        >
          <ListMusic className="w-4 h-4" />
          <span>Playlists ({playlists.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('liked');
            setSelectedPlaylistId(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'liked'
              ? 'bg-[#FA243C] text-white shadow-sm'
              : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F2F2F7]'
          }`}
        >
          <Heart className="w-4 h-4 text-[#D4A017]" />
          <span>Liked Songs ({userLikedTracks.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('purchased');
            setSelectedPlaylistId(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'purchased'
              ? 'bg-[#FA243C] text-white shadow-sm'
              : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F2F2F7]'
          }`}
        >
          <Disc3 className="w-4 h-4 text-[#D4A017]" />
          <span>Purchased Tracks ({userPurchasedTracks.length})</span>
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
              <div className="rounded-3xl p-6 sm:p-8 bg-white border border-[#E5E5EA] shadow-apple-card flex flex-col md:flex-row gap-6 items-start md:items-end">
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

                <div className="space-y-2 min-w-0 flex-1">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D4A017]">
                    Devotional Playlist
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#1D1D1F] truncate">
                    {selectedPlaylist.name}
                  </h2>
                  {selectedPlaylist.description && (
                    <p className="text-xs sm:text-sm text-[#86868B] max-w-2xl">
                      {selectedPlaylist.description}
                    </p>
                  )}
                  <p className="text-xs text-[#86868B]/80 pt-1">
                    Created by <strong className="text-white">{user?.name || 'You'}</strong> •{' '}
                    {playlistTracks.length} {playlistTracks.length === 1 ? 'song' : 'songs'}
                  </p>
                </div>

                {/* Playlist Action Toolbar */}
                <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
                  <button
                    onClick={() => handlePlayPlaylist(playlistTracks, false)}
                    disabled={playlistTracks.length === 0}
                    className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-gradient-to-tr from-[#FC3C44] to-[#FA243C] text-xs font-bold text-white hover:brightness-110 flex items-center justify-center gap-2 shadow-lg disabled:opacity-40"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play All</span>
                  </button>

                  <button
                    onClick={() => handlePlayPlaylist(playlistTracks, true)}
                    disabled={playlistTracks.length === 0}
                    className="p-3 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-[#86868B] hover:text-white hover:bg-[#FEE2E2] transition-colors disabled:opacity-40"
                    title="Shuffle Play"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowAddSongsModal(true)}
                    className="px-3.5 py-3 rounded-2xl bg-[#F5F5F7] border border-[#D4A017]/40 text-xs font-bold text-[#D4A017] hover:text-white hover:bg-[#FEE2E2] flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#D4A017]" />
                    <span>Add Songs</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingPlaylist(selectedPlaylist);
                      setEditName(selectedPlaylist.name);
                      setEditDesc(selectedPlaylist.description || '');
                    }}
                    className="p-3 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-[#86868B] hover:text-white hover:bg-[#FEE2E2] transition-colors"
                    title="Edit Playlist Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${selectedPlaylist.name}"?`)) {
                        deletePlaylist(selectedPlaylist.id);
                        setSelectedPlaylistId(null);
                      }
                    }}
                    className="p-3 rounded-2xl bg-[#F5F5F7] border border-rose-500/30 text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Playlist Tracks Table */}
              <div className="bg-[#F5F5F7]/60 rounded-3xl border border-[#E5E5EA] shadow-xl overflow-hidden">
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
                          onClick={() => playTrack(track, playlistTracks)}
                          className={`group flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 hover:bg-[#FEE2E2]/70 transition-colors cursor-pointer ${
                            isCurrent ? 'bg-[#FEE2E2]/90' : ''
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

                            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#F2F2F7] shrink-0 border border-[#E5E5EA]">
                              <img
                                src={track.coverImage || '/covers/001_prayermp3.jpg'}
                                alt={track.titleEnglish}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="min-w-0 flex-1 pr-2">
                              <h4
                                className={`text-sm font-semibold truncate transition-colors ${
                                  isCurrent ? 'text-[#FA243C]' : 'text-[#1D1D1F] group-hover:text-[#FA243C]'
                                }`}
                              >
                                {track.titleEnglish}
                              </h4>
                              <p className="font-telugu text-xs text-[#86868B] group-hover:text-[#48484A] truncate mt-0.5">
                                {track.titleTelugu}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono text-xs text-[#86868B] hidden sm:inline-block px-2">
                              {track.duration}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTrackFromPlaylist(selectedPlaylist.id, track.id);
                              }}
                              className="p-1.5 rounded-full text-[#86868B] hover:text-rose-400 hover:bg-white transition-colors"
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
                  <h4 className="font-bold text-sm text-[#1D1D1F] group-hover:text-white">
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

          <div className="bg-[#F5F5F7]/60 rounded-3xl border border-[#E5E5EA] shadow-xl overflow-hidden">
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
                      onClick={() => playTrack(track, userLikedTracks)}
                      className={`group flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 hover:bg-[#FEE2E2]/70 transition-colors cursor-pointer ${
                        isCurrent ? 'bg-[#FEE2E2]/90' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <span className="font-mono text-xs text-[#86868B] w-5 text-center shrink-0">
                          {idx + 1}
                        </span>

                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#F2F2F7] shrink-0 border border-[#E5E5EA]">
                          <img
                            src={track.coverImage || '/covers/001_prayermp3.jpg'}
                            alt={track.titleEnglish}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1 pr-2">
                          <h4
                            className={`text-sm font-semibold truncate transition-colors ${
                              isCurrent ? 'text-[#FA243C]' : 'text-[#1D1D1F] group-hover:text-[#FA243C]'
                            }`}
                          >
                            {track.titleEnglish}
                          </h4>
                          <p className="font-telugu text-xs text-[#86868B] group-hover:text-[#48484A] truncate mt-0.5">
                            {track.titleTelugu}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-xs text-[#86868B] hidden sm:inline-block px-2">
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

          <div className="bg-[#F5F5F7]/60 rounded-3xl border border-[#E5E5EA] shadow-xl overflow-hidden">
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

                  return (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track, userPurchasedTracks)}
                      className={`group flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 hover:bg-[#FEE2E2]/70 transition-colors cursor-pointer ${
                        isCurrent ? 'bg-[#FEE2E2]/90' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <span className="font-mono text-xs text-[#86868B] w-5 text-center shrink-0">
                          {idx + 1}
                        </span>

                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#F2F2F7] shrink-0 border border-[#E5E5EA]">
                          <img
                            src={track.coverImage || '/dad_white_suit.jpg'}
                            alt={track.titleEnglish}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1 pr-2">
                          <h4
                            className={`text-sm font-semibold truncate transition-colors ${
                              isCurrent ? 'text-[#FA243C]' : 'text-[#1D1D1F] group-hover:text-[#FA243C]'
                            }`}
                          >
                            {track.titleEnglish}
                          </h4>
                          <p className="font-telugu text-xs text-[#86868B] group-hover:text-[#48484A] truncate mt-0.5">
                            {track.titleTelugu}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
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
      {showCreateModal && (
        <div
          className="fixed inset-0 z-[200] w-screen h-screen min-h-[100dvh] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-md bg-[#F5F5F7] border border-[#E5E5EA] rounded-3xl p-6 sm:p-7 shadow-2xl text-[#1D1D1F] space-y-5 animate-scaleUp my-auto max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F2F2F7] border border-[#E5E5EA] flex items-center justify-center">
                  <ListMusic className="w-5 h-5 text-[#FA243C]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-[#1D1D1F]">Create New Playlist</h3>
                  <p className="text-xs text-[#86868B]">కొత్త ప్లేలిస్ట్‌ను ప్రారంభించండి</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full text-[#86868B] hover:text-[#FA243C] hover:bg-[#FEE2E2]"
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
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-[#E5E5EA] text-sm text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#FA243C]"
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
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#E5E5EA] text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#FA243C] resize-none"
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
                        className="px-2.5 py-1 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-[11px] text-[#FA243C] hover:border-[#FA243C]"
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
        </div>
      )}

      {/* ================= MODAL: EDIT PLAYLIST ================= */}
      {editingPlaylist && (
        <div
          className="fixed inset-0 z-[200] w-screen h-screen min-h-[100dvh] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
          onClick={() => setEditingPlaylist(null)}
        >
          <div
            className="w-full max-w-md bg-[#F5F5F7] border border-[#E5E5EA] rounded-3xl p-6 sm:p-7 shadow-2xl text-[#1D1D1F] space-y-5 animate-scaleUp my-auto max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA]">
              <h3 className="font-heading font-bold text-lg text-[#1D1D1F]">Edit Playlist</h3>
              <button
                onClick={() => setEditingPlaylist(null)}
                className="p-1.5 rounded-full text-[#86868B] hover:text-[#FA243C] hover:bg-[#FEE2E2]"
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
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-[#E5E5EA] text-sm text-[#1D1D1F] focus:outline-none focus:border-[#FA243C]"
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
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#E5E5EA] text-xs text-[#1D1D1F] focus:outline-none focus:border-[#FA243C] resize-none"
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
        </div>
      )}

      {/* ================= MODAL: ADD SONGS TO PLAYLIST ================= */}
      {showAddSongsModal && selectedPlaylist && (
        <div
          className="fixed inset-0 z-[200] w-screen h-screen min-h-[100dvh] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
          onClick={() => setShowAddSongsModal(false)}
        >
          <div
            className="w-full max-w-xl bg-[#F5F5F7] border border-[#E5E5EA] rounded-3xl p-6 sm:p-7 shadow-2xl text-[#1D1D1F] space-y-4 my-auto max-h-[88dvh] flex flex-col animate-scaleUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA] shrink-0">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1D1D1F]">Add Songs to Playlist</h3>
                <p className="text-xs text-[#86868B]">
                  Adding to <strong className="text-[#FA243C]">{selectedPlaylist.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowAddSongsModal(false)}
                className="p-1.5 rounded-full text-[#86868B] hover:text-[#FA243C] hover:bg-[#FEE2E2]"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#E5E5EA] text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#FA243C]"
              />
            </div>

            {/* Song Catalog List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 divide-y divide-[#E5E5EA]">
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
                      className="pt-2 flex items-center justify-between gap-3 px-2 py-2 rounded-xl hover:bg-[#FEE2E2]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#F2F2F7] shrink-0 border border-[#E5E5EA]">
                          <img
                            src={track.coverImage || '/covers/001_prayermp3.jpg'}
                            alt={track.titleEnglish}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-[#1D1D1F] truncate">
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
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
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

            <div className="pt-2 border-t border-[#E5E5EA] shrink-0">
              <button
                onClick={() => setShowAddSongsModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#F5F5F7] hover:bg-[#FEE2E2] text-xs font-semibold text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LibraryPage;
