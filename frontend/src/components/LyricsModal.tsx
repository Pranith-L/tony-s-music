import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, Pause, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import { Track } from '../types/index.js';
import { usePlayer } from '../context/PlayerContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { RazorpayModal } from './RazorpayModal.js';

interface LyricsModalProps {
  track: Track | null;
  onClose: () => void;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({ track, onClose }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const { user, isSubscriber } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState<any>(null);

  if (!track) return null;

  const isCurrent = currentTrack?.id === track.id;
  const isThisPlaying = isCurrent && isPlaying;

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const handleDownload = async () => {
    if (!user) {
      alert('Please sign in to download audio.');
      return;
    }
    setDownloading(true);
    try {
      const data = await api.downloads.requestToken(track.id);
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    } catch (err: any) {
      alert(err.message || 'Active subscription or single track purchase (₹99) required.');
    } finally {
      setDownloading(false);
    }
  };

  const handleBuySingleTrack = async () => {
    if (!user) {
      alert('Please sign in to purchase this backing track download.');
      return;
    }
    setPurchasing(true);
    try {
      const order = await api.payments.createOrder(track.id);
      setRazorpayOrder(order);
      setShowRazorpay(true);
    } catch (err: any) {
      alert(err.message || 'Could not initiate backing track order.');
    } finally {
      setPurchasing(false);
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      const verified = await api.payments.verifyOrder(paymentData);
      if (verified.success) {
        setPurchaseSuccess(true);
        setShowRazorpay(false);
      } else {
        alert('Payment verification failed on the server.');
      }
    } catch (err: any) {
      alert(err.message || 'Payment verification failed.');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] w-screen h-screen min-h-[100dvh] bg-[#030B10]/98 backdrop-blur-2xl overflow-y-auto p-3 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-2xl bg-[#22070D] rounded-2xl p-6 sm:p-8 my-auto max-h-[88vh] overflow-y-auto border border-[#C9B27C]/40 shadow-[0_25px_80px_rgba(0,0,0,0.95)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close track details"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-[#1A060A] hover:bg-[#340C14] border border-[#C41E3A]/40 text-[#E2CBD0] hover:text-[#FFFFFF] flex items-center justify-center transition-colors shadow-md z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header info */}
        <div className="flex flex-col sm:flex-row gap-5 items-start pb-6 border-b border-[#C41E3A]/20 pr-8">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-[#26080F] border border-[#C9B27C]/40 shrink-0 shadow-lg">
            <img
              src={track.coverImage || '/hero_tony_prakash.png'}
              alt={track.titleEnglish}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-semibold bg-[#C41E3A]/20 text-[#C41E3A] border border-[#C41E3A]/40">
                {track.category}
              </span>
              {track.isSubscriberOnly && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-950/80 text-amber-300 border border-amber-600/40">
                  Subscriber Exclusive
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#FFFFFF] leading-tight">
              {track.titleEnglish}
            </h2>
            <p className="text-xs text-[#E2CBD0]">
              {track.singer || 'Rev. Tony Prakash'} • {track.composer || 'Rev. Tony Prakash'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handlePlay}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#C41E3A] to-[#8B1524] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-transform border border-[#C9B27C]/40"
              >
                {isThisPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                <span>{isThisPlaying ? 'Pause' : 'Play Track'}</span>
              </button>

              {track.isDownloadable && (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A060A] border border-[#C9B27C]/40 text-xs text-[#C9B27C] hover:bg-[#340C14] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Audio</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Purchase Notification banner if applicable */}
        {purchaseSuccess && (
          <div className="my-4 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3 shadow-md">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold">Track Download Purchased Successfully!</div>
              <div>You can now download this high-fidelity audio track at any time.</div>
            </div>
          </div>
        )}

        {/* Credits Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-[#C41E3A]/15 text-xs">
          <div>
            <span className="text-[#E2CBD0]/70 block text-[10px] uppercase font-mono">Singer</span>
            <span className="text-[#FFFFFF] font-medium">{track.singer}</span>
          </div>
          <div>
            <span className="text-[#E2CBD0]/70 block text-[10px] uppercase font-mono">Lyrics</span>
            <span className="text-[#FFFFFF] font-medium">{track.lyricist}</span>
          </div>
          <div>
            <span className="text-[#E2CBD0]/70 block text-[10px] uppercase font-mono">Composer</span>
            <span className="text-[#FFFFFF] font-medium">{track.composer}</span>
          </div>
          <div>
            <span className="text-[#E2CBD0]/70 block text-[10px] uppercase font-mono">Release Year</span>
            <span className="text-[#FFFFFF] font-medium">{track.releaseYear}</span>
          </div>
        </div>

        {/* Lyrics Section */}
        <div className="pt-6 space-y-6">
          {track.lyricsTelugu ? (
            <div>
              <h4 className="text-xs uppercase tracking-widest text-[#C9B27C] font-semibold mb-3">
                Telugu Lyrics (సాహిత్యం)
              </h4>
              <div className="font-telugu text-sm leading-relaxed whitespace-pre-line text-[#FFFFFF]/90 p-4 rounded-xl bg-[#0E0305]/80 border border-[#C41E3A]/20">
                {track.lyricsTelugu}
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#E2CBD0] italic">
              Lyrics are being transcribed and verified from the official recordings.
            </p>
          )}

          {track.lyricsEnglish && (
            <div>
              <h4 className="text-xs uppercase tracking-widest text-[#C9B27C] font-semibold mb-3">
                English Translation / Transliteration
              </h4>
              <div className="text-xs leading-relaxed whitespace-pre-line text-[#E2CBD0] p-4 rounded-xl bg-[#0E0305]/60 border border-[#C41E3A]/20">
                {track.lyricsEnglish}
              </div>
            </div>
          )}
        </div>

        {/* If Backing Track: One-time ₹99 purchase */}
        {track.isTrack && !purchaseSuccess && (
          <div className="mt-6 p-4 rounded-xl bg-[#0E0305]/90 border border-[#C9B27C]/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div>
              <div className="text-xs font-semibold text-[#C9B27C] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Official Studio Backing Track</span>
              </div>
              <p className="text-[11px] text-[#E2CBD0]">
                High-fidelity minus-one / karaoke track for churches and worship leaders at ₹99 each.
              </p>
            </div>
            <button
              onClick={handleBuySingleTrack}
              disabled={purchasing}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C9B27C] to-[#E5D7A8] text-[#0E0305] text-xs font-bold uppercase tracking-wider shrink-0 hover:scale-105 transition-transform shadow-md"
            >
              {purchasing ? 'Processing...' : 'Buy Track (₹99)'}
            </button>
          </div>
        )}

        {/* If Vocal Song: Requires ₹299 One-Time Pass */}
        {!track.isTrack && !isSubscriber && (
          <div className="mt-6 p-4 rounded-xl bg-[#0E0305]/90 border border-[#C41E3A]/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div>
              <div className="text-xs font-semibold text-[#C41E3A] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C9B27C]" />
                <span>Vocal Song Download • One-Time Pass Exclusive</span>
              </div>
              <p className="text-[11px] text-[#E2CBD0]">
                Devotional vocal songs can be downloaded with the One-Time Pass (₹299). Backing tracks are unlocked separately.
              </p>
            </div>
            <a
              href="/membership"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C41E3A] to-[#8B1524] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider shrink-0 hover:scale-105 transition-transform shadow-md border border-[#C9B27C]/40"
            >
              Get One-Time Pass (₹299)
            </a>
          </div>
        )}

        {/* Razorpay Checkout Modal for ₹99 track purchase */}
        {showRazorpay && razorpayOrder && (
          <RazorpayModal
            isOpen={showRazorpay}
            orderId={razorpayOrder.orderId}
            amountPaise={razorpayOrder.amountPaise || 9900}
            itemTitle={`Backing Track: ${track.titleEnglish}`}
            itemSubtitle={track.titleTelugu ? `ట్రాక్: ${track.titleTelugu}` : 'Studio Karaoke Master'}
            isSubscription={false}
            userEmail={user?.email}
            userName={user?.name}
            onSuccess={handlePaymentSuccess}
            onClose={() => setShowRazorpay(false)}
          />
        )}
      </div>
    </div>,
    document.body
  );
};
