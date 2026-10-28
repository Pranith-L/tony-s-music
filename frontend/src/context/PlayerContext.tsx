import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Track } from '../types/index.js';
import { MOCK_TRACKS } from '../services/mockData.js';
import { useAuth } from './AuthContext.js';
import { TrackPreviewLimitModal } from '../components/modals/TrackPreviewLimitModal.js';
import { SkipLimitModal } from '../components/modals/SkipLimitModal.js';
import { SongTheme, extractCoverTheme, applyGlobalSongTheme } from '../utils/themeEngine.js';

export type RepeatMode = 'off' | 'all' | 'one';
export type RightSidebarTab = 'now-playing' | 'queue' | 'lyrics';

const MAX_FREE_SKIPS_PER_DAY = 6;

interface PlayerContextType {
  currentTrack: Track | null;
  songTheme: SongTheme;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  likedTrackIds: string[];
  isRightSidebarOpen: boolean;
  rightSidebarTab: RightSidebarTab;
  isFullscreenPlayer: boolean;
  isMobileNowPlayingOpen: boolean;
  remainingSkips: number;
  showPreviewLimitModal: boolean;
  showSkipLimitModal: boolean;

  // Helpers
  isBackingTrack: (track: Track | null) => boolean;
  hasTrackAccess: (track: Track | null) => boolean;
  setShowPreviewLimitModal: (open: boolean) => void;
  setShowSkipLimitModal: (open: boolean) => void;

  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => void;
  playOrToggleTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolumeLevel: (val: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrev: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLikeTrack: (trackId: string) => void;
  isLiked: (trackId: string) => boolean;
  playNextInQueue: (track: Track) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleRightSidebar: () => void;
  setRightSidebarOpen: (open: boolean) => void;
  setRightSidebarTab: (tab: RightSidebarTab) => void;
  toggleFullscreenPlayer: () => void;
  setFullscreenPlayer: (open: boolean) => void;
  setMobileNowPlayingOpen: (open: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isSubscriber } = useAuth();

  const [currentTrack, setCurrentTrack] = useState<Track | null>(MOCK_TRACKS[0] || null);
  const [songTheme, setSongTheme] = useState<SongTheme>({
    primary: '#FA243C',
    primaryRgb: '250, 36, 60',
    secondary: '#D4A017',
    secondaryRgb: '212, 160, 23',
    accent: '#FA243C',
    glow: 'rgba(250, 36, 60, 0.35)',
    bgGradient: 'radial-gradient(circle at 40% 25%, rgba(250, 36, 60, 0.22), transparent 65%), radial-gradient(circle at 75% 75%, rgba(212, 160, 23, 0.18), transparent 60%)',
    cardBg: 'rgba(255, 255, 255, 0.90)',
  });

  // Dynamically extract vibrant color theme whenever active track changes
  useEffect(() => {
    if (currentTrack?.coverImage) {
      extractCoverTheme(currentTrack.coverImage).then((theme) => {
        setSongTheme(theme);
        applyGlobalSongTheme(theme);
      });
    }
  }, [currentTrack?.coverImage]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(342); // 5:42 default
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [queue, setQueue] = useState<Track[]>(MOCK_TRACKS);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(false);
  const [rightSidebarTab, setRightSidebarTab] = useState<RightSidebarTab>('now-playing');
  const [isFullscreenPlayer, setIsFullscreenPlayer] = useState<boolean>(false);
  const [isMobileNowPlayingOpen, setIsMobileNowPlayingOpen] = useState<boolean>(false);

  // Modals for limits
  const [showPreviewLimitModal, setShowPreviewLimitModal] = useState<boolean>(false);
  const [showSkipLimitModal, setShowSkipLimitModal] = useState<boolean>(false);

  // Daily Skips
  const getDailySkipsCount = (): number => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const stored = localStorage.getItem('tony_music_daily_skips');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === today) {
          return parsed.count;
        }
      }
    } catch {
      // fallback
    }
    return 0;
  };

  const [remainingSkips, setRemainingSkips] = useState<number>(() => {
    return Math.max(0, MAX_FREE_SKIPS_PER_DAY - getDailySkipsCount());
  });

  // Track reference for event listeners
  const currentTrackRef = useRef<Track | null>(currentTrack);
  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  const isBackingTrack = (track: Track | null): boolean => {
    if (!track) return false;
    // The 71 devotional songs are 100% free to listen in full and must NEVER be preview limited
    if (track.isTrack === false) return false;
    if (track.isTrack === true) return true;

    const cat = track.category ? track.category.toLowerCase() : '';
    if (cat === 'track' || cat === 'tracks') return true;

    const titleEn = track.titleEnglish ? track.titleEnglish.toLowerCase() : '';
    const titleTe = track.titleTelugu || '';
    if (
      titleEn.includes('track') ||
      titleTe.includes('ట్రాక్') ||
      (track.audioUrl && track.audioUrl.toLowerCase().includes('track'))
    ) {
      return true;
    }

    return false;
  };

  const hasTrackAccess = (track: Track | null): boolean => {
    if (!track) return false;
    // Devotional vocal songs are 100% free to listen
    if (!isBackingTrack(track)) {
      return true;
    }
    // Studio karaoke backing tracks require individual purchase (₹99 each)
    // The ₹299 One-Time Pass is exclusively for devotional songs and platform benefits
    if (user?.purchases?.some((p) => p.trackId === track.id)) {
      return true;
    }
    return false;
  };

  // Check skips before allowing Next/Prev
  const checkAndRecordSkip = (): boolean => {
    if (isSubscriber) return true; // VIP has infinite skips

    const today = new Date().toISOString().slice(0, 10);
    const count = getDailySkipsCount();
    if (count >= MAX_FREE_SKIPS_PER_DAY) {
      setShowSkipLimitModal(true);
      return false;
    }

    const newCount = count + 1;
    try {
      localStorage.setItem('tony_music_daily_skips', JSON.stringify({ date: today, count: newCount }));
    } catch {}
    setRemainingSkips(Math.max(0, MAX_FREE_SKIPS_PER_DAY - newCount));
    return true;
  };

  // Persistent Liked Songs
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tony_prakash_liked_tracks');
      return saved ? JSON.parse(saved) : ['track-1', 'track-2'];
    } catch {
      return ['track-1', 'track-2'];
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewDismissedTrackIdRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('tony_prakash_liked_tracks', JSON.stringify(likedTrackIds));
    } catch (e) {
      console.warn('Failed to save liked tracks to localStorage', e);
    }
  }, [likedTrackIds]);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    if (typeof window !== 'undefined') {
      (window as any).__tonyAudio = audio;
    }
    if (currentTrack) {
      audio.src = currentTrack.audioUrl;
    }

    const handleTimeUpdate = () => {
      const cur = audio.currentTime;
      setCurrentTime(cur);

      // Check 30-second preview limit for studio backing tracks
      const current = currentTrackRef.current;
      if (current && isBackingTrack(current) && !hasTrackAccess(current)) {
        if (cur >= 30 && previewDismissedTrackIdRef.current !== current.id) {
          audio.pause();
          audio.currentTime = 29.9;
          setCurrentTime(29.9);
          setIsPlaying(false);
          setShowPreviewLimitModal(true);
        }
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        // Natural progression to next track doesn't count against user's manual skip limit
        advanceToNextTrack();
      }
    };

    const handleError = (e: any) => {
      console.warn('Audio playback error (using simulated fallback if offline):', e);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [isSubscriber, user]);

  const playTrack = (track: Track, newQueue?: Track[]) => {
    if (!audioRef.current) return;
    previewDismissedTrackIdRef.current = null;

    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
    } else if (!queue.some((t) => t.id === track.id)) {
      setQueue((prev) => [...prev, track]);
    }

    setCurrentTrack(track);
    audioRef.current.src = track.audioUrl;
    audioRef.current.volume = isMuted ? 0 : volume;

    // Automatically open Fullscreen Player to showcase the dynamic color changing experience
    setIsFullscreenPlayer(true);

    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((err) => {
        console.warn('Audio playback warning:', err);
        setIsPlaying(true);
      });
  };

  const playOrToggleTrack = (track: Track, newQueue?: Track[]) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
      setIsFullscreenPlayer(true);
    } else {
      playTrack(track, newQueue);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (!currentTrack && queue.length > 0) {
      playTrack(queue[0]);
      return;
    }

    // Check if backing track preview has expired
    if (
      currentTrack &&
      isBackingTrack(currentTrack) &&
      !hasTrackAccess(currentTrack) &&
      currentTime >= 30
    ) {
      setShowPreviewLimitModal(true);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(true));
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;

    // Enforce 30s limit for unpurchased studio backing tracks
    if (
      currentTrack &&
      isBackingTrack(currentTrack) &&
      !hasTrackAccess(currentTrack) &&
      time > 30
    ) {
      audioRef.current.currentTime = 30;
      setCurrentTime(30);
      audioRef.current.pause();
      setIsPlaying(false);
      setShowPreviewLimitModal(true);
      return;
    }

    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const setVolumeLevel = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Internal helper to advance track
  const advanceToNextTrack = () => {
    if (queue.length === 0) return;
    if (!currentTrack) {
      playTrack(queue[0]);
      return;
    }

    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      playTrack(queue[randomIndex]);
      return;
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex >= 0 && currentIndex < queue.length - 1) {
      playTrack(queue[currentIndex + 1]);
    } else if (repeatMode !== 'off' && queue.length > 0) {
      playTrack(queue[0]); // loop back to first
    } else {
      pause();
    }
  };

  const playNext = () => {
    // Manual user skip checks daily skip limit
    if (!checkAndRecordSkip()) {
      return;
    }
    advanceToNextTrack();
  };

  const playPrev = () => {
    if (queue.length === 0) return;
    if (!currentTrack) {
      playTrack(queue[0]);
      return;
    }

    if (currentTime > 3) {
      seek(0);
      return;
    }

    // Manual user skip back to previous song
    if (!checkAndRecordSkip()) {
      return;
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex > 0) {
      playTrack(queue[currentIndex - 1]);
    } else if (repeatMode !== 'off') {
      playTrack(queue[queue.length - 1]);
    } else {
      seek(0);
    }
  };

  const toggleShuffle = () => {
    setShuffle((prev) => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const toggleLikeTrack = (trackId: string) => {
    setLikedTrackIds((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  const isLiked = (trackId: string) => likedTrackIds.includes(trackId);

  const playNextInQueue = (track: Track) => {
    setQueue((prev) => {
      const curIndex = currentTrack ? prev.findIndex((t) => t.id === currentTrack.id) : -1;
      const filtered = prev.filter((t) => t.id !== track.id);
      if (curIndex === -1) {
        return [track, ...filtered];
      }
      const newQueue = [...filtered];
      newQueue.splice(curIndex + 1, 0, track);
      return newQueue;
    });
  };

  const addToQueue = (track: Track) => {
    setQueue((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;
      return [...prev, track];
    });
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    if (currentTrack) {
      setQueue([currentTrack]);
    } else {
      setQueue([]);
    }
  };

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen((prev) => !prev);
  };

  const toggleFullscreenPlayer = () => {
    setIsFullscreenPlayer((prev) => !prev);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        songTheme,
        isPlaying,
        currentTime,
        duration,
        volume,
        queue,
        isMuted,
        shuffle,
        repeatMode,
        likedTrackIds,
        isRightSidebarOpen,
        rightSidebarTab,
        isFullscreenPlayer,
        isMobileNowPlayingOpen,
        remainingSkips,
        showPreviewLimitModal,
        showSkipLimitModal,
        isBackingTrack,
        hasTrackAccess,
        setShowPreviewLimitModal,
        setShowSkipLimitModal,
        playTrack,
        playOrToggleTrack,
        togglePlay,
        pause,
        seek,
        setVolumeLevel,
        toggleMute,
        playNext,
        playPrev,
        toggleShuffle,
        toggleRepeat,
        toggleLikeTrack,
        isLiked,
        playNextInQueue,
        addToQueue,
        removeFromQueue,
        clearQueue,
        toggleRightSidebar,
        setRightSidebarOpen: setIsRightSidebarOpen,
        setRightSidebarTab,
        toggleFullscreenPlayer,
        setFullscreenPlayer: setIsFullscreenPlayer,
        setMobileNowPlayingOpen: setIsMobileNowPlayingOpen,
      }}
    >
      {children}

      {/* 30-Second Studio Preview Limit Modal */}
      <TrackPreviewLimitModal
        track={showPreviewLimitModal ? currentTrack : null}
        onClose={() => {
          setShowPreviewLimitModal(false);
          if (currentTrack) {
            previewDismissedTrackIdRef.current = currentTrack.id;
          }
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
            setIsPlaying(false);
          }
        }}
        onUnlocked={() => {
          setShowPreviewLimitModal(false);
          if (audioRef.current) {
            audioRef.current.play().catch(() => {});
            setIsPlaying(true);
          }
        }}
      />

      {/* Free Tier Daily Skip Limit Modal */}
      <SkipLimitModal
        isOpen={showSkipLimitModal}
        onClose={() => setShowSkipLimitModal(false)}
        skipsUsed={MAX_FREE_SKIPS_PER_DAY - remainingSkips}
        maxSkips={MAX_FREE_SKIPS_PER_DAY}
      />
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
