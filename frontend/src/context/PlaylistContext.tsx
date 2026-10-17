import React, { createContext, useContext, useState, useEffect } from 'react';
import { Track } from '../types/index.js';
import { useAuth } from './AuthContext.js';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  trackIds: string[];
  coverImage?: string;
}

interface PlaylistContextType {
  playlists: Playlist[];
  createPlaylist: (name: string, description?: string) => Playlist;
  deletePlaylist: (playlistId: string) => void;
  updatePlaylist: (playlistId: string, name: string, description?: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => boolean;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  getPlaylistById: (playlistId: string) => Playlist | undefined;
  isTrackInPlaylist: (playlistId: string, trackId: string) => boolean;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const storageKey = `tony_user_playlists_${user?.id || 'guest'}`;

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter((p: Playlist) => p.id !== 'pl-worship-favorites') : [];
      }
    } catch (e) {
      console.error('Failed to load playlists', e);
    }
    return [];
  });

  // Re-load playlists whenever user changes (login/logout)
  useEffect(() => {
    try {
      const key = `tony_user_playlists_${user?.id || 'guest'}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPlaylists(Array.isArray(parsed) ? parsed.filter((p: Playlist) => p.id !== 'pl-worship-favorites') : []);
      } else {
        // If logged-in user has no saved playlists yet, import guest playlists (if any) or start fresh
        const guestSaved = localStorage.getItem('tony_user_playlists_guest');
        if (guestSaved && user) {
          const parsed = JSON.parse(guestSaved);
          setPlaylists(Array.isArray(parsed) ? parsed.filter((p: Playlist) => p.id !== 'pl-worship-favorites') : []);
        } else {
          setPlaylists([]);
        }
      }
    } catch (e) {
      console.error('Failed to load playlists on user change', e);
    }
  }, [user?.id]);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(playlists));
    } catch (e) {
      console.error('Failed to save playlists', e);
    }
  }, [playlists, storageKey]);

  const createPlaylist = (name: string, description?: string): Playlist => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: name.trim() || 'My Devotional Playlist',
      description: description?.trim() || '',
      createdAt: new Date().toISOString(),
      trackIds: [],
      coverImage: '/tony_avatar_cutout.png',
    };
    setPlaylists((prev) => [newPlaylist, ...prev]);
    return newPlaylist;
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => {
      const updated = prev.filter((p) => p.id !== playlistId);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to delete playlist from storage', e);
      }
      return updated;
    });
  };

  const updatePlaylist = (playlistId: string, name: string, description?: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? { ...p, name: name.trim() || p.name, description: description !== undefined ? description.trim() : p.description }
          : p
      )
    );
  };

  const addTrackToPlaylist = (playlistId: string, track: Track): boolean => {
    let added = false;
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          if (!p.trackIds.includes(track.id)) {
            added = true;
            return {
              ...p,
              trackIds: [...p.trackIds, track.id],
              coverImage: track.coverImage || p.coverImage,
            };
          }
        }
        return p;
      })
    );
    return added;
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          return {
            ...p,
            trackIds: p.trackIds.filter((id) => id !== trackId),
          };
        }
        return p;
      })
    );
  };

  const getPlaylistById = (playlistId: string) => {
    return playlists.find((p) => p.id === playlistId);
  };

  const isTrackInPlaylist = (playlistId: string, trackId: string) => {
    const pl = playlists.find((p) => p.id === playlistId);
    return pl ? pl.trackIds.includes(trackId) : false;
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        createPlaylist,
        deletePlaylist,
        updatePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        getPlaylistById,
        isTrackInPlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylists = (): PlaylistContextType => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylists must be used within a PlaylistProvider');
  }
  return context;
};
