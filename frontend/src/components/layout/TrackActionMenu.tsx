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
          className="w-8 h-8 rounded-full text-[#86868B] hover:text-[#FA243C] hover:bg-[#F2F2F7] flex items-center justify-center transition-colors active:scale-95"
          title="More options"
          aria-label="More options"
        >
          <MoreVertical className="w-4 h-4 pointer-events-none" />
        </button>

        {isOpen && (
          <div
            data-testid="track-action-dropdown"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-full mt-1.5 z-[100] w-52 sm:w-56 rounded-2xl bg-white/95 backdrop-blur-2xl border border-[#E5E5EA] shadow-xl py-2 text-xs font-semibold text-[#1D1D1F] animate-fadeIn select-none"
          >
            {/* Quick Track Header */}
            <div className="px-3 py-1.5 border-b border-[#E5E5EA] mb-1">
              <p className="text-[11px] font-bold text-[#1D1D1F] truncate">{track.titleEnglish}</p>
              <p className="font-telugu text-[10px] text-[#86868B] truncate">{track.titleTelugu}</p>
            </div>

            {/* Option: Play Next */}
            <button
              type="button"
              onClick={() => {
                playNextInQueue(track);
                setIsOpen(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-[#FEE2E2]/60 flex items-center gap-2.5 text-[#1D1D1F] transition-colors"
            >
              <ListStart className="w-4 h-4 text-[#FA243C]" />
              <span>Play Next</span>
            </button>

            {/* Option: Add to Queue */}
            <button
              type="button"
              onClick={() => {
                addToQueue(track);
                setIsOpen(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-[#FEE2E2]/60 flex items-center gap-2.5 text-[#1D1D1F] transition-colors"
            >
              <ListPlus className="w-4 h-4 text-[#FA243C]" />
              <span>Add to Queue</span>
            </button>

            {/* Option: Add to Playlist */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowPlaylistModal(true);
              }}
              className="w-full px-3.5 py-2 hover:bg-[#FEE2E2]/60 flex items-center gap-2.5 text-[#1D1D1F] transition-colors"
            >
              <ListMusic className="w-4 h-4 text-[#FA243C]" />
              <span>Add to Playlist</span>
            </button>

            {/* Option: Like / Unlike */}
            <button
              type="button"
              onClick={() => {
                toggleLikeTrack(track.id);
                setIsOpen(false);
              }}
              className="w-full px-3.5 py-2 hover:bg-[#FEE2E2]/60 flex items-center gap-2.5 text-[#1D1D1F] transition-colors"
            >
              <Heart className={`w-4 h-4 ${liked ? 'text-[#FA243C] fill-[#FA243C]' : 'text-[#86868B]'}`} />
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
                className="w-full px-3.5 py-2 hover:bg-[#FEE2E2]/60 flex items-center gap-2.5 text-[#1D1D1F] transition-colors"
              >
                <FileText className="w-4 h-4 text-[#86868B]" />
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
                  className="w-full px-3.5 py-2 hover:bg-[#FEE2E2]/60 flex items-center gap-2.5 text-emerald-700 transition-colors"
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
                  className="w-full px-3.5 py-2 hover:bg-[#FEE2E2]/60 flex items-center gap-2.5 text-[#FA243C] transition-colors"
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
                className="w-full px-3.5 py-2 hover:bg-[#FEE2E2]/60 flex items-center gap-2.5 text-[#1D1D1F] transition-colors"
              >
                <Download className="w-4 h-4 text-[#86868B]" />
                <span>Download Song Audio</span>
              </button>
            )}

            {/* Option: Share Song */}
            <button
              type="button"
              onClick={handleShare}
              className="w-full px-3.5 py-2 hover:bg-[#FEE2E2]/60 flex items-center gap-2.5 text-[#1D1D1F] transition-colors border-t border-[#E5E5EA] mt-1 pt-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#86868B]" />
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
