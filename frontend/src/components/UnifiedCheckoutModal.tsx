import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Music,
  Lock,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Heart,
} from 'lucide-react';
import { Track, User } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { openCashfreeCheckout } from '../services/cashfree.js';

function checkUserAccess(u: User | null, isVip: boolean, trkId?: string): boolean {
  if (!u) return false;
  if (isVip) {
    return Boolean(u.isSubscriberActive || (u as any).hasVipPass || (u as any).subscription?.status === 'ACTIVE');
  }
  if (trkId) {
    return Boolean(
      u.purchases?.some((p) => p.trackId === trkId || (p as any).track?.id === trkId) ||
      (u as any).purchasedTrackIds?.includes(trkId)
    );
  }
  return false;
}

export interface UnifiedCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'VIP_PASS' | 'TRACK';
  track?: Track | null;
  onSuccess?: () => void;
}

export const UnifiedCheckoutModal: React.FC<UnifiedCheckoutModalProps> = ({
  isOpen,
  onClose,
  itemType,
  track,
  onSuccess,
}) => {
  const { user, refreshUser } = useAuth();

  const [selectedGateway, setSelectedGateway] = useState<'CASHFREE' | 'INSTAMOJO'>('CASHFREE');
  const [customerName, setCustomerName] = useState<string>(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState<string>(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState<string>((user as any)?.phone || '');

  const [statusState, setStatusState] = useState<'IDLE' | 'CREATING' | 'PAYING' | 'VERIFYING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Sync user details when modal opens
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name || '');
      if (!customerEmail) setCustomerEmail(user.email || '');
      if (!customerPhone && (user as any).phone) setCustomerPhone((user as any).phone);
    }
  }, [user, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && statusState !== 'VERIFYING' && statusState !== 'CREATING') {
        onClose();
      }
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, statusState, onClose]);

  if (!isOpen) return null;

  const isVipPass = itemType === 'VIP_PASS';
  // Instamojo enforces a hard platform minimum of ₹9.00; Cashfree supports ₹1.00 testing
  const priceRupees = selectedGateway === 'INSTAMOJO' ? 9 : 1;
  const itemTitle = isVipPass
    ? "Tony's One-Time VIP Lifetime Pass"
    : track
    ? `Backing Track: ${track.titleEnglish}`
    : 'Studio Minus-One Track';

  const itemSubtitle = isVipPass
    ? 'Lifetime Access: All 68 Devotional Songs Master WAV Downloads & Infinite Skips'
    : track?.titleTelugu
    ? `${track.titleTelugu} (Studio Minus-One / Karaoke Track)`
    : 'Studio Minus-One Karaoke Track for Church & Solo Singing';

  const handleInitiatePayment = async () => {
    setErrorMessage(null);

    // Validation
    if (!customerEmail || !customerEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatusState('CREATING');
    try {
      // 1. Create order on backend (server-side fixed pricing & validation)
      const order = await api.payments.createUnifiedOrder({
        itemType,
        trackId: track?.id,
        slug: track?.slug,
        gateway: selectedGateway,
        customerName: customerName || 'Customer',
        customerEmail,
        customerPhone: customerPhone || '9999999999',
      });

      setActiveOrderId(order.orderId);

      // 2. Gateway execution
      if (selectedGateway === 'CASHFREE') {
        if (!order.paymentSessionId) {
          throw new Error('Server did not return a Cashfree payment session ID.');
        }

        setStatusState('PAYING');

        // Open Cashfree modal checkout
        await openCashfreeCheckout({
          paymentSessionId: order.paymentSessionId,
          redirectTarget: '_modal',
        });

        // After Cashfree modal closes or finishes, independently verify with backend
        setStatusState('VERIFYING');
        let isVerified = false;
        let lastMsg = '';

        // Retry loop: check up to 5 times (~7.5s) to allow webhook and bank processing to sync
        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            const verification = await api.payments.verifyUnifiedPayment({
              orderId: order.orderId,
              gateway: 'CASHFREE',
            });

            if (verification.success) {
              isVerified = true;
              setStatusState('SUCCESS');
              setSuccessMessage(verification.message || 'Payment confirmed successfully!');
              await refreshUser();
              if (onSuccess) onSuccess();
              break;
            } else {
              lastMsg = verification.message || 'Payment is processing...';
            }
          } catch (pollErr: any) {
            console.warn(`Verify attempt ${attempt + 1} notice:`, pollErr);
          }

          // Check if session subscription or track access is already active
          try {
            const updatedUser = await refreshUser();
            if (checkUserAccess(updatedUser, isVipPass, track?.id)) {
              isVerified = true;
              setStatusState('SUCCESS');
              setSuccessMessage('Payment confirmed! Your access has been activated.');
              if (onSuccess) onSuccess();
              break;
            }
          } catch {}

          if (attempt < 4) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }
        }

        if (!isVerified) {
          const finalUser = await refreshUser();
          if (checkUserAccess(finalUser, isVipPass, track?.id)) {
            setStatusState('SUCCESS');
            setSuccessMessage('Payment confirmed! Your access has been activated.');
            if (onSuccess) onSuccess();
          } else {
            setStatusState('FAILED');
            setErrorMessage(lastMsg || 'Payment is being processed by your bank. If ₹1 was debited, please click "Verify Payment" below.');
          }
        }
      } else if (selectedGateway === 'INSTAMOJO') {
        if (!order.paymentUrl) {
          throw new Error('Server did not return an Instamojo payment URL.');
        }

        setStatusState('PAYING');
        // Redirect to Instamojo payment link
        window.location.href = order.paymentUrl;
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      // Check if user actually got access before failing
      try {
        const checkUser = await refreshUser();
        if (checkUserAccess(checkUser, isVipPass, track?.id)) {
          setStatusState('SUCCESS');
          setSuccessMessage('Payment confirmed! Your access has been activated.');
          if (onSuccess) onSuccess();
          return;
        }
      } catch {}

      setStatusState('FAILED');
      setErrorMessage(err.message || 'Payment initiation failed. Please try again.');
    }
  };

  const handleManualVerify = async () => {
    if (!activeOrderId) return;
    setStatusState('VERIFYING');
    setErrorMessage(null);
    try {
      // 1. Check user state first
      const currentUser = await refreshUser();
      if (checkUserAccess(currentUser, isVipPass, track?.id)) {
        setStatusState('SUCCESS');
        setSuccessMessage('Payment verified! Your access is fully active.');
        if (onSuccess) onSuccess();
        return;
      }

      // 2. Query backend verify endpoint
      const verification = await api.payments.verifyUnifiedPayment({
        orderId: activeOrderId,
        gateway: selectedGateway,
      });

      if (verification.success) {
        setStatusState('SUCCESS');
        setSuccessMessage(verification.message || 'Payment confirmed successfully!');
        await refreshUser();
        if (onSuccess) onSuccess();
      } else {
        // One final check on refreshUser
        const finalUser = await refreshUser();
        if (checkUserAccess(finalUser, isVipPass, track?.id)) {
          setStatusState('SUCCESS');
          setSuccessMessage('Payment confirmed! Your access has been activated.');
          if (onSuccess) onSuccess();
        } else {
          setStatusState('FAILED');
          setErrorMessage(verification.message || 'Payment is still processing with the bank. Please try again in 10 seconds.');
        }
      }
    } catch (err: any) {
      // Final fallback to user state
      try {
        const finalUser = await refreshUser();
        if (checkUserAccess(finalUser, isVipPass, track?.id)) {
          setStatusState('SUCCESS');
          setSuccessMessage('Payment confirmed! Your access has been activated.');
          if (onSuccess) onSuccess();
          return;
        }
      } catch {}

      setStatusState('FAILED');
      setErrorMessage('Verification is taking longer than expected. If amount was deducted, your access will be activated shortly.');
    }
  };

  return createPortal(
    <div
      id="unified-checkout-backdrop"
      className="fixed inset-0 z-[300] w-screen h-screen min-h-[100dvh] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn select-none"
      onClick={statusState === 'VERIFYING' || statusState === 'CREATING' ? undefined : onClose}
    >
      <div
        id="unified-checkout-dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0E0305] text-white border border-[#D4A017]/30 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden my-auto max-h-[96dvh] flex flex-col"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#200B0E] via-[#150508] to-[#200B0E] p-4 sm:p-5 border-b border-[#D4A017]/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4A017]/15 border border-[#D4A017]/40 flex items-center justify-center shadow-lg shrink-0">
              <CreditCard className="w-5 h-5 text-[#D4A017]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm sm:text-base tracking-wide text-white">
                  Secure Checkout
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] text-emerald-300 font-mono font-bold">
                  100% SECURE
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Official Tony Prakash Music Store
              </p>
            </div>
          </div>

          {statusState !== 'VERIFYING' && statusState !== 'CREATING' && (
            <button
              onClick={onClose}
              aria-label="Close checkout"
              title="Close"
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Order Summary Header Pill */}
        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="min-w-0 pr-3">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#D4A017] font-semibold block">
              {isVipPass ? 'VIP Lifetime Pass (100 Years)' : 'Studio Minus-One Track'}
            </span>
            <h4 className="text-sm sm:text-base font-bold text-white truncate">
              {itemTitle}
            </h4>
            <p className="text-[11px] text-gray-400 truncate">
              {itemSubtitle}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block">
              Amount
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#D4A017]">
              ₹{priceRupees}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {statusState === 'SUCCESS' ? (
            <div className="py-8 px-2 text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-bounce" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-white">
                  Payment Verified!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-400 font-medium">
                  {successMessage || (isVipPass
                    ? 'Your One-Time VIP Lifetime Pass is now active.'
                    : 'Your studio backing track has been unlocked for instant download & playback.')}
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span>Start Listening / Download</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : statusState === 'VERIFYING' || statusState === 'CREATING' ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-[#D4A017] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-base text-white">
                  {statusState === 'CREATING'
                    ? 'Initializing Secure Payment Order...'
                    : 'Verifying Gateway Signature Independently...'}
                </h4>
                <p className="text-xs text-gray-400">
                  {statusState === 'CREATING'
                    ? 'Connecting to official payment gateway APIs...'
                    : 'Validating cryptographic status directly with gateway servers...'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Error banner if any */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <div className="space-y-0.5">
                    <span className="font-bold block">Notice</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Free devotional songs reassurance notice */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
                <Music className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>All 68 Telugu devotional songs remain 100% free to stream anytime!</span>
              </div>

              {/* Gateway Selection Cards */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block font-semibold">
                  Select Payment Gateway:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Cashfree Option */}
                  <div
                    onClick={() => setSelectedGateway('CASHFREE')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedGateway === 'CASHFREE'
                        ? 'bg-[#D4A017]/10 border-[#D4A017] ring-1 ring-[#D4A017]/50 shadow-md'
                        : 'bg-white/5 border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <span className="font-bold text-sm text-white">Cashfree</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                        Popular
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300">
                      UPI (GPay, PhonePe, Paytm, QR), Cards, Net Banking
                    </p>
                  </div>

                  {/* Instamojo Option */}
                  <div
                    onClick={() => setSelectedGateway('INSTAMOJO')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedGateway === 'INSTAMOJO'
                        ? 'bg-[#D4A017]/10 border-[#D4A017] ring-1 ring-[#D4A017]/50 shadow-md'
                        : 'bg-white/5 border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                        <span className="font-bold text-sm text-white">Instamojo</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold">
                        Fast UPI
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300">
                      UPI QR, Debit/Credit Cards, Wallets, Net Banking
                    </p>
                    <span className="text-[10px] text-[#D4A017] font-mono mt-1 block">
                      (Platform minimum ₹9 • Use Cashfree for ₹1)
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="space-y-2.5 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block font-semibold">
                  Customer Receipt Details:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone / WhatsApp Number (10 digits)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017] text-xs"
                  />
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleInitiatePayment}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4A017] via-[#E8DCB8] to-[#D4A017] text-[#0E0305] font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  Pay ₹{priceRupees} via {selectedGateway === 'CASHFREE' ? 'Cashfree' : 'Instamojo'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Status Note if active order waiting */}
              {activeOrderId && statusState === 'PAYING' && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
                  <span>Completed payment in popup or link?</span>
                  <button
                    type="button"
                    onClick={handleManualVerify}
                    className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] transition-colors"
                  >
                    Check Status
                  </button>
                </div>
              )}

              {/* Security Badge */}
              <div className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1.5 pt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-Bit SSL Encrypted • Official Cashfree & Instamojo Payment Integration</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

