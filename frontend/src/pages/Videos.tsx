import React, { useEffect, useState, useMemo } from 'react';
import {
  Youtube,
  Play,
  ExternalLink,
  Video as VideoIcon,
  Search,
  Sparkles,
  Share2,
  Check,
  Eye,
  Calendar,
  Clock,
  Filter,
} from 'lucide-react';
import { Video } from '../types/index.js';
import { api } from '../services/api.js';
import { SEO } from '../components/SEO.js';
import { VideoModal } from '../components/VideoModal.js';

const CATEGORIES = [
  'All Videos',
  'Devotional Release',
  'Live Worship',
  'Official Music Video',
  'Special Promo',
];

export const VideosPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [modalVideo, setModalVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Videos');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadVideos() {
      try {
        const data = await api.videos.getAll();
        setVideos(data);
        if (data.length > 0) {
          setActiveVideo(data[0]);
        }
      } catch (err) {
        console.error('Failed to load videos:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadVideos();
  }, []);

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.title.toLowerCase().includes(q) ||
        (v.description && v.description.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === 'All Videos' ||
        (v.category && v.category.toLowerCase() === selectedCategory.toLowerCase()) ||
        (selectedCategory === 'Devotional Release' && (!v.category || v.category === 'Devotional Release'));

      return matchesSearch && matchesCat;
    });
  }, [videos, searchQuery, selectedCategory]);

  const handleShare = (video: Video) => {
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${video.youtubeId}`);
    setCopiedId(video.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSelectVideo = (video: Video) => {
    setModalVideo(video);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <SEO
        title="Official Worship & Devotional Videos — Rev. Tony Prakash"
        description="Watch all official gospel releases, worship concerts, and spiritual songs posted by Rev. Tony Prakash. High-definition YouTube embeds and live praise sessions."
        canonical="https://tonyprakash.com/videos"
      />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#D4A017] font-semibold font-mono">
            <Youtube className="w-4 h-4 text-red-500 fill-current" />
            <span>@TonyPrakashOfficial • Official YouTube Channel</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#1D1D1F]">
            Official Worship & Devotional Videos
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] max-w-2xl leading-relaxed">
            All music releases, worship sessions, and gospel songs posted by Rev. Tony Prakash directly embedded from his official YouTube channel.
          </p>
        </div>

        <a
          href="https://www.youtube.com/@TonyPrakashOfficial"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-lg self-start md:self-auto hover:shadow-red-600/30"
        >
          <Youtube className="w-4 h-4 fill-current" />
          <span>Subscribe ({videos.length}+ Videos)</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1" />
        </a>
      </div>

      {/* FEATURED THEATRE YOUTUBE EMBED PLAYER */}
      {activeVideo && (
        <section className="rounded-3xl p-4 sm:p-6 bg-white border border-[#E5E5EA] shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#D4A017] font-mono">
            <span className="flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>FEATURED WORSHIP VIDEO • {activeVideo.category || 'Official Release'}</span>
            </span>
            <div className="flex items-center gap-4 text-[#86868B]">
              {activeVideo.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#FA243C]" />
                  {activeVideo.duration}
                </span>
              )}
              {activeVideo.views && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-[#FA243C]" />
                  {activeVideo.views}
                </span>
              )}
              {activeVideo.published && (
                <span className="flex items-center gap-1 hidden sm:inline-flex">
                  <Calendar className="w-3.5 h-3.5 text-[#FA243C]" />
                  {activeVideo.published}
                </span>
              )}
            </div>
          </div>

          {/* 16:9 Responsive High-Definition YouTube Embed */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-[#FA243C]/50">
            <iframe
              key={activeVideo.youtubeId}
              src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={activeVideo.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Video Information Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E5E5EA]">
            <div className="space-y-1 min-w-0">
              <h2 className="font-telugu text-lg sm:text-xl font-bold text-[#1D1D1F]">
                {activeVideo.title}
              </h2>
              <p className="text-xs text-[#86868B] line-clamp-2">
                {activeVideo.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleShare(activeVideo)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F5F7] hover:bg-[#FEE2E2] text-xs text-[#FFFFFF] border border-[#E5E5EA] transition-colors"
                title="Copy Video Link"
              >
                {copiedId === activeVideo.id ? (
                  <Check className="w-3.5 h-3.5 text-[#D4A017]" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                <span>{copiedId === activeVideo.id ? 'Copied Link' : 'Share'}</span>
              </button>

              <a
                href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FA243C] hover:bg-[#D71A30] text-xs text-white font-semibold transition-colors shadow"
              >
                <Youtube className="w-3.5 h-3.5 fill-current" />
                <span>Watch on YouTube</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* FILTER CONTROLS & SEARCH */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#FA243C] absolute left-4 top-3" />
            <input
              type="text"
              placeholder={`Search all ${videos.length} videos (e.g. 'నజరేయుడైన', 'Sree Yesu')...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-[#FFFFFF] placeholder-[#E2CBD0]/60 focus:outline-none focus:border-[#D4A017] transition-colors"
            />
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 text-xs font-mono text-[#86868B]">
            <span className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#D4A017]" />
              <span>Showing: <strong className="text-[#FFFFFF]">{filteredVideos.length}</strong> of {videos.length}</span>
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'bg-[#FA243C] border-[#FA243C] text-white shadow-md'
                    : 'bg-[#F5F5F7]/80 border-[#E5E5EA] text-[#86868B] hover:text-[#FFFFFF] hover:border-[#E5E5EA]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* VIDEO CARDS GRID */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-2 border-[#FA243C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#86868B]">Loading official YouTube channel video catalog...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA]">
          <VideoIcon className="w-10 h-10 text-[#86868B] mx-auto mb-2" />
          <p className="text-sm text-[#FFFFFF]">No matching videos found in this category.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Videos');
            }}
            className="mt-3 text-xs text-[#D4A017] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => handleSelectVideo(video)}
              className="group cursor-pointer rounded-2xl p-3.5 bg-white hover:bg-red-50/40 border border-[#E5E5EA] hover:border-[#E5E5EA] transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-3 border border-[#E5E5EA] shadow-sm">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FC3C44] to-[#FA243C] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform border border-[#E5E5EA]">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Duration badge */}
                  {video.duration && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 font-mono text-[10px] text-white shadow">
                      {video.duration}
                    </span>
                  )}

                  {/* Category badge */}
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-black/75 font-mono text-[10px] text-[#F5D77F] shadow">
                    {video.category || 'Telugu Worship'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-telugu text-sm font-bold text-[#1D1D1F] group-hover:text-[#FA243C] transition-colors line-clamp-2 leading-snug">
                    {video.title}
                  </h3>
                  <p className="text-xs text-[#86868B] line-clamp-2 leading-relaxed">
                    {video.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5E5EA] flex items-center justify-between text-xs text-[#86868B]">
                <div className="flex items-center gap-2">
                  {video.views && (
                    <span className="flex items-center gap-1 font-mono text-[11px] text-[#D4A017]">
                      <Eye className="w-3 h-3" />
                      {video.views}
                    </span>
                  )}
                  {video.published && (
                    <span className="text-[11px]">
                      • {video.published}
                    </span>
                  )}
                </div>

                <span className="flex items-center gap-1 font-semibold text-[#FA243C] group-hover:translate-x-1 transition-transform">
                  <span>Watch</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popup modal for videos clicked from the grid */}
      <VideoModal video={modalVideo} onClose={() => setModalVideo(null)} />
    </div>
  );
};

export default VideosPage;
