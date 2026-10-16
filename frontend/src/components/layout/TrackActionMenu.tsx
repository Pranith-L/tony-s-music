import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Play,
  ListPlus,
  ListStart,
  Heart,
  FileText,
  Share2,
  Download,
  Lock,
  Check,
  ListMusic,
} from 'lucide-react';
import { Track } from '../../types/index.js';
import { usePlayer } from '../../context/PlayerContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import { AddToPlaylistModal } from '../modals/AddToPlaylistModal.js';

interface TrackActionMenuProps {
  track: Track;
  onOpenLyrics?: (track: Track) => void;
  onBuyTrack?: (track: Track) => void;
  onDownload?: (track: Track) => void;
  className?: string;
}

export const TrackActionMenu: React.FC<TrackActionMenuProps> = ({
  track,
  onOpenLyrics,
  onBuyTrack,
  onDownload,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    isLiked,
    toggleLikeTrack,
    playNextInQueue,
    addToQueue,
    isBackingTrack,
    hasTrackAccess,
  } = usePlayer();

  const { isSubscriber } = useAuth();
  const liked = isLiked(track.id);
  const isBacking = isBackingTrack(track);
  const unlocked = hasTrackAccess(track);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleShare = async () => {
    const url = `${window.location.origin}/music?track=${track.id}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1200);
    }
  };

  return (
    <>
      <div className={`relative ${isOpen ? 'z-50' : 'z-auto'} ${className}`} ref={menuRef}>
        <button
          type="button"
          data-testid={`track-menu-btn-${track.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="w-8 h-8 rounded-full text-[#A5C1CC] hover:text-[#EDF5F8] hover:bg-[#12303E] flex items-center justify-center transition-colors active:scale-95"
          title="More options"
          aria-label="More options"
        >
          <MoreVertical className="w-4 h-4 pointer-events-none" />
        </button>

        {isOpen && (
          <div
            data-testid="track-action-dropdown"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-full mt-1.5 z-[100] w-52 sm:w-56 rounded-2xl bg-[#09212C]/98 backdrop-blur-2xl border border-[#1B7C9D]/50 shadow-[0_12px_40px_rgba(0,0,0,0.9)] py-2 text-xs font-semibold text-[#EDF5F8] animate-fadeIn select-none"
          >
            {/* Quick Track Header */}
            <div className="px-3 py-1.5 border-b border-white/10 mb-1">
              <p className="text-[11px] font-bold text-[#EDF5F8] truncate">{track.titleEnglish}</p>
              <p className="font-telugu text-[10px] text-[#C9B27C] truncate">{track.titleTelugu}</p>
            </div>

            {/* Option: Play Next */}
            <button
              type="button"
              onClick={() => {
                playNextInQueue(track);
                setIsOpen(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-[#12303E] flex items-center gap-2.5 text-[#EDF5F8] transition-colors"
            >
              <ListStart className="w-4 h-4 text-[#1B7C9D]" />
              <span>Play Next</span>
            </button>

            {/* Option: Add to Queue */}
            <button
              type="button"
              onClick={() => {
                addToQueue(track);
                setIsOpen(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-[#12303E] flex items-center gap-2.5 text-[#EDF5F8] transition-colors"
            >
              <ListPlus className="w-4 h-4 text-[#1B7C9D]" />
              <span>Add to Queue</span>
            </button>

            {/* Option: Add to Playlist */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowPlaylistModal(true);
              }}
              className="w-full px-3.5 py-2 hover:bg-[#12303E] flex items-center gap-2.5 text-[#EDF5F8] transition-colors"
            >
              <ListMusic className="w-4 h-4 text-[#C9B27C]" />
              <span>Add to Playlist</span>
            </button>

            {/* Option: Like / Unlike */}
            <button
              type="button"
              onClick={() => {
                toggleLikeTrack(track.id);
                setIsOpen(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-[#12303E] flex items-center gap-2.5 text-[#EDF5F8] transition-colors"
            >
              <Heart className={`w-4 h-4 ${liked ? 'text-[#C9B27C] fill-[#C9B27C]' : 'text-[#A5C1CC]'}`} />
              <span>{liked ? 'Remove from Liked' : 'Save to Liked Songs'}</span>
            </button>

            {/* Option: Lyrics & Info */}
            {onOpenLyrics && (
              <button
                type="button"
                onClick={() => {
                  onOpenLyrics(track);
                  setIsOpen(false);
                }}
                className="w-full px-3.5 py-2 hover:bg-[#12303E] flex items-center gap-2.5 text-[#EDF5F8] transition-colors"
              >
                <FileText className="w-4 h-4 text-[#A5C1CC]" />
                <span>Lyrics & Devotional Info</span>
              </button>
            )}

            {/* Option: Download or Purchase */}
            {isBacking ? (
              unlocked ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onDownload) onDownload(track);
                    setIsOpen(false);
                  }}
                  className="w-full px-3.5 py-2 hover:bg-[#12303E] flex items-center gap-2.5 text-emerald-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Master WAV</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onBuyTrack) {
                      onBuyTrack(track);
                    } else {
                      navigate(`/tracks?buy=${track.id}`);
                    }
                    setIsOpen(false);
                  }}
                  className="w-full px-3.5 py-2 hover:bg-[#12303E] flex items-center gap-2.5 text-[#C9B27C] transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  <span>Unlock Studio Track (₹99)</span>
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (onDownload) {
                    onDownload(track);
                  } else {
                    window.location.href = `/api/download/song/${track.id}`;
                  }
                  setIsOpen(false);
                }}
                className="w-full px-3.5 py-2 hover:bg-[#12303E] flex items-center gap-2.5 text-[#EDF5F8] transition-colors"
              >
                <Download className="w-4 h-4 text-[#A5C1CC]" />
                <span>Download Song Audio</span>
              </button>
            )}

            {/* Option: Share Song */}
            <button
              type="button"
              onClick={handleShare}
              className="w-full px-3.5 py-2 hover:bg-[#12303E] flex items-center gap-2.5 text-[#EDF5F8] transition-colors border-t border-white/5 mt-1 pt-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#A5C1CC]" />
                  <span>Share Song</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {showPlaylistModal && (
        <AddToPlaylistModal track={track} onClose={() => setShowPlaylistModal(false)} />
      )}
    </>
  );
};
export default TrackActionMenu;
