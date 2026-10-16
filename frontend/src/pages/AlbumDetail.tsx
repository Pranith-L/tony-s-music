import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Play,
  Pause,
  Disc3,
  Share2,
  Calendar,
  Clock,
  Sparkles,
  ChevronLeft,
  FileText,
  Heart,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Album, Track } from '../types/index.js';
import { api } from '../services/api.js';
import { usePlayer } from '../context/PlayerContext.js';
import { LyricsModal } from '../components/LyricsModal.js';
import { TrackActionMenu } from '../components/layout/TrackActionMenu.js';

export const AlbumDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    isLiked,
    toggleLikeTrack,
  } = usePlayer();

  useEffect(() => {
    async function loadAlbum() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const data = await api.albums.getBySlug(slug);
        setAlbum(data);
      } catch (err) {
        console.error('Failed to load album:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAlbum();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-2 border-[#1B7C9D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#A5C1CC]">Loading album details...</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-2xl font-heading text-[#EDF5F8]">Album Not Found</h2>
        <Link to="/albums" className="text-xs text-[#1B7C9D] hover:underline">
          Return to Discography
        </Link>
      </div>
    );
  }

  const tracks = album.tracks || [];

  const handlePlayAlbum = () => {
    if (tracks.length > 0) {
      if (currentTrack && tracks.some((t) => t.id === currentTrack.id)) {
        togglePlay();
      } else {
        playTrack(tracks[0], tracks);
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isCurrentAlbumPlaying =
    isPlaying && currentTrack && tracks.some((t) => t.id === currentTrack.id);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Back to Albums Link */}
      <Link
        to="/albums"
        className="inline-flex items-center gap-1.5 text-xs text-[#A5C1CC] hover:text-[#EDF5F8] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to All Albums</span>
      </Link>

      {/* Album Billboard Header */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0E5671]/40 via-[#0B222E] to-[#07151D] border border-[#1B7C9D]/30 grid grid-cols-1 md:grid-cols-12 gap-8 items-end shadow-2xl">
        {/* Cover Art */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#0F2B38] border border-[#1B7C9D]/40 shadow-2xl">
            <img
              src={album.coverImage}
              alt={album.titleEnglish}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Album Meta */}
        <div className="md:col-span-8 lg:col-span-9 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9B27C] font-semibold">
            Album • ఆల్బమ్
          </span>

          <h1 className="text-3xl sm:text-5xl font-heading font-bold text-[#EDF5F8]">
            {album.titleTelugu}
          </h1>
          <p className="text-xl sm:text-2xl text-[#A5C1CC] font-heading font-normal">
            {album.titleEnglish}
          </p>

          <p className="text-xs sm:text-sm text-[#A5C1CC] leading-relaxed max-w-2xl">
            {album.description}
          </p>

          {/* Artist Avatar & Stats Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-[#EDF5F8]">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-[#09212C] border border-[#C9B27C]/50 flex items-center justify-center">
              <img src="/tony_avatar_cutout.png" alt="Tony Prakash" className="w-full h-full object-cover object-center" />
            </div>
            <span className="font-bold">Rev. Tony Prakash</span>
            <span>•</span>
            <span className="text-[#A5C1CC]">{album.releaseYear}</span>
            <span>•</span>
            <span className="text-[#A5C1CC]">{tracks.length} songs</span>
          </div>
        </div>
      </div>

      {/* Action Bar (Big Round Play Button, Heart, Share) */}
      <div className="flex items-center gap-4 py-2">
        <button
          onClick={handlePlayAlbum}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#1B7C9D] via-[#0E5671] to-[#1B7C9D] text-[#EDF5F8] flex items-center justify-center shadow-[0_0_25px_rgba(27,124,157,0.6)] border border-[#C9B27C]/50 hover:scale-105 active:scale-95 transition-all"
          title={isCurrentAlbumPlaying ? 'Pause album' : 'Play album'}
        >
          {isCurrentAlbumPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-1" />
          )}
        </button>

        <button
          onClick={handleShare}
          className="p-3 rounded-full bg-[#0B222E] hover:bg-[#12303E] text-[#A5C1CC] hover:text-[#EDF5F8] border border-[#1B7C9D]/30 transition-colors"
          title="Share album"
        >
          {copied ? <Check className="w-5 h-5 text-[#C9B27C]" /> : <Share2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Tracklist Table */}
      <div className="rounded-2xl bg-[#0B222E]/70 border border-[#1B7C9D]/20 overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2.5 border-b border-[#1B7C9D]/15 text-[11px] font-mono text-[#A5C1CC] uppercase tracking-wider">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-7">Title / కీర్తన</div>
          <div className="col-span-2 text-center">Category</div>
          <div className="col-span-2 text-right pr-2">Duration</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#1B7C9D]/10">
          {tracks.map((track, idx) => {
            const isThisPlaying = currentTrack?.id === track.id && isPlaying;
            const liked = isLiked(track.id);

            return (
              <div
                key={track.id}
                onClick={() => {
                  if (currentTrack?.id === track.id) togglePlay();
                  else playTrack(track, tracks);
                }}
                className={`group grid grid-cols-12 gap-3 sm:gap-4 px-3 sm:px-4 py-3 items-center hover:bg-[#12303E]/80 transition-colors cursor-pointer ${
                  currentTrack?.id === track.id ? 'bg-[#1B7C9D]/15' : ''
                }`}
              >
                <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                  {isThisPlaying ? (
                    <div className="flex items-center gap-0.5">
                      <div className="w-0.5 bg-[#1B7C9D] rounded-full wave-bar-1" />
                      <div className="w-0.5 bg-[#C9B27C] rounded-full wave-bar-2" />
                      <div className="w-0.5 bg-[#1B7C9D] rounded-full wave-bar-3" />
                    </div>
                  ) : (
                    <span className="font-mono text-xs text-[#A5C1CC] group-hover:hidden">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  )}
                  <Play className="w-4 h-4 text-[#EDF5F8] hidden group-hover:block fill-current ml-0.5" />
                </div>

                <div className="col-span-8 sm:col-span-7 min-w-0">
                  <p
                    className={`font-telugu text-sm font-semibold truncate leading-tight ${
                      currentTrack?.id === track.id
                        ? 'text-[#1B7C9D]'
                        : 'text-[#EDF5F8] group-hover:text-[#1B7C9D]'
                    }`}
                  >
                    {track.titleTelugu}
                  </p>
                  <p className="text-[11px] text-[#A5C1CC] truncate">
                    {track.singer || 'Rev. Tony Prakash'} • {track.titleEnglish}
                  </p>
                </div>

                <div className="hidden sm:block col-span-2 text-center text-xs text-[#1B7C9D] font-mono">
                  {track.category}
                </div>

                <div className="col-span-2 text-right flex items-center justify-end gap-1.5 sm:gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLikeTrack(track.id);
                    }}
                    className={`p-1.5 transition-colors hidden sm:block ${
                      liked ? '!opacity-100 text-[#C9B27C]' : 'text-[#A5C1CC] hover:text-[#EDF5F8]'
                    }`}
                    title={liked ? 'Liked' : 'Like'}
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-[#C9B27C]' : ''}`} />
                  </button>

                  <span className="font-mono text-xs text-[#A5C1CC] pr-1 hidden xs:inline">
                    {track.duration}
                  </span>

                  <TrackActionMenu
                    track={track}
                    onOpenLyrics={(t) => setSelectedTrack(t)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lyrics Modal */}
      {selectedTrack && (
        <LyricsModal track={selectedTrack} onClose={() => setSelectedTrack(null)} />
      )}
    </div>
  );
};
