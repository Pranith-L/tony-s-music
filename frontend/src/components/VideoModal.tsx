import React from 'react';
import { X, ExternalLink, Youtube, Clock, Eye, Calendar, Sparkles } from 'lucide-react';
import { Video } from '../types/index.js';

import { createPortal } from 'react-dom';

interface VideoModalProps {
  video: Video | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  if (!video) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] w-screen h-screen min-h-[100dvh] bg-[#030B10]/98 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-gradient-to-b from-[#0E5671]/40 via-[#0B222E] to-[#07151D] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#1B7C9D]/40 shadow-2xl space-y-4 my-auto max-h-[92dvh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#C9B27C]">
            <Sparkles className="w-4 h-4 text-[#C9B27C]" />
            <span className="font-bold">{video.category || 'Official Worship Release'}</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close video"
            className="p-1.5 rounded-full bg-black/60 hover:bg-[#1B7C9D] text-[#A5C1CC] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 16:9 Responsive YouTube Embed */}
        <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-2xl border border-[#1B7C9D]/40">
          <iframe
            key={video.youtubeId}
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Video Information Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <h3 className="font-telugu text-base sm:text-xl font-bold text-[#EDF5F8] leading-snug">
                {video.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#A5C1CC] font-mono">
                {video.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#1B7C9D]" />
                    {video.duration}
                  </span>
                )}
                {video.views && (
                  <span className="flex items-center gap-1 text-[#C9B27C]">
                    <Eye className="w-3.5 h-3.5" />
                    {video.views}
                  </span>
                )}
                {video.published && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#1B7C9D]" />
                    {video.published}
                  </span>
                )}
              </div>
            </div>

            <a
              href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition-all shadow-md shrink-0 self-start"
            >
              <Youtube className="w-3.5 h-3.5 fill-current" />
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>

          {video.description && (
            <p className="text-xs text-[#A5C1CC] leading-relaxed max-w-3xl line-clamp-2">
              {video.description}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
