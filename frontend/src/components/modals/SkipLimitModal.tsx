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
      <div className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-[#F5F5F7] border border-[#E5E5EA] shadow-2xl space-y-6 my-auto max-h-[92dvh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white text-[#86868B] hover:text-[#FA243C] border border-[#E5E5EA] flex items-center justify-center transition-colors shadow-sm"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FC3C44] to-[#FA243C] text-white flex items-center justify-center shadow-lg shrink-0">
            <FastForward className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#FA243C] font-semibold block">
              Free Listening Limit
            </span>
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#1D1D1F]">
              Daily Skip Limit Reached
            </h3>
          </div>
        </div>

        {/* Status Callout */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono text-[#86868B] mb-2">
            <span>Free Skips Today</span>
            <span className="text-[#FA243C] font-bold">{skipsUsed} / {maxSkips} Used</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#F2F2F7] overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-[#FC3C44] to-[#FA243C] rounded-full" />
          </div>
          <p className="text-xs text-[#86868B] mt-3 leading-relaxed">
            On the free tier, you get <strong className="text-[#1D1D1F]">6 skips per day</strong>. Devotional songs remain 100% free to listen. Skips reset at midnight!
          </p>
        </div>

        {/* VIP Lifetime Offer */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FA243C]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#FA243C]">
                Tony's VIP Lifetime Pass
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FA243C]/10 text-[#FA243C] text-xs font-bold border border-[#FA243C]/20">
              ₹299 ONE-TIME
            </span>
          </div>

          <p className="text-xs text-[#1D1D1F] font-medium">
            Pay once, enjoy forever. Never get limited again.
          </p>

          <ul className="space-y-1.5 text-xs text-[#86868B]">
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#FA243C]" />
              <span className="text-[#1D1D1F]">Infinite skips & queue additions</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#FA243C]" />
              <span className="text-[#1D1D1F]">Full access to all 57 Studio Backing Tracks</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#FA243C]" />
              <span className="text-[#1D1D1F]">Unlimited Studio WAV Downloads with album artwork</span>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FA243C]" />
              <span className="text-[#FA243C] font-medium">No recurring fees • Lifetime validity</span>
            </li>
          </ul>

          <button
            onClick={handleGoMembership}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#FC3C44] to-[#FA243C] text-white hover:brightness-110 shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            Get One-Time Pass • ₹299
          </button>
        </div>

        {/* Dismiss Option */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="text-xs text-[#86868B] hover:text-[#FA243C] transition-colors underline underline-offset-4"
          >
            Continue listening to current song
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
