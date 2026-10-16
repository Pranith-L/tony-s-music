import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Heart,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Volume2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Share2,
  Flame,
} from 'lucide-react';
import { Track, Album, Video } from '../types/index.js';
import { api } from '../services/api.js';
import { usePlayer } from '../context/PlayerContext.js';
import { LyricsModal } from '../components/LyricsModal.js';
import { VideoModal } from '../components/VideoModal.js';
import { SEO } from '../components/SEO.js';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    isLiked,
    toggleLikeTrack,
    likedTrackIds,
  } = usePlayer();

  useEffect(() => {
    async function loadData() {
      try {
        const [tracksData, albumsData, videosData] = await Promise.all([
          api.tracks.getAll(),
          api.albums.getAll(),
          api.videos.getAll(),
        ]);
        setTracks(tracksData);
        setAlbums(albumsData);
        setVideos(videosData);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { en: 'Good morning', te: 'శుభోదయం • Shalom' };
    if (hour < 17) return { en: 'Good afternoon', te: 'శుభ మధ్యాహ్నం • Shalom' };
    return { en: 'Good evening', te: 'హృదయపూర్వక వందనములు • Shalom' };
  };

  const greeting = getGreeting();
  const [activeMood, setActiveMood] = useState<string>('ALL');

  const moodChips = [
    { id: 'ALL', en: 'All Devotional Songs', te: 'అన్నీ (68)' },
    { id: 'WORSHIP', en: 'Praise & Worship', te: 'ఆరాధన' },
    { id: 'CALVARY', en: 'Calvary Meditations', te: 'సిలువ ధ్యానములు' },
    { id: 'HYMNS', en: 'Acoustic Devotionals', te: 'కీర్తనలు' },
  ];

  const vocalTracks = tracks.filter((t) => !t.isTrack);
  const studioBackingTracks = tracks.filter((t) => t.isTrack);

  const moodFilteredTracks =
    activeMood === 'WORSHIP'
      ? vocalTracks.filter(
          (t) =>
            t.category?.toLowerCase() === 'worship' ||
            t.titleEnglish.toLowerCase().includes('worship')
        )
      : activeMood === 'CALVARY'
      ? vocalTracks.filter(
          (t) =>
            (t.lyricsTelugu && t.lyricsTelugu.includes('సిలువ')) ||
            (t.titleTelugu && t.titleTelugu.includes('సిలువ')) ||
            t.titleEnglish.toLowerCase().includes('cross') ||
            t.titleEnglish.toLowerCase().includes('prema')
        )
      : activeMood === 'HYMNS'
      ? vocalTracks.filter((t) => t.category?.toLowerCase() === 'devotional')
      : vocalTracks;

  const popularTracks = moodFilteredTracks.slice(0, 8);
  const featuredBackingTracks = studioBackingTracks.slice(0, 6);
  const spotlightTrack = tracks[0] || null;

  const handlePlayAll = () => {
    if (popularTracks.length > 0) {
      playTrack(popularTracks[0]);
    }
  };

  // 6 Quick Play Featured Cards
  const quickCards = [
    {
      id: 'quick-1',
      titleTelugu: 'ప్రార్థన',
      titleEnglish: 'Prayer (ప్రార్థన)',
      image: tracks[0]?.coverImage || '/covers/001_prayermp3.jpg',
      track: tracks[0],
    },
    {
      id: 'quick-2',
      titleTelugu: 'నీ ప్రేమ నాకు చాలు',
      titleEnglish: 'Nee Prema Naaku Chalu (నీ ప్రేమ నాకు చాలు)',
      image: tracks[1]?.coverImage || '/covers/002_Nee_Prema_Naaku_Chalu.jpg',
      track: tracks[1],
    },
    {
      id: 'quick-3',
      titleTelugu: 'హృదయ గీతాలు • Liked Songs',
      titleEnglish: `Liked Songs (${likedTrackIds.length})`,
      image: tracks[2]?.coverImage || '/covers/003_Ninduga_Naa_Gundelo.jpg',
      route: '/music?filter=liked',
    },
    {
      id: 'quick-4',
      titleTelugu: 'కనుగొంటిని యేసయ్య',
      titleEnglish: 'Kanugontini Yesayya (కనుగొంటిని యేసయ్య)',
      image: tracks[3]?.coverImage || '/covers/004_Kanugontini_Yesayya.jpg',
      track: tracks[3],
    },
    {
      id: 'quick-5',
      titleTelugu: 'పావురమా నీ ప్రేమ',
      titleEnglish: 'Paavuramaa Nee Prema (పావురమా నీ ప్రేమ)',
      image: tracks[4]?.coverImage || '/covers/005_Paavuramaa.jpg',
      track: tracks[4],
    },
    {
      id: 'quick-6',
      titleTelugu: '30+ వసంతాల పరిచర్య క్లాసిక్స్',
      titleEnglish: '30 Years Devotional Classics',
      image: '/hero_tony_prakash.png',
      route: '/about',
    },
  ];

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto">
      <SEO
        title="Tony's Music — Rev. Tony Prakash | Telugu Christian Devotional Sanctuary"
        description="Official Christian devotional music platform of Rev. Tony Prakash. Listen to 71+ Telugu gospel songs, download studio backing tracks at ₹99, stream albums, watch worship videos, and get One-Time Pass."
        canonical="https://tonyprakash.com/"
      />
      {/* ================= 1. GREETING & QUICK PLAY GRID ================= */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#1D1D1F] tracking-tight">
              {greeting.en}
            </h2>
            <p className="font-telugu text-sm text-[#D4A017] font-semibold">
              “{greeting.te}”
            </p>
          </div>
          <Link
            to="/music"
            className="text-xs font-semibold text-[#FA243C] hover:underline flex items-center gap-1"
          >
            <span>View all 125 tracks</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 6 Grid Quick-Play Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickCards.map((card) => {
            const isThisCurrent = card.track && currentTrack?.id === card.track.id;
            const isThisPlaying = isThisCurrent && isPlaying;

            const handleCardClick = () => {
              if (card.track) {
                if (isThisCurrent) {
                  togglePlay();
                } else {
                  playTrack(card.track);
                }
              } else if (card.route) {
                navigate(card.route);
              }
            };

            return (
              <div
                key={card.id}
                onClick={handleCardClick}
                className="group relative flex items-center gap-3.5 bg-[#F5F5F7]/80 hover:bg-[#FEE2E2] rounded-xl overflow-hidden border border-[#E5E5EA] hover:border-[#E5E5EA] transition-all duration-200 cursor-pointer shadow-md pr-3"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-[#F2F2F7] overflow-hidden relative">
                  <img
                    src={card.image}
                    alt={card.titleEnglish}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isThisPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Volume2 className="w-5 h-5 text-[#D4A017] animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 py-2">
                  <h4 className="font-telugu text-sm font-bold text-[#1D1D1F] truncate leading-tight group-hover:text-[#FA243C] transition-colors">
                    {card.titleTelugu}
                  </h4>
                  <p className="text-xs text-[#86868B] truncate font-medium">
                    {card.titleEnglish}
                  </p>
                </div>

                {/* Play circle that floats in on hover */}
                {card.track && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isThisCurrent) togglePlay();
                      else playTrack(card.track);
                    }}
                    className={`w-10 h-10 rounded-full bg-gradient-to-tr from-[#FC3C44] to-[#FA243C] text-[#FFFFFF] flex items-center justify-center shadow-xl border border-[#D4A017]/40 transition-all duration-200 shrink-0 ${
                      isThisPlaying
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'
                    }`}
                    title={isThisPlaying ? 'Pause' : 'Play'}
                  >
                    {isThisPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= 2. TONY'S MUSIC ARTIST HERO SHOWCASE ================= */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-50/60 via-white to-amber-50/50 border border-[#E5E5EA] shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FA243C]/10 via-[#D4AF37]/10 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FA243C]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-6 sm:p-10 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center md:text-left z-10">
            {/* Brand Monogram Crest */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D4A017]/40 text-[#D4A017] text-xs font-mono uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>TONY'S MUSIC • OFFICIAL DEVOTIONAL HUB</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-[#1D1D1F] tracking-tight">
                Rev. Tony Prakash
              </h1>
              <p className="font-telugu text-lg sm:text-2xl text-[#D4A017] font-semibold leading-relaxed">
                దైవజనులు టోనీ ప్రకాష్ గారి దివ్య ఆత్మీయ గీతాల భాండాగారం
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed max-w-xl">
              Spreading the gospel of Jesus Christ through anointed melody, biblical truth, and heartfelt worship for over 30 years. Stream 68+ soul-lifting devotional hymns and 57 studio minus-one backing tracks.
            </p>

            {/* Ministry Stats Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 max-w-lg">
              <div className="p-2.5 rounded-xl bg-white border border-[#E5E5EA] text-center shadow-sm">
                <span className="block font-mono text-base font-bold text-[#1D1D1F]">125+</span>
                <span className="text-[10px] text-[#86868B] uppercase tracking-wider font-semibold">Total Tracks</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E5E5EA] text-center shadow-sm">
                <span className="block font-mono text-base font-bold text-[#D4A017]">57</span>
                <span className="text-[10px] text-[#D4A017] uppercase tracking-wider font-semibold">Tracks • ₹99</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E5E5EA] text-center shadow-sm">
                <span className="block font-mono text-base font-bold text-[#FA243C]">68</span>
                <span className="text-[10px] text-[#FA243C] uppercase tracking-wider font-semibold">VIP Hymns</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E5E5EA] text-center shadow-sm">
                <span className="block font-mono text-base font-bold text-[#1D1D1F]">320k</span>
                <span className="text-[10px] text-[#86868B] uppercase tracking-wider font-semibold">Master Audio</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
              <button
                onClick={handlePlayAll}
                className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-gradient-to-r from-[#FC3C44] to-[#FA243C] text-white font-heading font-bold text-sm uppercase tracking-wider shadow-lg shadow-red-500/25 hover:scale-105 transition-all duration-200 border border-[#E5E5EA]"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play Tony's Hits</span>
              </button>

              <Link
                to="/tracks"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[#D4AF37]/70 text-[#D4A017] bg-white hover:bg-amber-50 text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm"
              >
                <span>🎹 Studio Backing Tracks (₹99)</span>
              </Link>

              <Link
                to="/membership"
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-white hover:bg-red-50 border border-[#FA243C]/50 text-[#FA243C] text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Tony's VIP Pass (₹299 One-Time)</span>
              </Link>
            </div>
          </div>

          {/* Artist Portrait Showcase with Gold Vinyl Halo */}
          <div className="relative w-52 h-52 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-3xl overflow-hidden bg-gradient-to-b from-red-100/50 to-amber-100/50 border-2 border-[#D4AF37]/60 shadow-[0_10px_35px_rgba(212,175,55,0.2)] shrink-0 group">
            <img
              src="/hero_tony_prakash.png"
              alt="Rev. Tony Prakash"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40" />
            <div className="absolute bottom-3 left-3 right-3 text-center">
              <span className="text-[11px] font-telugu text-[#D4A017] bg-white/95 px-3 py-1 rounded-full border border-[#E5E5EA] shadow-sm font-semibold">
                30+ వసంతాల దైవ పరిచర్య
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. POPULAR DEVOTIONAL SONGS (100% FREE FULL LISTENING) ================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                100% Free Full Listening
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#1D1D1F] mt-1">
              Popular Devotional Songs
            </h3>
            <p className="font-telugu text-xs text-[#D4A017]">
              భక్తుల ఆదరణ పొందిన కీర్తనలు • ఉచిత ఆరాధనా శ్రవణం (All 68 Songs Free to Listen)
            </p>
          </div>

          <Link
            to="/music"
            className="text-xs font-semibold text-[#FA243C] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Explore all 68 devotional songs</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Dynamic Mood & Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar pt-1 -mx-2 px-2 sm:mx-0 sm:px-0">
          {moodChips.map((chip) => {
            const isActive = activeMood === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setActiveMood(chip.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-[#FA243C] text-[#FFFFFF] shadow-md shadow-[#FA243C]/40 border border-[#D4A017]/40'
                    : 'bg-[#F5F5F7] text-[#86868B] hover:text-[#FFFFFF] hover:bg-[#FEE2E2] border border-[#E5E5EA]'
                }`}
              >
                <span>{chip.en}</span>
                <span className="ml-1.5 opacity-80 font-telugu text-[11px]">({chip.te})</span>
              </button>
            );
          })}
        </div>

        {/* Songs List */}
        <div className="bg-[#F5F5F7]/60 rounded-2xl border border-[#E5E5EA] overflow-hidden shadow-lg">
          <div className="divide-y divide-[#FA243C]/10">
            {popularTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isThisPlaying = isCurrent && isPlaying;
              const liked = isLiked(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, popularTracks)}
                  className={`group flex items-center justify-between px-4 py-3 sm:py-3.5 hover:bg-[#FEE2E2]/70 transition-colors cursor-pointer ${
                    isCurrent ? 'bg-[#FEE2E2]/90' : ''
                  }`}
                >
                  {/* Left: Index & Art & Title */}
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                    <span className="font-mono text-xs text-[#86868B] w-5 text-center shrink-0">
                      {isThisPlaying ? (
                        <div className="flex items-end justify-center gap-0.5 h-3.5">
                          <span className="w-0.5 bg-[#D4A017] rounded-full wave-bar-1" />
                          <span className="w-0.5 bg-[#D4A017] rounded-full wave-bar-2" />
                          <span className="w-0.5 bg-[#D4A017] rounded-full wave-bar-3" />
                          <span className="w-0.5 bg-[#D4A017] rounded-full wave-bar-4" />
                        </div>
                      ) : (
                        idx + 1
                      )}
                    </span>

                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-[#F2F2F7] shrink-0 border border-[#E5E5EA] shadow-sm">
                      <img
                        src={track.coverImage || '/covers/001_prayermp3.jpg'}
                        alt={track.titleEnglish}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-[#FFFFFF] fill-current" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm sm:text-base font-semibold truncate ${
                            isCurrent ? 'text-[#FA243C]' : 'text-[#FFFFFF]'
                          }`}
                        >
                          {track.titleEnglish}
                        </h4>
                      </div>
                      <p className="font-telugu text-xs text-[#D4A017] truncate">
                        {track.titleTelugu}
                      </p>
                    </div>
                  </div>

                  {/* Right: Free Listening Badge, VIP Download, Like, Lyrics, Duration */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Free Listening
                    </span>

                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrack(track);
                      }}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FA243C]/25 text-[#FA243C] border border-[#FA243C]/50 hover:bg-[#FA243C] hover:text-white transition-colors cursor-pointer shrink-0 shadow-sm"
                      title="Download requires Tony's VIP Lifetime Pass (₹299)"
                    >
                      VIP Pass • ₹299
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLikeTrack(track.id);
                      }}
                      className={`p-1.5 transition-colors opacity-0 group-hover:opacity-100 ${
                        liked ? '!opacity-100 text-[#D4A017]' : 'text-[#86868B] hover:text-[#FFFFFF]'
                      }`}
                      title={liked ? 'Liked' : 'Like'}
                    >
                      <Heart className={`w-4 h-4 ${liked ? 'fill-[#D4A017]' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrack(track);
                      }}
                      className="p-1.5 text-[#86868B] hover:text-[#D4A017] transition-colors opacity-0 group-hover:opacity-100"
                      title="View Lyrics (సాహిత్యం) & Download"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    <span className="font-mono text-xs text-[#86868B] pr-1">
                      {track.duration}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 4. STUDIO BACKING TRACKS SHOWCASE (₹99 / 30s PREVIEW) ================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#D4A017]/20 text-[#D4A017] border border-[#D4A017]/40">
                57 Studio Backing Tracks • 30s Preview
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FA243C]/30 text-[#FA243C]">
                ₹99 / Track
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#1D1D1F] mt-1">
              Studio Backing Tracks (Minus-One / Karaoke)
            </h3>
            <p className="font-telugu text-xs text-[#D4A017]">
              ప్రత్యేక స్టూడియో ట్రాక్స్ • 30 సెకన్ల ఉచిత ప్రివ్యూ (Unlock complete WAV for ₹99 each)
            </p>
          </div>

          <Link
            to="/tracks"
            className="text-xs font-semibold text-[#D4A017] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View all 57 studio backing tracks</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Studio Backing Tracks Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {featuredBackingTracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            const isThisPlaying = isCurrent && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, studioBackingTracks)}
                className="group p-3 rounded-2xl bg-[#F5F5F7]/80 hover:bg-[#FEE2E2] border border-[#D4A017]/30 hover:border-[#D4A017]/50 transition-all duration-300 cursor-pointer shadow-lg space-y-2 flex flex-col justify-between"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F2F2F7] border border-[#D4A017]/20">
                  <img
                    src={track.coverImage || '/covers/001_prayermp3.jpg'}
                    alt={track.titleEnglish}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-[#FFFFFF] fill-current" />
                  </div>
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 text-amber-300 border border-amber-400/30">
                    30s
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-semibold text-xs sm:text-sm text-[#1D1D1F] truncate group-hover:text-[#D4A017] transition-colors">
                    {track.titleEnglish}
                  </h4>
                  <p className="font-telugu text-[11px] text-[#D4A017] truncate">
                    {track.titleTelugu}
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between text-[10px]">
                  <span className="text-[#86868B] font-mono">{track.duration}</span>
                  <span className="px-2 py-0.5 rounded-full font-bold bg-[#D4A017]/20 text-[#D4A017] border border-[#D4A017]/40">
                    ₹99
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= 4. FEATURED ALBUMS ================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#1D1D1F]">
              Devotional Albums
            </h3>
            <p className="font-telugu text-xs text-[#D4A017]">
              ఆరాధనా ఆల్బమ్‌లు
            </p>
          </div>
          <Link
            to="/albums"
            className="text-xs font-semibold text-[#FA243C] hover:underline flex items-center gap-1"
          >
            <span>See all albums</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {albums.map((album) => (
            <div
              key={album.id}
              onClick={() => navigate(`/albums/${album.slug}`)}
              className="group p-3.5 sm:p-4 rounded-2xl bg-[#F5F5F7]/80 hover:bg-[#FEE2E2] border border-[#E5E5EA] hover:border-[#FA243C]/50 transition-all duration-300 cursor-pointer shadow-lg space-y-3"
            >
              {/* Album Art with Floating Round Play Button on Hover */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F2F2F7] shadow-md">
                <img
                  src={album.coverImage}
                  alt={album.titleEnglish}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/albums/${album.slug}`);
                  }}
                  className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-gradient-to-tr from-[#FC3C44] to-[#FA243C] text-[#FFFFFF] flex items-center justify-center shadow-xl border border-[#D4A017]/40 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
                  title="Play Album"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>

              {/* Album Info */}
              <div className="space-y-1">
                <h4 className="font-telugu text-base font-bold text-[#1D1D1F] truncate leading-tight group-hover:text-[#FA243C] transition-colors">
                  {album.titleTelugu}
                </h4>
                <p className="text-xs text-[#86868B] truncate">
                  {album.titleEnglish}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-[#86868B]/70 font-mono">
                  <span>{album.releaseYear}</span>
                  <span>•</span>
                  <span>Album</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 5. FEATURED YOUTUBE VIDEOS ================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#D4A017] font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>@TonyPrakashOfficial Channel</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#1D1D1F]">
              Official Videos & Live Worship
            </h3>
            <p className="font-telugu text-xs text-[#D4A017]">
              వీడియో సందేశాలు • ఆరాధనా గీతాలు ({videos.length || 30} Songs Available)
            </p>
          </div>
          <Link
            to="/videos"
            className="text-xs font-semibold text-[#FA243C] hover:underline flex items-center gap-1"
          >
            <span>See all {videos.length || 30} channel embeds</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.slice(0, 6).map((video) => (
            <div
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="group bg-[#F5F5F7]/80 hover:bg-[#FEE2E2] rounded-2xl overflow-hidden border border-[#E5E5EA] hover:border-[#FA243C]/50 transition-all duration-300 cursor-pointer shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video bg-white overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FC3C44] to-[#FA243C] text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform border border-[#D4A017]/40">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/85 text-[11px] font-mono text-white shadow">
                      {video.duration}
                    </div>
                  )}
                  {video.category && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-[#D4A017] shadow">
                      {video.category}
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-1.5">
                  <h4 className="font-telugu text-sm font-bold text-[#1D1D1F] line-clamp-2 group-hover:text-[#FA243C] transition-colors leading-snug">
                    {video.title}
                  </h4>
                  <p className="text-xs text-[#86868B] line-clamp-1">
                    Rev. Tony Prakash Official Channel
                  </p>
                </div>
              </div>

              <div className="px-4 pb-3 pt-1 border-t border-[#E5E5EA] flex items-center justify-between text-[11px]">
                <span className="text-[#D4A017] font-mono">
                  {video.views || video.published || 'Official Release'}
                </span>
                <span className="text-[#FA243C] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Watch Embed</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 6. ABOUT MINISTRY SPOTLIGHT ================= */}
      <section className="rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-[#0E0305] via-[#22070D] to-[#1A060A] border border-[#D4A017]/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#D4A017]">
            <Sparkles className="w-4 h-4" />
            <span>Ministry Calling & Vision</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-heading font-bold text-[#1D1D1F]">
            Singing For the Glory of the King of Kings
          </h3>
          <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed">
            Rev. Tony Prakash has committed over three decades of divine service, touching millions through Telugu gospel hymns, soul-stirring worship, and biblical preaching. Join Tony's VIP Ministry Membership for full access or get studio backing tracks for your church.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            to="/membership"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#D4A017] to-[#E5D7A8] text-[#0E0305] text-xs font-bold uppercase tracking-wider text-center shadow-lg hover:scale-105 transition-transform"
          >
            VIP Lifetime Pass (₹299 One-Time)
          </Link>
          <Link
            to="/about"
            className="px-6 py-3 rounded-full border border-[#FA243C]/50 text-[#FFFFFF] hover:bg-[#FEE2E2] text-xs font-bold uppercase tracking-wider text-center transition-colors"
          >
            Read Ministry Story
          </Link>
        </div>
      </section>

      {/* Modals */}
      {selectedTrack && (
        <LyricsModal track={selectedTrack} onClose={() => setSelectedTrack(null)} />
      )}
      {activeVideo && (
        <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
};
