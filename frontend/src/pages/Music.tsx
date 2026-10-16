import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Music,
  ArrowUpDown,
  FileText,
  Play,
  Pause,
  Heart,
  Clock,
  CheckCircle2,
  ListMusic,
  X,
  Volume2,
  Disc3,
  ArrowRight,
  Headphones,
} from 'lucide-react';
import { Track } from '../types/index.js';
import { api } from '../services/api.js';
import { usePlayer } from '../context/PlayerContext.js';
import { useAuth } from '../context/AuthContext.js';
import { LyricsModal } from '../components/LyricsModal.js';
import { TrackActionMenu } from '../components/layout/TrackActionMenu.js';
import { SEO } from '../components/SEO.js';

export const MusicPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'ORDER' | 'POPULAR' | 'NEWEST'>('ORDER');

  const { currentTrack, isPlaying, playTrack, isLiked, toggleLikeTrack, likedTrackIds } =
    usePlayer();
  const { isSubscriber } = useAuth();

  const handleDownloadSong = (track: Track) => {
    if (!isSubscriber) {
      navigate('/membership');
      return;
    }
    const link = document.createElement('a');
    link.href = track.audioUrl;
    const isWav = track.audioUrl.toLowerCase().endsWith('.wav');
    link.download = `${track.titleEnglish} - Rev. Tony Prakash Devotional.${isWav ? 'wav' : 'mp3'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLikedFilter = searchParams.get('filter') === 'liked';

  useEffect(() => {
    const urlQuery = searchParams.get('search') || '';
    setSearchQuery(urlQuery);
  }, [searchParams]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set('search', val.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams, { replace: true });
  };

  useEffect(() => {
    async function loadTracks() {
      setIsLoading(true);
      try {
        const data = await api.tracks.getAll();
        // Separate section: Devotional Vocal Songs (non-backing tracks)
        const devotionalSongs = data.filter((t) => !t.isTrack);
        setTracks(devotionalSongs);
      } catch (err) {
        console.error('Failed to load songs:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTracks();
  }, []);

  const categories = [
    { id: 'ALL', en: 'All Devotional Songs (68)', te: 'సమగ్ర కీర్తనలు' },
    { id: 'Worship', en: 'Praise & Worship', te: 'ఆరాధన' },
    { id: 'Devotional', en: 'Devotional Hymns', te: 'కీర్తనలు' },
    { id: 'Praise', en: 'Thanksgiving Praise', te: 'స్తుతి' },
    { id: 'Gospel', en: 'Gospel Revival', te: 'సువార్త' },
  ];

  let displayTracks = isLikedFilter
    ? tracks.filter((t) => likedTrackIds.includes(t.id))
    : activeCategory !== 'ALL'
    ? tracks.filter((t) => t.category?.toLowerCase() === activeCategory.toLowerCase())
    : tracks;

  // Instant client-side search filter
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    displayTracks = displayTracks.filter((t) => {
      const en = (t.titleEnglish || '').toLowerCase();
      const te = (t.titleTelugu || '').toLowerCase();
      const singer = (t.singer || '').toLowerCase();
      const composer = (t.composer || '').toLowerCase();
      return en.includes(q) || te.includes(q) || singer.includes(q) || composer.includes(q);
    });
  }

  const sortedTracks = [...displayTracks].sort((a, b) => {
    if (sortBy === 'POPULAR') return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    if (sortBy === 'NEWEST') return b.releaseYear - a.releaseYear;
    return a.orderIndex - b.orderIndex;
  });

  const browseTiles = [
    {
      id: 'Worship',
      title: 'Worship • ఆరాధన',
      subtitle: 'Atmospheric adoration & secret place prayers',
      bg: 'from-[#8B1524] to-[#C41E3A]',
      img: '/covers/002_Nee_Prema_Naaku_Chalu.jpg',
    },
    {
      id: 'Devotional',
      title: 'Devotional • భక్తి గీతాలు',
      subtitle: 'Comforting acoustic melodies of eternal faith',
      bg: 'from-[#22070D] to-[#8B1524]',
      img: '/covers/016_Manishi_Brathuku.jpg',
    },
    {
      id: 'Praise',
      title: 'Praise • స్తుతి కీర్తనలు',
      subtitle: 'Joyful thanksgiving & victory songs',
      bg: 'from-[#9C8550] to-[#C9B27C]',
      img: '/covers/010_Jayashali.jpg',
    },
    {
      id: 'Gospel',
      title: 'Gospel • సువార్త',
      subtitle: 'Living hope proclaimed across 30 years',
      bg: 'from-[#1A060A] to-[#C41E3A]',
      img: '/covers/006_Palletoori_Thammuda.jpg',
    },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <SEO
        title="Devotional Songs (భక్తి గీతాలు) — Rev. Tony Prakash"
        description="Stream all 68+ Telugu Christian devotional and worship songs by Rev. Tony Prakash for free. High-definition stereo streaming and verified Telugu lyrics."
        canonical="https://tonyprakash.com/music"
      />
      {/* 1. Dedicated Section Navigation Switcher */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1A060A] to-[#0E0305] border border-[#C41E3A]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C41E3A]/20 text-[#39A8CE] flex items-center justify-center shrink-0 border border-[#C41E3A]/40">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#111827]">
              Devotional Vocal Songs • 100% Free Full Listening
            </h3>
            <p className="text-xs text-[#4B5563]">
              Rev. Tony Prakash's 68 spiritual songs are free to stream anytime.
            </p>
          </div>
        </div>

        {/* Link to Dedicated Studio Backing Tracks Page */}
        <Link
          to="/tracks"
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-[#C9B27C]/15 hover:bg-[#C9B27C] text-[#E8DCB8] hover:text-[#0E0305] border border-[#C9B27C]/40 transition-all flex items-center justify-center gap-2 shrink-0 group shadow-sm"
        >
          <Disc3 className="w-4 h-4 text-[#C9B27C] group-hover:text-[#0E0305]" />
          <span>Switch to Studio Backing Tracks (57) • ₹99</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 2. Header & Search Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#111827]">
              {isLikedFilter ? 'Liked Devotional Songs' : 'Devotional Songs Catalogue'}
            </h1>
            <p className="text-xs sm:text-sm text-[#C9B27C]">
              {isLikedFilter
                ? 'మీరు ఇష్టపడిన భక్తి గీతాల సమాహారం'
                : 'దైవజనులు టోనీ ప్రకాష్ సమగ్ర భక్తి గీతాలు (All 68 Vocal Devotionals — Free to Listen)'}
            </p>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4B5563]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search devotional songs by Telugu or English name (e.g. Nee Prema, ప్రార్థన)..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#F9FAFB] border border-[#C41E3A]/30 text-sm text-[#FFFFFF] placeholder-[#E2CBD0]/60 focus:outline-none focus:border-[#C9B27C] shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#4B5563] hover:text-[#FFFFFF]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                if (isLikedFilter) {
                  const p = new URLSearchParams(searchParams);
                  p.delete('filter');
                  setSearchParams(p);
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeCategory === cat.id && !isLikedFilter
                  ? 'bg-gradient-to-r from-[#C41E3A] to-[#8B1524] text-[#FFFFFF] shadow-[0_0_15px_rgba(27,124,157,0.4)]'
                  : 'bg-[#F9FAFB] text-[#4B5563] hover:text-[#FFFFFF] hover:bg-[#F9FAFB] border border-[#C41E3A]/20'
              }`}
            >
              <span>{cat.en}</span>
              <span className="font-telugu text-[10px] opacity-75">{cat.te}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Browse Tiles (if no active search) */}
      {!searchQuery && !isLikedFilter && activeCategory === 'ALL' && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C9B27C]" />
            <h2 className="text-sm font-semibold tracking-wider uppercase text-[#111827]">
              Spiritual Atmospheres • ఆత్మీయ విభాగములు
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {browseTiles.map((tile) => (
              <div
                key={tile.id}
                onClick={() => setActiveCategory(tile.id)}
                className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${tile.bg} cursor-pointer group hover:scale-[1.02] transition-transform duration-300 border border-white/10 shadow-lg min-h-[120px] sm:min-h-[140px] flex flex-col justify-between`}
              >
                <div>
                  <h3 className="font-heading font-bold text-sm sm:text-base text-[#111827] group-hover:text-white">
                    {tile.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-white/80 line-clamp-2 mt-1">
                    {tile.subtitle}
                  </p>
                </div>
                <img
                  src={tile.img}
                  alt={tile.title}
                  className="absolute -right-3 -bottom-3 w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover rotate-12 shadow-2xl group-hover:rotate-6 transition-transform opacity-90 border border-white/20"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Songs Table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#4B5563]">
          <span>Showing {sortedTracks.length} Devotional Vocal Songs</span>
          {isLikedFilter && (
            <button
              onClick={() => {
                const p = new URLSearchParams(searchParams);
                p.delete('filter');
                setSearchParams(p);
              }}
              className="text-[#C9B27C] hover:underline"
            >
              Clear Liked Filter
            </button>
          )}
        </div>

        <div className="bg-[#F9FAFB]/60 rounded-2xl border border-[#C41E3A]/20 shadow-lg">
          <div className="divide-y divide-[#C41E3A]/10">
            {sortedTracks.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Music className="w-12 h-12 text-[#4B5563]/40 mx-auto" />
                <h4 className="text-base font-semibold text-[#111827]">No songs found</h4>
                <p className="text-xs text-[#4B5563]">
                  Try adjusting your search terms or selecting another category.
                </p>
              </div>
            ) : (
              sortedTracks.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;
                const isThisPlaying = isCurrent && isPlaying;
                const liked = isLiked(track.id);

                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, sortedTracks)}
                    className={`group relative flex items-center justify-between px-4 py-3 sm:py-3.5 hover:bg-[#FEE2E2]/70 transition-colors cursor-pointer first:rounded-t-2xl last:rounded-b-2xl ${
                      isCurrent ? 'bg-[#FEE2E2]/90' : ''
                    }`}
                  >
                    {/* Left: Index & Art & Title */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <span className="font-mono text-xs text-[#4B5563] w-5 sm:w-6 text-center shrink-0">
                        {isThisPlaying ? (
                          <div className="flex items-end justify-center gap-0.5 h-3.5">
                            <span className="w-0.5 bg-[#C9B27C] rounded-full wave-bar-1" />
                            <span className="w-0.5 bg-[#C9B27C] rounded-full wave-bar-2" />
                            <span className="w-0.5 bg-[#C9B27C] rounded-full wave-bar-3" />
                            <span className="w-0.5 bg-[#C9B27C] rounded-full wave-bar-4" />
                          </div>
                        ) : (
                          idx + 1
                        )}
                      </span>

                      <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-[#F3F4F6] shrink-0 border border-[#C41E3A]/20 shadow-sm">
                        <img
                          src={track.coverImage || '/covers/001_prayermp3.jpg'}
                          alt={track.titleEnglish}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-4 h-4 text-[#FFFFFF] fill-current" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 pr-2">
                        <h4
                          className={`text-sm sm:text-base font-semibold truncate leading-snug ${
                            isCurrent ? 'text-[#C41E3A]' : 'text-[#FFFFFF]'
                          }`}
                        >
                          {track.titleEnglish}
                        </h4>
                        <p className="font-telugu text-xs text-[#C9B27C] truncate mt-0.5 leading-snug">
                          {track.titleTelugu}
                        </p>
                        <p className="text-[10px] text-[#4B5563] truncate hidden sm:block mt-0.5">
                          Rev. Tony Prakash • Devotional Sanctuary
                        </p>
                      </div>
                    </div>

                    {/* Right: Free Listening badge (desktop), Like, Duration, 3-dots Menu */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-2">
                      <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        100% Free
                      </span>

                      {/* Like Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLikeTrack(track.id);
                        }}
                        className={`p-1.5 transition-colors hidden sm:block ${
                          liked ? '!opacity-100 text-[#C9B27C]' : 'text-[#4B5563] hover:text-[#FFFFFF]'
                        }`}
                        title={liked ? 'Liked' : 'Like'}
                      >
                        <Heart className={`w-4 h-4 ${liked ? 'fill-[#C9B27C]' : ''}`} />
                      </button>

                      {/* Duration */}
                      <span className="font-mono text-xs text-[#4B5563] hidden xs:inline-block px-1">
                        {track.duration}
                      </span>

                      {/* 3-Dots Action Menu (Play Next, Add to Queue, Like, Lyrics, Share, Download) */}
                      <TrackActionMenu
                        track={track}
                        onOpenLyrics={(t) => setSelectedTrack(t)}
                        onDownload={handleDownloadSong}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Lyrics Modal */}
      {selectedTrack && (
        <LyricsModal track={selectedTrack} onClose={() => setSelectedTrack(null)} />
      )}
    </div>
  );
};
