import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreVertical,
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
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    isLiked,
    toggleLikeTrack,
    playNextInQueue,
    addToQueue,
    isBackingTrack,
    hasTrackAccess,
  } = usePlayer();

  const liked = isLiked(track.id);
  const isBacking = isBackingTrack(track);
  const unlocked = hasTrackAccess(track);

  const calculatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownEl = dropdownRef.current;
    const menuHeight = dropdownEl?.offsetHeight || 290;
    const menuWidth = dropdownEl?.offsetWidth || 224;

    const TOP_BAR_HEIGHT = 65;
    const BOTTOM_PLAYER_HEIGHT = 85;

    const spaceAbove = rect.top - TOP_BAR_HEIGHT;
    const spaceBelow = window.innerHeight - rect.bottom - BOTTOM_PLAYER_HEIGHT;

    // Pick vertical direction:
    // If not enough room above, open downward.
    // If not enough room below, open upward.
    // Otherwise open downward to avoid clipping track list headers.
    let openAbove = false;
    if (spaceAbove >= menuHeight && spaceBelow < menuHeight) {
      openAbove = true;
    } else if (spaceBelow >= menuHeight) {
      openAbove = false;
    } else {
      openAbove = spaceAbove > spaceBelow;
    }

    let top = openAbove ? rect.top - menuHeight - 6 : rect.bottom + 6;

    // Clamp top to viewport safe area (below top bar, above bottom player bar)
    const minTop = TOP_BAR_HEIGHT + 6;
    const maxTop = Math.max(minTop, window.innerHeight - BOTTOM_PLAYER_HEIGHT - menuHeight - 6);
    top = Math.max(minTop, Math.min(top, maxTop));

    // Align right edge of menu with right edge of button
    let left = rect.right - menuWidth;
    if (left < 10) left = 10;
    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }

    setCoords({ top, left });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      calculatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      calculatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = (e: Event) => {
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
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
      <div className={`relative inline-flex items-center ${className}`}>
        <button
          ref={buttonRef}
          type="button"
          data-testid={`track-menu-btn-${track.id}`}
          onClick={handleToggle}
          className="w-8 h-8 rounded-full text-[#86868B] hover:text-[#FA243C] hover:bg-[#F2F2F7] dark:hover:bg-white/10 flex items-center justify-center transition-colors active:scale-95"
          title="More options"
          aria-label="More options"
        >
          <MoreVertical className="w-4 h-4 pointer-events-none" />
        </button>
      </div>

      {/* Render Dropdown outside parent containers into body to guarantee zero clipping */}
      {isOpen &&
        createPortal(
          <>
            {/* Backdrop click outside detector */}
            <div
              data-testid="track-action-backdrop"
              className="fixed inset-0 z-[9998] bg-black/15 dark:bg-black/40 backdrop-blur-[0.5px]"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              onContextMenu={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            />

            {/* Floating Dropdown */}
            <div
              ref={dropdownRef}
              data-testid="track-action-dropdown"
              onClick={(e) => e.stopPropagation()}
              style={{
                top: `${coords.top}px`,
                left: `${coords.left}px`,
              }}
              className="fixed z-[9999] w-56 rounded-2xl bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-2xl py-2 text-xs font-semibold text-[#1D1D1F] dark:text-white animate-fadeIn select-none max-h-[min(380px,calc(100vh-160px))] overflow-y-auto"
            >
              {/* Quick Track Header */}
              <div className="px-3.5 py-1.5 border-b border-[#E5E5EA] dark:border-[#2C2C2E] mb-1">
                <p className="text-[11px] font-bold text-[#1D1D1F] dark:text-white truncate">
                  {track.titleEnglish}
                </p>
                <p className="font-telugu text-[10px] text-[#86868B] dark:text-[#A1A1AA] truncate">
                  {track.titleTelugu}
                </p>
              </div>

              {/* Option: Play Next */}
              <button
                type="button"
                onClick={() => {
                  playNextInQueue(track);
                  setIsOpen(false);
                }}
                className="w-full px-3.5 py-2 hover:bg-[#FEE2E2]/60 dark:hover:bg-white/10 flex items-center gap-2.5 text-[#1D1D1F] dark:text-zinc-200 transition-colors"
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
                className="w-full px-3.5 py-2 hover:bg-[#FEE2E2]/60 dark:hover:bg-white/10 flex items-center gap-2.5 text-[#1D1D1F] dark:text-zinc-200 transition-colors"
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
                className="w-full px-3.5 py-2 hover:bg-[#FEE2E2]/60 dark:hover:bg-white/10 flex items-center gap-2.5 text-[#1D1D1F] dark:text-zinc-200 transition-colors"
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
                className="w-full px-3.5 py-2 hover:bg-[#FEE2E2]/60 dark:hover:bg-white/10 flex items-center gap-2.5 text-[#1D1D1F] dark:text-zinc-200 transition-colors"
              >
                <Heart
                  className={`w-4 h-4 ${
                    liked ? 'text-[#FA243C] fill-[#FA243C]' : 'text-[#86868B]'
                  }`}
                />
                <span>{liked ? 'Remove from Liked' : 'Save to Liked Songs'}</span>
              </button>

              {/* Option: Lyrics & Devotional Info */}
              {onOpenLyrics && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenLyrics(track);
                    setIsOpen(false);
                  }}
                  className="w-full px-3.5 py-2 hover:bg-[#FEE2E2]/60 dark:hover:bg-white/10 flex items-center gap-2.5 text-[#1D1D1F] dark:text-zinc-200 transition-colors"
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
                    className="w-full px-3.5 py-2 hover:bg-[#FEE2E2]/60 dark:hover:bg-white/10 flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-semibold transition-colors"
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
                    className="w-full px-3.5 py-2 hover:bg-[#FEE2E2]/60 dark:hover:bg-white/10 flex items-center gap-2.5 text-[#FA243C] font-semibold transition-colors"
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
                  className="w-full px-3.5 py-2 hover:bg-[#FEE2E2]/60 dark:hover:bg-white/10 flex items-center gap-2.5 text-[#1D1D1F] dark:text-zinc-200 transition-colors"
                >
                  <Download className="w-4 h-4 text-[#86868B]" />
                  <span>Download Song Audio</span>
                </button>
              )}

              {/* Option: Share Song */}
              <button
                type="button"
                onClick={handleShare}
                className="w-full px-3.5 py-2 hover:bg-[#FEE2E2]/60 dark:hover:bg-white/10 flex items-center gap-2.5 text-[#1D1D1F] dark:text-zinc-200 transition-colors border-t border-[#E5E5EA] dark:border-[#2C2C2E] mt-1 pt-2"
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
          </>,
          document.body
        )}

      {showPlaylistModal && (
        <AddToPlaylistModal track={track} onClose={() => setShowPlaylistModal(false)} />
      )}
    </>
  );
};
export default TrackActionMenu;
