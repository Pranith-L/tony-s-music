import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Track } from '../types/index.js';
import { MOCK_TRACKS } from '../services/mockData.js';
import { useAuth } from './AuthContext.js';
import { TrackPreviewLimitModal } from '../components/modals/TrackPreviewLimitModal.js';
import { SkipLimitModal } from '../components/modals/SkipLimitModal.js';
import { SongTheme, extractCoverTheme, applyGlobalSongTheme } from '../utils/themeEngine.js';
import { devotionalSynthesizer } from '../services/audioSynthesizer.js';
import { offlineStorage } from '../services/offlineStorage.js';

export type RepeatMode = 'off' | 'all' | 'one';
export type RightSidebarTab = 'now-playing' | 'queue' | 'lyrics';
export type FullscreenView = 'player' | 'lyrics' | 'queue';

const MAX_FREE_SKIPS_PER_DAY = 6;

interface PlayerContextType {
  currentTrack: Track | null;
  songTheme: SongTheme;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
  history: Track[];
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  likedTrackIds: string[];
  isRightSidebarOpen: boolean;
  rightSidebarTab: RightSidebarTab;
  isFullscreenPlayer: boolean;
  isMobileNowPlayingOpen: boolean;
  fullscreenView: FullscreenView;
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
  playTrackAt: (index: number) => void;
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
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  clearHistory: () => void;
  toggleRightSidebar: () => void;
  setRightSidebarOpen: (open: boolean) => void;
  setRightSidebarTab: (tab: RightSidebarTab) => void;
  toggleFullscreenPlayer: () => void;
  setFullscreenPlayer: (open: boolean) => void;
  setMobileNowPlayingOpen: (open: boolean) => void;
  setFullscreenView: (view: FullscreenView) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isSubscriber } = useAuth();

  // Initial queue: strictly 100% free devotional vocal songs (all backing tracks excluded from auto-queue)
  const DEVOTIONAL_TRACKS: Track[] = MOCK_TRACKS.filter((t) => !t.isTrack);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(DEVOTIONAL_TRACKS[0] || null);
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
  const [queue, setQueue] = useState<Track[]>(DEVOTIONAL_TRACKS);
  const [history, setHistory] = useState<Track[]>(() => {
    try {
      const stored = localStorage.getItem('tony_music_history');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(false);
  const [rightSidebarTab, setRightSidebarTab] = useState<RightSidebarTab>('now-playing');
  const [isFullscreenPlayer, setIsFullscreenPlayer] = useState<boolean>(false);
  const [isMobileNowPlayingOpen, setIsMobileNowPlayingOpen] = useState<boolean>(false);
  const [fullscreenView, setFullscreenView] = useState<FullscreenView>('player');

  useEffect(() => {
    try {
      localStorage.setItem('tony_music_history', JSON.stringify(history.slice(0, 50)));
    } catch {
      // ignore
    }
  }, [history]);

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('tony_music_history');
    } catch {
      // ignore
    }
  };

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

  // Live mutable refs synchronized with state to prevent React stale closures in audio event listeners
  const currentTrackRef = useRef<Track | null>(currentTrack);
  const queueRef = useRef<Track[]>(queue);
  const shuffleRef = useRef<boolean>(shuffle);
  const repeatModeRef = useRef<RepeatMode>(repeatMode);
  const playedShuffleIndicesRef = useRef<number[]>([]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

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
  const fallbackTimerRef = useRef<any>(null);

  const startFallbackAudio = () => {
    devotionalSynthesizer.setVolume(isMuted ? 0 : volume);
    devotionalSynthesizer.start();

    if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
    fallbackTimerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 1;
        const current = currentTrackRef.current;
        if (current && isBackingTrack(current) && !hasTrackAccess(current)) {
          if (next >= 30 && previewDismissedTrackIdRef.current !== current.id) {
            pause();
            setShowPreviewLimitModal(true);
            return 29.9;
          }
        }
        if (next >= duration) {
          advanceToNextTrack();
          return 0;
        }
        return next;
      });
    }, 1000);
  };

  const stopFallbackAudio = () => {
    devotionalSynthesizer.pause();
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  };

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
    const initialTrack = currentTrackRef.current;
    if (initialTrack) {
      offlineStorage.getOfflineAudioUrl(initialTrack.id).then((localUrl) => {
        audio.src = localUrl || initialTrack.audioUrl;
      });
    }

    const handleTimeUpdate = () => {
      const cur = audio.currentTime;
      setCurrentTime(cur);

      // Check 30-second preview limit for studio backing tracks
      const current = currentTrackRef.current;
      if (current && isBackingTrack(current) && !hasTrackAccess(current)) {
        if (cur >= 30 && previewDismissedTrackIdRef.current !== current.id) {
          audio.pause();
          stopFallbackAudio();
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
      if (repeatModeRef.current === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        setIsPlaying(true);
      } else {
        // Natural progression to next track doesn't count against user's manual skip limit
        advanceToNextTrack();
      }
    };

    const handleError = (e: any) => {
      const src = audio.src;
      // Format auto-negotiation: if .wav failed, seamlessly try .mp3; if .mp3 failed, try .wav
      if (src && src.includes('.wav') && !src.includes('__alt_format')) {
        const mp3Src = src.replace('.wav', '.mp3') + (src.includes('?') ? '&' : '?') + '__alt_format=1';
        console.info('WAV stream unavailable, automatically attempting MP3 alternative:', mp3Src);
        audio.src = mp3Src;
        audio.play().then(() => {
          stopFallbackAudio();
          setIsPlaying(true);
        }).catch(() => {
          startFallbackAudio();
        });
        return;
      }
      if (src && src.includes('.mp3') && !src.includes('__alt_format')) {
        const wavSrc = src.replace('.mp3', '.wav') + (src.includes('?') ? '&' : '?') + '__alt_format=1';
        console.info('MP3 stream unavailable, automatically attempting WAV alternative:', wavSrc);
        audio.src = wavSrc;
        audio.play().then(() => {
          stopFallbackAudio();
          setIsPlaying(true);
        }).catch(() => {
          startFallbackAudio();
        });
        return;
      }
      console.warn('Audio stream fallback activated:', e);
      startFallbackAudio();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      stopFallbackAudio();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const playTrack = (track: Track, newQueue?: Track[]) => {
    if (!audioRef.current) return;
    previewDismissedTrackIdRef.current = null;
    stopFallbackAudio();

    const prevTrack = currentTrackRef.current;
    const prevQueue = queueRef.current;

    let activeQueue = prevQueue;
    if (newQueue && newQueue.length > 0) {
      // Archive previous tracks into history
      const tracksToArchive: Track[] = [];
      if (prevTrack && prevTrack.id !== track.id) {
        tracksToArchive.push(prevTrack);
      }
      for (const pt of prevQueue) {
        if (pt.id !== track.id && !newQueue.some((nt) => nt.id === pt.id)) {
          if (!tracksToArchive.some((ta) => ta.id === pt.id)) {
            tracksToArchive.push(pt);
          }
        }
      }

      if (tracksToArchive.length > 0) {
        setHistory((prevHist) => {
          const existingIds = new Set(tracksToArchive.map((t) => t.id));
          const filtered = prevHist.filter((t) => !existingIds.has(t.id));
          return [...tracksToArchive, ...filtered].slice(0, 100);
        });
      }

      // Filter album/new queue: only include devotional songs (plus the selected track if explicitly clicked)
      const sanitizedQueue = newQueue.filter((t) => !t.isTrack || t.id === track.id);
      activeQueue = sanitizedQueue;
      queueRef.current = sanitizedQueue;
      setQueue(sanitizedQueue);
      playedShuffleIndicesRef.current = [];
    } else {
      if (prevTrack && prevTrack.id !== track.id) {
        setHistory((prevHist) => {
          const filtered = prevHist.filter((t) => t.id !== prevTrack.id);
          return [prevTrack, ...filtered].slice(0, 100);
        });
      }

      if (!activeQueue.some((t) => t.id === track.id)) {
        activeQueue = [...activeQueue, track];
        queueRef.current = activeQueue;
        setQueue(activeQueue);
      }
    }

    setCurrentTrack(track);
    currentTrackRef.current = track;

    // Track index in shuffle history to avoid repeats in current shuffle session
    const trackIdx = activeQueue.findIndex((t) => t.id === track.id);
    if (trackIdx !== -1 && !playedShuffleIndicesRef.current.includes(trackIdx)) {
      playedShuffleIndicesRef.current.push(trackIdx);
    }

    // Prioritize in-app offline cache before network streaming
    offlineStorage.getOfflineAudioUrl(track.id).then((offlineUrl) => {
      if (!audioRef.current) return;
      if (offlineUrl) {
        console.info(`[Offline] Playing "${track.titleEnglish}" from in-app storage.`);
        audioRef.current.src = offlineUrl;
      } else {
        audioRef.current.src = track.audioUrl;
      }
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.loop = repeatModeRef.current === 'one';

      audioRef.current
        .play()
        .then(() => {
          stopFallbackAudio();
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Audio playback fallback initiated:', err);
          setIsPlaying(true);
          startFallbackAudio();
        });
    });
  };

  const playOrToggleTrack = (track: Track, newQueue?: Track[]) => {
    if (currentTrackRef.current?.id === track.id) {
      togglePlay();
      setIsFullscreenPlayer(true);
    } else {
      playTrack(track, newQueue);
    }
  };

  const playTrackAt = (index: number) => {
    const q = queueRef.current;
    if (index >= 0 && index < q.length) {
      playTrack(q[index]);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    const current = currentTrackRef.current;
    const q = queueRef.current;
    if (!current && q.length > 0) {
      playTrack(q[0]);
      return;
    }

    // Check if backing track preview has expired
    if (
      current &&
      isBackingTrack(current) &&
      !hasTrackAccess(current) &&
      currentTime >= 30
    ) {
      setShowPreviewLimitModal(true);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      stopFallbackAudio();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          stopFallbackAudio();
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(true);
          startFallbackAudio();
        });
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    stopFallbackAudio();
    setIsPlaying(false);
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;

    // Enforce 30s limit for unpurchased studio backing tracks
    const current = currentTrackRef.current;
    if (
      current &&
      isBackingTrack(current) &&
      !hasTrackAccess(current) &&
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
    devotionalSynthesizer.setVolume(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      devotionalSynthesizer.setVolume(volume);
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      devotionalSynthesizer.setVolume(0);
      setIsMuted(true);
    }
  };

  // Internal helper to advance track with live refs and unplayed shuffle memory
  const advanceToNextTrack = () => {
    const q = queueRef.current;
    const current = currentTrackRef.current;
    const mode = repeatModeRef.current;
    const isShuffled = shuffleRef.current;

    if (!q || q.length === 0) return;

    // 1. Repeat ONE: replay current track seamlessly
    if (mode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
      return;
    }

    // 2. SHUFFLE Mode: pick an unplayed track without repeating current song
    if (isShuffled) {
      const curIdx = current ? q.findIndex((t) => t.id === current.id) : -1;
      if (curIdx !== -1 && !playedShuffleIndicesRef.current.includes(curIdx)) {
        playedShuffleIndicesRef.current.push(curIdx);
      }

      // Filter unplayed indices that are not current track
      let unplayedIndices = q
        .map((_, idx) => idx)
        .filter((idx) => !playedShuffleIndicesRef.current.includes(idx) && idx !== curIdx);

      // If all tracks in queue have been played
      if (unplayedIndices.length === 0) {
        if (mode !== 'off') {
          // Reset shuffle history for continuous repeat all
          playedShuffleIndicesRef.current = curIdx !== -1 ? [curIdx] : [];
          unplayedIndices = q
            .map((_, idx) => idx)
            .filter((idx) => idx !== curIdx);
          if (unplayedIndices.length === 0) unplayedIndices = [0];
        } else {
          // Reached end in shuffle mode with repeat off
          pause();
          return;
        }
      }

      const randomIdx = unplayedIndices[Math.floor(Math.random() * unplayedIndices.length)];
      playedShuffleIndicesRef.current.push(randomIdx);
      const nextTrack = q[randomIdx];
      if (nextTrack) {
        playTrack(nextTrack);
      }
      return;
    }

    // 3. SEQUENTIAL Mode
    const currentIndex = current ? q.findIndex((t) => t.id === current.id) : -1;
    if (currentIndex >= 0 && currentIndex < q.length - 1) {
      playTrack(q[currentIndex + 1]);
    } else if (mode !== 'off' && q.length > 0) {
      playTrack(q[0]); // Loop back to start of queue
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
    if (currentTime > 3) {
      seek(0);
      return;
    }

    // Manual user skip back to previous song
    if (!checkAndRecordSkip()) {
      return;
    }

    const q = queueRef.current;
    const current = currentTrackRef.current;
    const mode = repeatModeRef.current;

    if (!q || q.length === 0) return;

    const currentIndex = current ? q.findIndex((t) => t.id === current.id) : -1;
    if (currentIndex > 0) {
      playTrack(q[currentIndex - 1]);
    } else if (mode !== 'off' && q.length > 0) {
      playTrack(q[q.length - 1]);
    } else {
      seek(0);
    }
  };

  const toggleShuffle = () => {
    setShuffle((prev) => {
      const next = !prev;
      shuffleRef.current = next;
      playedShuffleIndicesRef.current = [];
      return next;
    });
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      let next: RepeatMode;
      if (prev === 'off') next = 'all';
      else if (prev === 'all') next = 'one';
      else next = 'off';

      repeatModeRef.current = next;
      if (audioRef.current) {
        audioRef.current.loop = next === 'one';
      }
      return next;
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
      const curIndex = currentTrackRef.current ? prev.findIndex((t) => t.id === currentTrackRef.current!.id) : -1;
      const filtered = prev.filter((t) => t.id !== track.id);
      let updated: Track[];
      if (curIndex === -1) {
        updated = [track, ...filtered];
      } else {
        updated = [...filtered];
        updated.splice(curIndex + 1, 0, track);
      }
      queueRef.current = updated;
      return updated;
    });
  };

  const addToQueue = (track: Track) => {
    setQueue((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;
      const updated = [...prev, track];
      queueRef.current = updated;
      return updated;
    });
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      queueRef.current = updated;
      return updated;
    });
  };

  const reorderQueue = (fromIndex: number, toIndex: number) => {
    setQueue((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      queueRef.current = result;
      return result;
    });
  };

  const clearQueue = () => {
    const current = currentTrackRef.current;
    const updated = current ? [current] : [];
    setQueue(updated);
    queueRef.current = updated;
    playedShuffleIndicesRef.current = [];
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
        history,
        isMuted,
        shuffle,
        repeatMode,
        likedTrackIds,
        isRightSidebarOpen,
        rightSidebarTab,
        isFullscreenPlayer,
        isMobileNowPlayingOpen,
        fullscreenView,
        remainingSkips,
        showPreviewLimitModal,
        showSkipLimitModal,
        isBackingTrack,
        hasTrackAccess,
        setShowPreviewLimitModal,
        setShowSkipLimitModal,
        playTrack,
        playOrToggleTrack,
        playTrackAt,
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
        reorderQueue,
        clearQueue,
        clearHistory,
        toggleRightSidebar,
        setRightSidebarOpen: setIsRightSidebarOpen,
        setRightSidebarTab,
        toggleFullscreenPlayer,
        setFullscreenPlayer: setIsFullscreenPlayer,
        setMobileNowPlayingOpen: setIsMobileNowPlayingOpen,
        setFullscreenView,
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
