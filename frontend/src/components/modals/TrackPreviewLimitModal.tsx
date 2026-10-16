import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Sparkles, ArrowRight, Download, CheckCircle2 } from 'lucide-react';
import { Track } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { useNavigate } from 'react-router-dom';
import { RazorpayModal } from '../RazorpayModal.js';

interface TrackPreviewLimitModalProps {
  track: Track | null;
  onClose: () => void;
  onUnlocked?: () => void;
}

export const TrackPreviewLimitModal: React.FC<TrackPreviewLimitModalProps> = ({
  track,
  onClose,
  onUnlocked,
}) => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [purchasing, setPurchasing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Razorpay Gateway State
  const [razorpayOrder, setRazorpayOrder] = useState<{
    orderId: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && track && !razorpayOrder) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [track, onClose, razorpayOrder]);

  if (!track) return null;

  const handleBuyTrack = async () => {
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      onClose();
      return;
    }

    setPurchasing(true);
    setErrorMsg(null);
    try {
      const order = await api.payments.createOrder(track.id);
      setRazorpayOrder({
        orderId: order.orderId,
        amount: order.amount || 9900,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment initiation failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRazorpaySuccess = async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
    isTestConfirm?: boolean;
  }) => {
    const verified = await api.payments.verifyOrder({
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_signature: paymentData.razorpay_signature,
      isTestConfirm: paymentData.isTestConfirm ?? true,
    });

    if (verified.success) {
      await refreshUser();
      setRazorpayOrder(null);
      if (onUnlocked) onUnlocked();
      onClose();
    }
  };

  const handleGoMembership = () => {
    navigate('/membership');
    onClose();
  };

  return createPortal(
    <>
      <div
        id="preview-limit-modal-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-[200] w-screen h-screen min-h-[100dvh] bg-[#030B10]/98 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      >
        <div
          id="preview-limit-modal-dialog"
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-[#1A060A] via-[#0E0305] to-[#05131A] border-2 border-[#C9B27C]/50 shadow-[0_0_60px_rgba(201,178,124,0.35)] space-y-5 my-auto max-h-[92dvh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            id="preview-limit-modal-close"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0E0305] hover:bg-[#340C14] text-[#E2CBD0] hover:text-[#FFFFFF] border border-white/10 flex items-center justify-center transition-colors shadow-md z-10"
            title="Close modal"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>

          {/* Top Icon Badge */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C9B27C] to-[#E8DCB8] text-[#0E0305] flex items-center justify-center shadow-lg shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9B27C] font-semibold block">
                30-Second Studio Preview Ended
              </span>
              <h3 className="text-xl font-heading font-bold text-[#FFFFFF]">
                Unlock Backing Track
              </h3>
            </div>
          </div>

          {/* Track Snapshot */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#0E0305]/80 border border-[#C41E3A]/30">
            <img
              src={track.coverImage || '/covers/001_prayermp3.jpg'}
              alt={track.titleEnglish}
              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#C9B27C]/30"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-[#FFFFFF] truncate">
                {track.titleEnglish}
              </h4>
              <p className="font-telugu text-xs text-[#C9B27C] truncate">
                {track.titleTelugu}
              </p>
              <p className="text-[10px] text-[#E2CBD0]">
                Minus-One Karaoke Master • 24-bit WAV
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#0E0305] bg-gradient-to-r from-[#C9B27C] to-[#E8DCB8] px-3 py-1 rounded-full shadow-sm shrink-0">
              ₹99
            </span>
          </div>

          {/* Explanation of Separate Rules */}
          <p className="text-xs text-[#E2CBD0] leading-relaxed">
            Devotional vocal songs are 100% free to listen, but official studio backing tracks (minus-one arrangements) require a one-time purchase of <strong className="text-[#C9B27C]">₹99 per track</strong> for permanent playback and offline master audio download.
          </p>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Action 1: Buy Track via Razorpay */}
          <button
            id="modal-buy-track-btn"
            type="button"
            disabled={purchasing}
            onClick={handleBuyTrack}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#8B1524]/40 via-[#1A060A] to-[#0E0305] border-2 border-[#C9B27C]/60 hover:border-[#C9B27C] text-left transition-all duration-200 group shadow-lg flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9B27C] font-bold block">
                Permanent Track Access
              </span>
              <h4 className="text-base font-bold text-[#FFFFFF] group-hover:text-[#C9B27C] transition-colors">
                {purchasing ? 'Initiating Gateway...' : 'Buy Backing Track • ₹99'}
              </h4>
              <p className="text-[11px] text-[#E2CBD0]">
                Unlimited full playback & offline master WAV download.
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#C9B27C] text-[#0E0305] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-md">
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>

          {/* Action 2: Vocal Songs Clarification */}
          <div className="p-3.5 rounded-2xl bg-[#0E0305]/60 border border-[#C41E3A]/20 flex items-center justify-between gap-3 text-xs">
            <span className="text-[#E2CBD0]">
              Want offline downloads of all <strong className="text-white">vocal songs</strong>?
            </span>
            <button
              type="button"
              onClick={handleGoMembership}
              className="text-[#C9B27C] hover:underline font-semibold whitespace-nowrap shrink-0"
            >
              Songs Pass (₹299) →
            </button>
          </div>

          {/* Dismiss Link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#E2CBD0] hover:text-[#FFFFFF] underline transition-colors"
            >
              Continue listening to free devotional songs
            </button>
          </div>
        </div>
      </div>

      {/* Razorpay Gateway Modal */}
      {razorpayOrder && (
        <RazorpayModal
          isOpen={true}
          orderId={razorpayOrder.orderId}
          amountPaise={razorpayOrder.amount}
          itemTitle={track.titleEnglish}
          itemSubtitle={`${track.titleTelugu} (Studio Minus-One Track)`}
          isSubscription={false}
          userEmail={user?.email}
          userName={user?.name}
          onSuccess={handleRazorpaySuccess}
          onClose={() => setRazorpayOrder(null)}
        />
      )}
    </>,
    document.body
  );
};
