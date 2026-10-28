import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Lock,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { openRazorpayCheckout, RazorpayPaymentSuccessResponse } from '../services/razorpay';

export interface RazorpayModalProps {
  isOpen: boolean;
  orderId: string;
  amountPaise: number;
  itemTitle: string;
  itemSubtitle?: string;
  isSubscription?: boolean;
  userEmail?: string;
  userName?: string;
  onSuccess: (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => Promise<void>;
  onClose: () => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  orderId,
  amountPaise,
  itemTitle,
  itemSubtitle,
  isSubscription,
  userEmail,
  userName,
  onSuccess,
  onClose,
}) => {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const hasAutoOpened = useRef<boolean>(false);

  const amountRupees = (amountPaise / 100).toFixed(amountPaise % 100 === 0 ? 0 : 2);

  const launchCheckout = () => {
    setErrorMessage(null);
    setIsDismissed(false);

    try {
      openRazorpayCheckout({
        orderId,
        amountPaise,
        currency: 'INR',
        itemTitle,
        itemDescription: itemSubtitle || (isSubscription ? "Tony's Music VIP Lifetime Membership" : "Studio Backing Track"),
        userEmail,
        userName,
        onSuccess: async (response: RazorpayPaymentSuccessResponse) => {
          setIsVerifying(true);
          try {
            await onSuccess({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setIsVerified(true);
            setTimeout(() => {
              onClose();
            }, 1800);
          } catch (err: any) {
            setErrorMessage(err.message || 'Signature verification failed on the server.');
          } finally {
            setIsVerifying(false);
          }
        },
        onDismiss: () => {
          setIsDismissed(true);
        },
        onError: (err: any) => {
          const desc = err?.description || err?.message || 'Payment was unsuccessful or cancelled.';
          setErrorMessage(desc);
        },
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize Razorpay checkout.');
    }
  };

  // Auto-trigger Razorpay modal on mount
  useEffect(() => {
    if (isOpen && orderId && !hasAutoOpened.current) {
      hasAutoOpened.current = true;
      const timer = setTimeout(() => {
        launchCheckout();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  return createPortal(
    <div
      id="razorpay-gateway-backdrop"
      className="fixed inset-0 z-[250] w-screen h-screen min-h-[100dvh] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        id="razorpay-gateway-dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white dark:bg-[#121214] border border-[#E5E5EA] dark:border-[#27272A] rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.55)] overflow-hidden my-auto max-h-[96dvh] flex flex-col"
      >
        {/* Top Header: Official Razorpay Standard Checkout */}
        <div className="bg-gradient-to-r from-[#0C1E3C] via-[#081326] to-[#0C1E3C] p-4 sm:p-5 border-b border-[#1E293B] flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0C2340] to-[#00BAF2] border border-[#00BAF2]/30 flex items-center justify-center shadow-lg shrink-0">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide text-white">
                  Razorpay Secure Checkout
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] text-emerald-300 font-mono font-bold">
                  TEST MODE
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Official Standard Web Gateway
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close payment modal"
            title="Close"
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Pill */}
        <div className="p-4 bg-[#F8FAFC] dark:bg-[#18181B] border-b border-[#E2E8F0] dark:border-[#27272A] flex items-center justify-between shrink-0">
          <div className="min-w-0 pr-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#FA243C] font-semibold">
              {isSubscription ? 'One-Time Lifetime Membership' : 'Studio Backing Track (Minus-One)'}
            </div>
            <h4 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white truncate">
              {itemTitle}
            </h4>
            {itemSubtitle && (
              <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] truncate">
                {itemSubtitle}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#64748B] dark:text-[#A1A1AA] block">
              Amount
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#0F172A] dark:text-white">
              ₹{amountRupees}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {isVerified ? (
            <div className="py-8 px-2 text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#0F172A] dark:text-white">
                  Payment Verified!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  {isSubscription
                    ? 'Your One-Time Lifetime VIP Pass is now active.'
                    : 'Your backing track has been unlocked for instant playback & download.'}
                </p>
              </div>
            </div>
          ) : isVerifying ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-[#FA243C] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-base text-[#0F172A] dark:text-white">
                  Verifying Cryptographic Signature...
                </h4>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Validating Razorpay HMAC-SHA256 signature and unlocking Supabase records...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Error Alert if any */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold block">Payment Notice</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Status Note */}
              {isDismissed && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs">
                  Razorpay checkout window was dismissed. Click below to re-open payment.
                </div>
              )}

              {/* Supported Payment Channels */}
              <div className="bg-[#F8FAFC] dark:bg-[#18181B] border border-[#E2E8F0] dark:border-[#27272A] rounded-2xl p-4 space-y-3">
                <div className="text-[11px] font-semibold text-[#475569] dark:text-[#CBD5E1] flex items-center justify-between">
                  <span>Supported Payment Methods</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">100% Secure</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#0F172A] dark:text-white">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-[#202023] border border-gray-200 dark:border-gray-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>UPI / QR / GPay / PhonePe</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-[#202023] border border-gray-200 dark:border-gray-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Credit & Debit Cards</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-[#202023] border border-gray-200 dark:border-gray-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Net Banking (All Banks)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-[#202023] border border-gray-200 dark:border-gray-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Paytm / Wallets</span>
                  </div>
                </div>
              </div>

              {/* Order ID Pill */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] dark:text-[#A1A1AA] px-1">
                <span>Razorpay Order ID:</span>
                <span className="font-bold text-[#0F172A] dark:text-white">{orderId}</span>
              </div>

              {/* Primary Pay Button */}
              <button
                type="button"
                onClick={launchCheckout}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FA243C] via-[#E11D48] to-[#0C2340] hover:brightness-110 active:scale-98 text-white font-bold text-sm tracking-wide uppercase transition-all shadow-xl flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Pay ₹{amountRupees} via Razorpay</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Retry / Dismiss button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors"
              >
                Cancel / Pay Later
              </button>

              {/* Trust & Encryption Badge */}
              <div className="text-center text-[10px] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-center gap-1.5 pt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-Bit SSL Encrypted • Powered by Razorpay Standard Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
