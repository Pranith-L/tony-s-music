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
        <div className="w-10 h-10 border-2 border-[#FA243C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#86868B]">Loading album details...</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-2xl font-heading text-[#1D1D1F]">Album Not Found</h2>
        <Link to="/albums" className="text-xs text-[#FA243C] hover:underline">
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
        className="inline-flex items-center gap-1.5 text-xs text-[#86868B] hover:text-[#FA243C] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to All Albums</span>
      </Link>

      {/* Album Billboard Header */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#FEE2E2]/60 via-[#F5F5F7] to-[#FFFFFF] border border-[#E5E5EA] grid grid-cols-1 md:grid-cols-12 gap-8 items-end shadow-sm">
        {/* Cover Art */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F2F2F7] border border-[#E5E5EA] shadow-xl">
            <img
              src={album.coverImage}
              alt={album.titleEnglish}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Album Meta */}
        <div className="md:col-span-8 lg:col-span-9 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#FA243C] font-semibold">
            Album • ఆల్బమ్
          </span>

          <h1 className="text-3xl sm:text-5xl font-heading font-bold text-[#1D1D1F]">
            {album.titleTelugu}
          </h1>
          <p className="text-xl sm:text-2xl text-[#86868B] font-heading font-normal">
            {album.titleEnglish}
          </p>

          <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed max-w-2xl">
            {album.description}
          </p>

          {/* Artist Avatar & Stats Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-[#1D1D1F]">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center">
              <img src="/tony_avatar_cutout.png" alt="Tony Prakash" className="w-full h-full object-cover object-center" />
            </div>
            <span className="font-bold">Rev. Tony Prakash</span>
            <span>•</span>
            <span className="text-[#86868B]">{album.releaseYear}</span>
            <span>•</span>
            <span className="text-[#86868B]">{tracks.length} songs</span>
          </div>
        </div>
      </div>

      {/* Action Bar (Big Round Play Button, Heart, Share) */}
      <div className="flex items-center gap-4 py-2">
        <button
          onClick={handlePlayAlbum}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FC3C44] to-[#FA243C] text-[#FFFFFF] flex items-center justify-center shadow-md border border-[#FA243C]/40 hover:scale-105 active:scale-95 transition-all"
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
          className="p-3 rounded-full bg-[#F5F5F7] hover:bg-[#FEE2E2] text-[#86868B] hover:text-[#FA243C] border border-[#E5E5EA] transition-colors"
          title="Share album"
        >
          {copied ? <Check className="w-5 h-5 text-[#FA243C]" /> : <Share2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Tracklist Table */}
      <div className="rounded-2xl bg-[#F5F5F7]/70 border border-[#E5E5EA] overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2.5 border-b border-[#E5E5EA] text-[11px] font-mono text-[#86868B] uppercase tracking-wider">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-7">Title / కీర్తన</div>
          <div className="col-span-2 text-center">Category</div>
          <div className="col-span-2 text-right pr-2">Duration</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#FA243C]/10">
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
                className={`group grid grid-cols-12 gap-3 sm:gap-4 px-3 sm:px-4 py-3 items-center transition-all cursor-pointer ${
                  currentTrack?.id === track.id ? 'bg-[#FA243C]/10 dark:bg-[#FA243C]/20 border-l-4 border-l-[#FA243C]' : 'hover:bg-[#F2F2F7] dark:hover:bg-white/5'
                }`}
              >
                <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                  {isThisPlaying ? (
                    <>
                      <div className="flex items-center gap-0.5 group-hover:hidden">
                        <div className="w-0.5 bg-[#FA243C] rounded-full wave-bar-1" />
                        <div className="w-0.5 bg-[#D4A017] rounded-full wave-bar-2" />
                        <div className="w-0.5 bg-[#FA243C] rounded-full wave-bar-3" />
                      </div>
                      <Pause className="w-4 h-4 text-[#FA243C] hidden group-hover:block fill-current" />
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-xs text-[#86868B] group-hover:hidden">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <Play className="w-4 h-4 text-[#FA243C] hidden group-hover:block fill-current ml-0.5" />
                    </>
                  )}
                </div>

                <div className="col-span-8 sm:col-span-7 min-w-0">
                  <p
                    className={`font-telugu text-sm font-semibold truncate leading-tight transition-colors ${
                      currentTrack?.id === track.id
                        ? 'text-[#FA243C]'
                        : 'text-[#1D1D1F] group-hover:text-[#FA243C]'
                    }`}
                  >
                    {track.titleTelugu}
                  </p>
                  <p className="text-[11px] text-[#86868B] truncate">
                    {track.singer || 'Rev. Tony Prakash'} • {track.titleEnglish}
                  </p>
                </div>

                <div className="hidden sm:block col-span-2 text-center text-xs text-[#FA243C] font-mono">
                  {track.category}
                </div>

                <div className="col-span-2 text-right flex items-center justify-end gap-1.5 sm:gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLikeTrack(track.id);
                    }}
                    className={`p-1.5 transition-colors hidden sm:block ${
                      liked ? '!opacity-100 text-[#FA243C]' : 'text-[#86868B] hover:text-[#FA243C]'
                    }`}
                    title={liked ? 'Liked' : 'Like'}
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-[#FA243C] text-[#FA243C]' : ''}`} />
                  </button>

                  <span className="font-mono text-xs text-[#86868B] pr-1 hidden xs:inline">
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
