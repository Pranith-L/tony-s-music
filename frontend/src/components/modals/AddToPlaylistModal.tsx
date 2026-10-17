import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Check, ListMusic, Music, Lock } from 'lucide-react';
import { Track } from '../../types/index.js';
import { usePlaylists } from '../../context/PlaylistContext.js';
import { useAuth } from '../../context/AuthContext.js';

interface AddToPlaylistModalProps {
  track: Track;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  track,
  onClose,
  onOpenAuth,
}) => {
  const { playlists, createPlaylist, addTrackToPlaylist, removeTrackFromPlaylist, isTrackInPlaylist } = usePlaylists();
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleToggleTrack = (playlistId: string, inPlaylist: boolean) => {
    if (inPlaylist) {
      removeTrackFromPlaylist(playlistId, track.id);
      setFeedback('Removed from playlist');
    } else {
      addTrackToPlaylist(playlistId, track);
      setFeedback('Added to playlist!');
    }
    setTimeout(() => setFeedback(null), 1500);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const pl = createPlaylist(newTitle.trim());
    addTrackToPlaylist(pl.id, track);
    setNewTitle('');
    setShowCreate(false);
    setFeedback(`Created "${pl.name}" and added song!`);
    setTimeout(() => setFeedback(null), 2000);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] w-screen h-screen min-h-[100dvh] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#F5F5F7] border border-[#E5E5EA] rounded-3xl p-6 shadow-2xl text-[#1D1D1F] space-y-5 animate-scaleUp my-auto max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#E5E5EA] flex items-center justify-center">
              <ListMusic className="w-5 h-5 text-[#FA243C]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-[#1D1D1F]">Add to Playlist</h3>
              <p className="text-xs text-[#86868B] truncate max-w-[220px]">
                {track.titleEnglish} • {track.titleTelugu}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#86868B] hover:text-[#FA243C] hover:bg-[#F2F2F7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className="p-2.5 rounded-xl bg-[#FA243C]/10 border border-[#FA243C]/30 text-xs text-[#FA243C] text-center animate-fadeIn font-semibold">
            {feedback}
          </div>
        )}

        {/* Playlists List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {playlists.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#86868B]">
              No playlists found. Create your first playlist below!
            </div>
          ) : (
            playlists.map((pl) => {
              const inPlaylist = isTrackInPlaylist(pl.id, track.id);
              return (
                <div
                  key={pl.id}
                  onClick={() => handleToggleTrack(pl.id, inPlaylist)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                    inPlaylist
                      ? 'bg-[#FEE2E2] border-[#FA243C] text-[#FA243C] shadow-sm font-semibold'
                      : 'bg-white border-[#E5E5EA] text-[#1D1D1F] hover:bg-[#F5F5F7]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E5EA] flex items-center justify-center shrink-0">
                      <Music className="w-4 h-4 text-[#FA243C]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs truncate">{pl.name}</p>
                      <p className="text-[10px] text-[#86868B]">
                        {pl.trackIds.length} {pl.trackIds.length === 1 ? 'song' : 'songs'}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                      inPlaylist
                        ? 'bg-[#FA243C] border-[#FA243C] text-white'
                        : 'border-[#E5E5EA] text-transparent hover:border-[#FA243C]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* New Playlist Form or Button */}
        {showCreate ? (
          <form onSubmit={handleCreateNew} className="space-y-3 pt-2 border-t border-[#E5E5EA]">
            <input
              type="text"
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Morning Worship, Choir Songs..."
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E5E5EA] text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#FA243C]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-[#86868B] hover:text-[#FA243C]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#FC3C44] to-[#FA243C] text-xs font-bold text-white disabled:opacity-50 hover:brightness-110"
              >
                Create & Add
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full py-2.5 rounded-2xl border border-dashed border-[#FA243C]/50 hover:border-[#FA243C] text-xs font-semibold text-[#FA243C] hover:bg-[#FEE2E2]/40 flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Playlist</span>
          </button>
        )}

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-[#F2F2F7] border border-[#E5E5EA] text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
