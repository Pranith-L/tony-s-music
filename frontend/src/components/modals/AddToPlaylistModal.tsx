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
      className="fixed inset-0 z-[200] w-screen h-screen min-h-[100dvh] bg-[#030B10]/98 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#22070D] border border-[#C41E3A]/40 rounded-3xl p-6 shadow-2xl text-[#FFFFFF] space-y-5 animate-scaleUp my-auto max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#C41E3A]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#26080F] border border-[#C41E3A]/30 flex items-center justify-center">
              <ListMusic className="w-5 h-5 text-[#C9B27C]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Add to Playlist</h3>
              <p className="text-xs text-[#E2CBD0] truncate max-w-[220px]">
                {track.titleEnglish} • {track.titleTelugu}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#E2CBD0] hover:text-white hover:bg-[#340C14] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className="p-2.5 rounded-xl bg-[#C41E3A]/20 border border-[#C41E3A]/40 text-xs text-[#8CE2FF] text-center animate-fadeIn font-semibold">
            {feedback}
          </div>
        )}

        {/* Playlists List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {playlists.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#E2CBD0]">
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
                      ? 'bg-[#340C14] border-[#C9B27C]/60 text-white shadow-md'
                      : 'bg-[#1A060A]/80 border-[#C41E3A]/20 text-[#FFFFFF] hover:bg-[#340C14]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#0E0305] border border-[#C41E3A]/30 flex items-center justify-center shrink-0">
                      <Music className="w-4 h-4 text-[#C9B27C]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs truncate">{pl.name}</p>
                      <p className="text-[10px] text-[#E2CBD0]">
                        {pl.trackIds.length} {pl.trackIds.length === 1 ? 'song' : 'songs'}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                      inPlaylist
                        ? 'bg-[#C9B27C] border-[#C9B27C] text-[#0E0305]'
                        : 'border-[#E2CBD0]/40 text-transparent hover:border-white'
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
          <form onSubmit={handleCreateNew} className="space-y-3 pt-2 border-t border-[#C41E3A]/20">
            <input
              type="text"
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Morning Worship, Choir Songs..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#0E0305] border border-[#C41E3A]/40 text-xs text-white placeholder-[#E2CBD0]/60 focus:outline-none focus:border-[#C9B27C]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-[#E2CBD0] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#C41E3A] to-[#8B1524] text-xs font-bold text-white disabled:opacity-50 hover:brightness-110"
              >
                Create & Add
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full py-2.5 rounded-2xl border border-dashed border-[#C41E3A]/50 hover:border-[#C9B27C] text-xs font-semibold text-[#8CE2FF] hover:text-white hover:bg-[#340C14]/40 flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Playlist</span>
          </button>
        )}

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#1A060A] hover:bg-[#340C14] text-xs font-semibold text-[#E2CBD0] hover:text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
