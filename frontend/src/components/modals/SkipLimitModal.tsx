import React from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, FastForward, Check, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SkipLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  skipsUsed?: number;
  maxSkips?: number;
}

export const SkipLimitModal: React.FC<SkipLimitModalProps> = ({
  isOpen,
  onClose,
  skipsUsed = 6,
  maxSkips = 6,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoMembership = () => {
    navigate('/membership');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] w-screen h-screen min-h-[100dvh] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0E2838] via-[#0E0305] to-[#040D12] border-2 border-[#FA243C]/50 shadow-[0_0_60px_rgba(27,124,157,0.35)] space-y-6 my-auto max-h-[92dvh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white text-[#86868B] hover:text-[#FFFFFF] border border-white/10 flex items-center justify-center transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FA243C] to-[#39A8CE] text-white flex items-center justify-center shadow-lg shrink-0">
            <FastForward className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#39A8CE] font-semibold block">
              Free Listening Limit
            </span>
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#FFFFFF]">
              Daily Skip Limit Reached
            </h3>
          </div>
        </div>

        {/* Status Callout */}
        <div className="p-4 rounded-2xl bg-white/90 border border-white/10">
          <div className="flex items-center justify-between text-xs font-mono text-[#86868B] mb-2">
            <span>Free Skips Today</span>
            <span className="text-[#E07A5F] font-bold">{skipsUsed} / {maxSkips} Used</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-[#FA243C] to-[#E07A5F] rounded-full" />
          </div>
          <p className="text-xs text-[#86868B] mt-3 leading-relaxed">
            On the free tier, you get <strong className="text-white">6 skips per day</strong>. Devotional songs remain 100% free to listen. Skips reset at midnight!
          </p>
        </div>

        {/* VIP Lifetime Offer */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1A060A] to-[#122A38] border-2 border-[#D4A017]/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4A017]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4A017]">
                Tony's VIP Lifetime Pass
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#D4A017]/20 text-[#D4A017] text-xs font-bold border border-[#D4A017]/40">
              ₹299 ONE-TIME
            </span>
          </div>

          <p className="text-xs text-[#FFFFFF]">
            Pay once, enjoy forever. Never get limited again.
          </p>

          <ul className="space-y-1.5 text-xs text-[#86868B]">
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#39A8CE]" />
              <span className="text-[#FFFFFF]">Infinite skips & queue additions</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#39A8CE]" />
              <span className="text-[#FFFFFF]">Full access to all 57 Studio Backing Tracks</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#39A8CE]" />
              <span className="text-[#FFFFFF]">Unlimited Studio WAV Downloads with album artwork</span>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4A017]" />
              <span className="text-[#D4A017] font-medium">No recurring fees • Lifetime validity</span>
            </li>
          </ul>

          <button
            onClick={handleGoMembership}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#D4A017] to-[#E8DCB8] text-[#0E0305] hover:opacity-95 shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            Get One-Time Pass • ₹299
          </button>
        </div>

        {/* Dismiss Option */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="text-xs text-[#86868B] hover:text-[#FFFFFF] transition-colors underline underline-offset-4"
          >
            Continue listening to current song
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
