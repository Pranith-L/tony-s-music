import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Track } from '../types/index.js';
import { offlineStorage } from '../services/offlineStorage.js';
import { useAuth } from './AuthContext.js';

interface AlbumProgress {
  current: number;
  total: number;
  progressPercent: number;
  currentSongTitle?: string;
}

interface OfflineContextType {
  downloadedTrackIds: Set<string>;
  downloadingTrackIds: Record<string, number>;
  albumProgress: Record<string, AlbumProgress>;
  offlineTracks: { track: Track; size: number; downloadedAt: number }[];
  stats: { count: number; totalMB: string };
  isDownloaded: (trackId: string) => boolean;
  isDownloading: (trackId: string) => boolean;
  downloadTrack: (track: Track) => Promise<boolean>;
  removeDownload: (trackId: string) => Promise<void>;
  downloadAlbum: (albumId: string, tracks: Track[]) => Promise<void>;
  isAlbumDownloaded: (tracks: Track[]) => boolean;
  clearAllDownloads: () => Promise<void>;
  refreshOfflineData: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSubscriber, user } = useAuth();
  const [downloadedTrackIds, setDownloadedTrackIds] = useState<Set<string>>(new Set());
  const [downloadingTrackIds, setDownloadingTrackIds] = useState<Record<string, number>>({});
  const [albumProgress, setAlbumProgress] = useState<Record<string, AlbumProgress>>({});
  const [offlineTracks, setOfflineTracks] = useState<{ track: Track; size: number; downloadedAt: number }[]>([]);
  const [stats, setStats] = useState<{ count: number; totalMB: string }>({ count: 0, totalMB: '0.0' });

  const refreshOfflineData = useCallback(async () => {
    try {
      const ids = await offlineStorage.getOfflineTrackIds();
      setDownloadedTrackIds(new Set(ids));

      const tracks = await offlineStorage.getAllOfflineTracks();
      setOfflineTracks(tracks);

      const st = await offlineStorage.getStorageStats();
      setStats({ count: st.count, totalMB: st.totalMB });
    } catch (err) {
      console.warn('Failed to refresh offline downloads:', err);
    }
  }, []);

  useEffect(() => {
    refreshOfflineData();

    const handleOfflineChange = () => {
      refreshOfflineData();
    };

    window.addEventListener('tony_offline_change', handleOfflineChange);
    return () => {
      window.removeEventListener('tony_offline_change', handleOfflineChange);
    };
  }, [refreshOfflineData]);

  const isDownloaded = useCallback(
    (trackId: string) => downloadedTrackIds.has(trackId),
    [downloadedTrackIds]
  );

  const isDownloading = useCallback(
    (trackId: string) => downloadingTrackIds[trackId] !== undefined,
    [downloadingTrackIds]
  );

  const isAlbumDownloaded = useCallback(
    (tracks: Track[]) => {
      if (!tracks || tracks.length === 0) return false;
      return tracks.every((t) => downloadedTrackIds.has(t.id));
    },
    [downloadedTrackIds]
  );

  const downloadTrack = async (track: Track): Promise<boolean> => {
    // Check authentication or subscriber access if applicable
    if (downloadingTrackIds[track.id] !== undefined) return false;

    setDownloadingTrackIds((prev) => ({ ...prev, [track.id]: 0 }));

    try {
      await offlineStorage.saveTrackOffline(track, (pct) => {
        setDownloadingTrackIds((prev) => ({ ...prev, [track.id]: pct }));
      });
      await refreshOfflineData();
      return true;
    } catch (err) {
      console.error(`Failed to download track "${track.titleEnglish}" for offline play:`, err);
      alert(`Could not download "${track.titleEnglish}" for offline listening. Please check your connection.`);
      return false;
    } finally {
      setDownloadingTrackIds((prev) => {
        const next = { ...prev };
        delete next[track.id];
        return next;
      });
    }
  };

  const removeDownload = async (trackId: string) => {
    try {
      await offlineStorage.deleteTrackOffline(trackId);
      await refreshOfflineData();
    } catch (err) {
      console.error('Failed to remove download:', err);
    }
  };

  const downloadAlbum = async (albumId: string, tracks: Track[]) => {
    if (!tracks || tracks.length === 0) return;
    if (albumProgress[albumId]) return; // Already downloading this album

    const total = tracks.length;
    setAlbumProgress((prev) => ({
      ...prev,
      [albumId]: { current: 0, total, progressPercent: 0, currentSongTitle: tracks[0]?.titleEnglish },
    }));

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      setAlbumProgress((prev) => ({
        ...prev,
        [albumId]: {
          current: i + 1,
          total,
          progressPercent: Math.round(((i) / total) * 100),
          currentSongTitle: track.titleEnglish,
        },
      }));

      // If not already downloaded, download it
      if (!downloadedTrackIds.has(track.id)) {
        await downloadTrack(track);
      }
    }

    setAlbumProgress((prev) => {
      const next = { ...prev };
      delete next[albumId];
      return next;
    });

    await refreshOfflineData();
  };

  const clearAllDownloads = async () => {
    if (!window.confirm('Are you sure you want to remove all offline downloaded music from this device?')) {
      return;
    }
    await offlineStorage.clearAllOffline();
    await refreshOfflineData();
  };

  return (
    <OfflineContext.Provider
      value={{
        downloadedTrackIds,
        downloadingTrackIds,
        albumProgress,
        offlineTracks,
        stats,
        isDownloaded,
        isDownloading,
        downloadTrack,
        removeDownload,
        downloadAlbum,
        isAlbumDownloaded,
        clearAllDownloads,
        refreshOfflineData,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

