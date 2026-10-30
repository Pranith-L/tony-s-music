import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, MessageCircle, Phone, Music, ShieldCheck, Heart } from 'lucide-react';

export interface PaymentsPausedModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle?: string;
  itemType?: 'pass' | 'track' | 'general';
  price?: string;
}

export const PaymentsPausedModal: React.FC<PaymentsPausedModalProps> = ({
  isOpen,
  onClose,
  itemTitle = "Tony's One-Time VIP Lifetime Pass",
  itemType = 'pass',
  price = '₹299',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const whatsappMessage = encodeURIComponent(
    `Hello Rev. Tony Prakash garu! I am visiting your music website (tony-prakash-music.vercel.app). I would like to get access to: ${itemTitle} (${price}). Please let me know how I can proceed.`
  );

  return createPortal(
    <div
      id="payments-paused-backdrop"
      className="fixed inset-0 z-[300] w-screen h-screen min-h-[100dvh] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        id="payments-paused-dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0E0305] text-white border border-[#D4A017]/30 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden my-auto max-h-[96dvh] flex flex-col"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#200B0E] via-[#150508] to-[#200B0E] p-5 sm:p-6 border-b border-[#D4A017]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D4A017]/15 border border-[#D4A017]/40 flex items-center justify-center shadow-lg shrink-0">
              <Sparkles className="w-5 h-5 text-[#D4A017]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-base tracking-wide text-white">
                  Online Checkout
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#D4A017]/20 border border-[#D4A017]/40 text-[10px] text-[#E8DCB8] font-mono font-bold tracking-wider uppercase">
                  Launching Soon
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Live Gateway Setup in Progress
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            title="Close"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Target Item Pill */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#D4A017] font-semibold block">
                {itemType === 'pass' ? 'VIP Lifetime Pass' : itemType === 'track' ? 'Studio Backing Track' : 'Selected Item'}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white truncate">
                {itemTitle}
              </h4>
            </div>
            <div className="text-right shrink-0">
              <span className="text-lg sm:text-xl font-mono font-bold text-[#D4A017]">
                {price}
              </span>
            </div>
          </div>

          {/* 100% Free Listening Announcement */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Music className="w-4 h-4 shrink-0" />
              <span>All 68 Devotional Songs are 100% Free to Stream!</span>
            </div>
            <p className="text-xs text-emerald-200/90 leading-relaxed font-normal">
              You do not need to make any payment to listen to Rev. Tony Prakash's Telugu Christian devotional songs. Every single vocal song is freely accessible for everyone to enjoy and worship.
            </p>
          </div>

          {/* Notice about online checkout */}
          <div className="space-y-2 text-xs text-gray-300 leading-relaxed">
            <p>
              Automated online checkout is temporarily paused while we finalize official live banking verification for our Razorpay gateway.
            </p>
            <p className="text-gray-400">
              For early access to <strong className="text-white">Tony's VIP Lifetime Pass (₹299)</strong> or <strong className="text-white">Studio Minus-One Backing Tracks (₹99)</strong>, you can contact Rev. Tony Prakash directly via WhatsApp or phone:
            </p>
          </div>

          {/* Contact Direct Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <a
              href={`https://wa.me/919841345007?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Rev. Tony</span>
            </a>

            <a
              href="tel:+919841345007"
              className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#D4A017]" />
              <span>Call +91 9841345007</span>
            </a>
          </div>

          {/* Dismiss / Keep listening button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4A017] via-[#E8DCB8] to-[#D4A017] text-[#0E0305] text-xs font-bold uppercase tracking-widest shadow-xl hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>Keep Listening to Songs Free</span>
          </button>

          {/* Footer assurance */}
          <div className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official Live Payment Gateway Resuming Soon • God Bless You</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

