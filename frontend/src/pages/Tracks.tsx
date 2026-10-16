import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Music,
  Play,
  Pause,
  Download,
  Lock,
  Sparkles,
  CheckCircle2,
  FileText,
  Heart,
  Volume2,
  ShieldCheck,
  Disc3,
  X,
  ArrowRight,
} from 'lucide-react';
import { Track } from '../types/index.js';
import { api } from '../services/api.js';
import { usePlayer } from '../context/PlayerContext.js';
import { useAuth } from '../context/AuthContext.js';
import { LyricsModal } from '../components/LyricsModal.js';
import { TrackActionMenu } from '../components/layout/TrackActionMenu.js';
import { RazorpayModal } from '../components/RazorpayModal.js';
import { SEO } from '../components/SEO.js';

export const TracksPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [purchasingTrackId, setPurchasingTrackId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<'ORDER' | 'POPULAR' | 'NEWEST'>('ORDER');

  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    isLiked,
    toggleLikeTrack,
    hasTrackAccess,
    setShowPreviewLimitModal,
    addToQueue,
  } = usePlayer();

  const { user, isSubscriber, refreshUser } = useAuth();

  useEffect(() => {
    async function loadTracks() {
      setIsLoading(true);
      try {
        const all = await api.tracks.getAll();
        // Strict separation: only studio backing tracks (57 tracks)
        const backingTracks = all.filter(
          (t) =>
            t.isTrack ||
            t.category?.toLowerCase() === 'track' ||
            t.category?.toLowerCase() === 'tracks' ||
            (t.downloadPricePaise && t.downloadPricePaise > 0)
        );
        setTracks(backingTracks);
      } catch (err) {
        console.error('Failed to load backing tracks:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTracks();
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set('search', val.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams, { replace: true });
  };

  // Instant client-side search filter
  let displayTracks = tracks;
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    displayTracks = displayTracks.filter((t) => {
      const en = (t.titleEnglish || '').toLowerCase();
      const te = (t.titleTelugu || '').toLowerCase();
      return en.includes(q) || te.includes(q);
    });
  }

  const sortedTracks = [...displayTracks].sort((a, b) => {
    if (sortBy === 'POPULAR') return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    if (sortBy === 'NEWEST') return b.releaseYear - a.releaseYear;
    return a.orderIndex - b.orderIndex;
  });

  const [razorpayOrder, setRazorpayOrder] = useState<{
    orderId: string;
    amount: number;
    track: Track;
  } | null>(null);

  const handleBuyTrack = async (track: Track) => {
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent('/tracks')}`);
      return;
    }

    setPurchasingTrackId(track.id);
    try {
      const order = await api.payments.createOrder(track.id);
      setRazorpayOrder({
        orderId: order.orderId,
        amount: order.amount || 9900,
        track,
      });
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed. Please try again.');
    } finally {
      setPurchasingTrackId(null);
    }
  };

  const handleRazorpaySuccess = async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
    isTestConfirm?: boolean;
  }) => {
    if (!razorpayOrder) return;
    try {
      const verified = await api.payments.verifyOrder({
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        isTestConfirm: paymentData.isTestConfirm ?? true,
      });

      if (verified.success) {
        await refreshUser();
        playTrack(razorpayOrder.track);
        setRazorpayOrder(null);
      }
    } catch (err: any) {
      alert(err.message || 'Payment verification failed');
    }
  };

  const handleDownload = (track: Track) => {
    if (!hasTrackAccess(track)) {
      setShowPreviewLimitModal(true);
      return;
    }
    // Direct audio download in studio WAV / master format
    const link = document.createElement('a');
    link.href = track.audioUrl;
    const isWav = track.audioUrl.toLowerCase().endsWith('.wav');
    link.download = `${track.titleEnglish} - Tony Prakash Backing Track.${isWav ? 'wav' : 'mp3'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <SEO
        title="Studio Backing Tracks (మైనస్-వన్ / కారౌకే) — Rev. Tony Prakash"
        description="Official Telugu Christian backing tracks (minus-one / karaoke) for church choirs, gospel concerts, and solo singing. Instant ₹99 purchase with 24-bit studio WAV download."
        canonical="https://tonyprakash.com/tracks"
      />
      {/* 1. Page Header with Visual Distinction */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-[#0E0305] via-[#0E2838] to-[#12364B] border-2 border-[#C9B27C]/40 shadow-[0_0_50px_rgba(201,178,124,0.15)] overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle,#C9B27C,transparent)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase bg-[#C9B27C]/20 text-[#E8DCB8] border border-[#C9B27C]/40 flex items-center gap-1.5">
                <Disc3 className="w-3.5 h-3.5 text-[#C9B27C]" />
                57 Studio Backing Tracks
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#C41E3A]/30 text-[#8CE2FF] border border-[#C41E3A]/50">
                ₹99 / Track
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#FFFFFF] tracking-tight">
              Studio Backing Tracks
            </h1>
            <p className="font-telugu text-lg sm:text-xl text-[#C9B27C] font-semibold">
              ప్రత్యేక స్టూడియో ట్రాక్స్ సమాహారం (మైనస్-వన్ / కారౌకే)
            </p>
            <p className="text-xs sm:text-sm text-[#E2CBD0] leading-relaxed">
              Professional minus-one instrumental tracks engineered for church choirs, live gospel ministry, and vocal performances. Free users can listen to a <strong className="text-white">30-second studio preview</strong>. Unlock complete tracks & high-fidelity studio WAV downloads for <strong className="text-[#C9B27C]">₹99 each</strong>.
            </p>
          </div>

          {/* Quick Studio Track Purchase Callout */}
          <div className="shrink-0 p-5 rounded-2xl bg-[#0E0305]/90 border border-[#C9B27C]/50 shadow-xl space-y-3 w-full md:w-80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#C9B27C] font-bold">
                Studio Master Tracks
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-[#C9B27C] text-[#0E0305]">
                ₹99 / TRACK
              </span>
            </div>
            <p className="text-xs text-[#E2CBD0]">
              Unlock individual minus-one arrangements with permanent account ownership and offline uncompressed WAV master audio.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] text-[#E2CBD0]">
              <span className="text-emerald-400 font-semibold">✓ 24-bit 48kHz WAV</span>
              <span>•</span>
              <span>Choir & Solo</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E2CBD0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search backing tracks (e.g. Nee Prema, 001)..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#22070D] border border-[#C41E3A]/30 text-xs sm:text-sm text-[#FFFFFF] placeholder-[#E2CBD0]/60 focus:outline-none focus:border-[#C9B27C] shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#E2CBD0] hover:text-[#FFFFFF]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Track Count */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
          <span className="text-xs text-[#E2CBD0] font-mono">
            Showing <strong className="text-white">{sortedTracks.length}</strong> Studio Tracks
          </span>
        </div>
      </div>

      {/* 3. Backing Tracks List */}
      <div className="bg-[#22070D]/60 rounded-3xl border border-[#C41E3A]/20 shadow-2xl">
        <div className="divide-y divide-[#C41E3A]/10">
          {isLoading ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#C9B27C] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#E2CBD0]">Loading studio backing tracks...</p>
            </div>
          ) : sortedTracks.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Disc3 className="w-12 h-12 text-[#E2CBD0]/40 mx-auto" />
              <h4 className="text-base font-semibold text-[#FFFFFF]">No backing tracks found</h4>
              <p className="text-xs text-[#E2CBD0]">Try checking your search terms.</p>
            </div>
          ) : (
            sortedTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isThisPlaying = isCurrent && isPlaying;
              const unlocked = hasTrackAccess(track);
              const liked = isLiked(track.id);
              const isPurchasing = purchasingTrackId === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, sortedTracks)}
                  className={`group relative flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 hover:bg-[#340C14]/80 transition-colors cursor-pointer first:rounded-t-3xl last:rounded-b-3xl ${
                    isCurrent ? 'bg-[#340C14]/95 border-l-4 border-[#C9B27C]' : ''
                  }`}
                >
                  {/* Left: Index, Album Artwork, Title */}
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                    <span className="font-mono text-xs text-[#E2CBD0] w-6 text-center shrink-0">
                      {isThisPlaying ? (
                        <div className="flex items-end justify-center gap-0.5 h-3.5">
                          <span className="w-0.5 bg-[#C9B27C] rounded-full wave-bar-1" />
                          <span className="w-0.5 bg-[#C9B27C] rounded-full wave-bar-2" />
                          <span className="w-0.5 bg-[#C9B27C] rounded-full wave-bar-3" />
                          <span className="w-0.5 bg-[#C9B27C] rounded-full wave-bar-4" />
                        </div>
                      ) : (
                        idx + 1
                      )}
                    </span>

                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-[#26080F] shrink-0 border border-[#C9B27C]/30 shadow-md">
                      <img
                        src={track.coverImage || '/covers/001_prayermp3.jpg'}
                        alt={track.titleEnglish}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {isThisPlaying ? (
                          <Pause className="w-5 h-5 text-[#FFFFFF] fill-current" />
                        ) : (
                          <Play className="w-5 h-5 text-[#FFFFFF] fill-current ml-0.5" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm sm:text-base font-semibold truncate ${
                            isCurrent ? 'text-[#C9B27C]' : 'text-[#FFFFFF]'
                          }`}
                        >
                          {track.titleEnglish}
                        </h4>
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-[#1A060A] text-[#E2CBD0] border border-white/10 shrink-0">
                          Studio Track
                        </span>
                      </div>
                      <p className="font-telugu text-xs sm:text-sm text-[#C9B27C] truncate">
                        {track.titleTelugu}
                      </p>
                      <p className="text-[10px] text-[#E2CBD0] truncate">
                        Rev. Tony Prakash • Minus-One Instrumental
                      </p>
                    </div>
                  </div>

                  {/* Right: Preview badge, Buy / Download action, Duration */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
                    {unlocked ? (
                      <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#C41E3A]/30 text-[#8CE2FF] border border-[#C41E3A]/50 shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-[#39A8CE]" />
                        <span className="hidden sm:inline">Full Track</span> Unlocked
                      </span>
                    ) : (
                      <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <Lock className="w-3 h-3" />
                        30s Preview
                      </span>
                    )}

                    {/* Action Button: Download if unlocked, else Buy Track */}
                    {unlocked ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(track);
                        }}
                        className="hidden sm:flex px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#C41E3A]/20 hover:bg-[#C41E3A] text-[#FFFFFF] border border-[#C41E3A]/40 transition-all items-center gap-1.5 shadow-sm"
                        title="Download Studio WAV"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyTrack(track);
                        }}
                        disabled={isPurchasing}
                        className="hidden sm:flex px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#C9B27C] to-[#E8DCB8] text-[#0E0305] hover:opacity-90 transition-all items-center gap-1.5 shadow-md active:scale-95"
                        title="Buy Full Studio Track for ₹99"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#0E0305]" />
                        <span>{isPurchasing ? 'Processing...' : 'Buy • ₹99'}</span>
                      </button>
                    )}

                    {/* Like Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLikeTrack(track.id);
                      }}
                      className={`p-1.5 transition-colors hidden sm:block ${
                        liked ? '!opacity-100 text-[#C9B27C]' : 'text-[#E2CBD0] hover:text-[#FFFFFF]'
                      }`}
                      title={liked ? 'Liked' : 'Like'}
                    >
                      <Heart className={`w-4 h-4 ${liked ? 'fill-[#C9B27C]' : ''}`} />
                    </button>

                    <span className="font-mono text-xs text-[#E2CBD0] pr-1 hidden sm:inline">
                      {track.duration}
                    </span>

                    {/* 3-Dots Action Menu (Play Next, Add to Queue, Like, Buy Track, Download, Share) */}
                    <TrackActionMenu
                      track={track}
                      onOpenLyrics={(t) => setSelectedTrack(t)}
                      onBuyTrack={handleBuyTrack}
                      onDownload={handleDownload}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Lyrics Modal */}
      {selectedTrack && (
        <LyricsModal track={selectedTrack} onClose={() => setSelectedTrack(null)} />
      )}

      {/* Razorpay Gateway Modal */}
      {razorpayOrder && (
        <RazorpayModal
          isOpen={true}
          orderId={razorpayOrder.orderId}
          amountPaise={razorpayOrder.amount}
          itemTitle={razorpayOrder.track.titleEnglish}
          itemSubtitle={`${razorpayOrder.track.titleTelugu} (Studio Minus-One Track)`}
          isSubscription={false}
          userEmail={user?.email}
          userName={user?.name}
          onSuccess={handleRazorpaySuccess}
          onClose={() => setRazorpayOrder(null)}
        />
      )}
    </div>
  );
};
