import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
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

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 224; // 14rem = 224px
    const estimatedMenuHeight = 340;
    const padding = 12;

    // Horizontal position: align with right edge of button, clamped to screen
    let right = window.innerWidth - rect.right;
    if (right < padding) right = padding;
    if (right + menuWidth > window.innerWidth - padding) {
      right = Math.max(padding, window.innerWidth - menuWidth - padding);
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const style: React.CSSProperties = {
      position: 'fixed',
      right: `${Math.round(right)}px`,
      width: '14rem',
      maxWidth: `calc(100vw - 24px)`,
      zIndex: 99999,
    };

    // If there is enough room below (at least 320px) OR if there's more room below than above:
    if (spaceBelow >= estimatedMenuHeight || spaceBelow >= spaceAbove) {
      style.top = `${Math.round(rect.bottom + 6)}px`;
      style.maxHeight = `${Math.max(180, Math.round(spaceBelow - 16))}px`;
    } else {
      style.bottom = `${Math.round(window.innerHeight - rect.top + 6)}px`;
      style.maxHeight = `${Math.max(180, Math.round(spaceAbove - 16))}px`;
    }

    setMenuStyle(style);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = (e: Event) => {
      // If the scroll happened inside the dropdown menu itself, don't close
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
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

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className={`relative inline-block ${className}`}>
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

      {isOpen &&
        createPortal(
          <>
            {/* Backdrop overlay to capture all outside clicks/taps */}
            <div
              className="fixed inset-0 z-[99998] bg-black/15 backdrop-blur-[0.5px] transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            />

            {/* Menu Popover - Rendered directly onto document.body to prevent clipping by overflow-hidden containers */}
            <div
              ref={menuRef}
              style={menuStyle}
              data-testid="track-action-dropdown"
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-2xl py-2 text-xs font-semibold text-[#1D1D1F] dark:text-white animate-fadeIn select-none overflow-y-auto"
            >
              {/* Quick Track Header */}
              <div className="px-3 py-1.5 border-b border-[#E5E5EA] dark:border-[#2C2C2E] mb-1">
                <p className="text-[11px] font-bold text-[#1D1D1F] dark:text-white truncate">{track.titleEnglish}</p>
                <p className="font-telugu text-[10px] text-[#86868B] dark:text-[#A1A1AA] truncate">{track.titleTelugu}</p>
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
