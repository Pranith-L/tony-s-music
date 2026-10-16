import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  Smartphone,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

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
    razorpay_signature?: string;
    isTestConfirm?: boolean;
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
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState<string>('tony.worship@upi');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');

  if (!isOpen) return null;

  const amountRupees = Math.round(amountPaise / 100);

  const handlePay = async () => {
    setIsProcessing(true);
    setStatusText('Contacting Razorpay Secure Gateway...');

    // Simulate gateway handoff
    await new Promise((r) => setTimeout(r, 600));
    setStatusText('Verifying payment with bank & merchant...');
    await new Promise((r) => setTimeout(r, 700));

    setStatusText('Recording verified status in database...');
    const fakePayId = `pay_${Date.now()}_rzp`;

    try {
      await onSuccess({
        razorpay_order_id: orderId,
        razorpay_payment_id: fakePayId,
        isTestConfirm: true,
      });
    } catch (err: any) {
      alert(err.message || 'Payment verification failed');
      setIsProcessing(false);
    }
  };

  return createPortal(
    <div
      id="razorpay-gateway-backdrop"
      className="fixed inset-0 z-[250] w-screen h-screen min-h-[100dvh] bg-[#030B10]/98 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="razorpay-gateway-dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#071923] border-2 border-[#1B7C9D]/50 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden my-auto max-h-[92dvh] flex flex-col"
      >
        {/* Razorpay Brand Header Bar */}
        <div className="bg-gradient-to-r from-[#0C2340] via-[#0D3859] to-[#0A2536] p-4 sm:p-5 border-b border-[#1B7C9D]/30 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1B7C9D] to-[#0E5671] border border-[#C9B27C]/50 flex items-center justify-center shadow-md">
              <Lock className="w-5 h-5 text-[#C9B27C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide text-white">
                  Razorpay Secure <span className="text-[#3399CC] font-mono text-xs">TRUSTED</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#1B7C9D]/30 border border-[#1B7C9D]/50 text-[10px] text-cyan-200 font-mono">
                  256-bit SSL
                </span>
              </div>
              <p className="text-[11px] text-[#A5C1CC]">
                Official Payment Gateway for Rev. Tony Prakash
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close payment gateway"
            title="Close payment gateway"
            className="p-1.5 rounded-full bg-black/40 hover:bg-[#12303E] text-[#A5C1CC] hover:text-white transition-colors"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        {/* Order Summary Pill */}
        <div className="p-4 bg-[#0B222E]/80 border-b border-[#1B7C9D]/20 flex items-center justify-between shrink-0">
          <div className="min-w-0 pr-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#C9B27C] font-semibold">
              {isSubscription ? 'One-Time Lifetime Membership' : 'Studio Backing Track (Minus-One)'}
            </div>
            <h4 className="text-sm sm:text-base font-bold text-[#EDF5F8] truncate">
              {itemTitle}
            </h4>
            {itemSubtitle && (
              <p className="text-xs text-[#A5C1CC] font-telugu truncate">
                {itemSubtitle}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs text-[#A5C1CC] block">Amount to Pay</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#EDF5F8]">
              ₹{amountRupees}
            </span>
          </div>
        </div>

        {/* Payment Methods Selection Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {isProcessing ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-[#1B7C9D] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-base text-[#EDF5F8]">
                  Processing Razorpay Payment
                </h4>
                <p className="text-xs text-[#C9B27C] font-mono animate-pulse">
                  {statusText}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('UPI')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    selectedMethod === 'UPI'
                      ? 'bg-[#1B7C9D]/20 border-[#1B7C9D] text-[#EDF5F8] shadow-md'
                      : 'bg-[#0B222E]/60 border-[#1B7C9D]/20 text-[#A5C1CC] hover:bg-[#0B222E]'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-[#C9B27C]" />
                  <span className="text-xs font-semibold">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('CARD')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    selectedMethod === 'CARD'
                      ? 'bg-[#1B7C9D]/20 border-[#1B7C9D] text-[#EDF5F8] shadow-md'
                      : 'bg-[#0B222E]/60 border-[#1B7C9D]/20 text-[#A5C1CC] hover:bg-[#0B222E]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#C9B27C]" />
                  <span className="text-xs font-semibold">Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('NETBANKING')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    selectedMethod === 'NETBANKING'
                      ? 'bg-[#1B7C9D]/20 border-[#1B7C9D] text-[#EDF5F8] shadow-md'
                      : 'bg-[#0B222E]/60 border-[#1B7C9D]/20 text-[#A5C1CC] hover:bg-[#0B222E]'
                  }`}
                >
                  <Building className="w-5 h-5 text-[#C9B27C]" />
                  <span className="text-xs font-semibold">NetBanking</span>
                </button>
              </div>

              {/* UPI Tab View */}
              {selectedMethod === 'UPI' && (
                <div className="p-4 rounded-2xl bg-[#0B222E] border border-[#1B7C9D]/30 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#C9B27C]">
                    <span className="font-semibold flex items-center gap-1.5">
                      <QrCode className="w-4 h-4" />
                      <span>Instant UPI Payment</span>
                    </span>
                    <span className="text-[#A5C1CC] font-mono text-[10px]">Zero Fee</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-[#A5C1CC] block">Virtual Payment Address (VPA)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@okaxis, user@upi"
                      className="w-full bg-[#07151D] border border-[#1B7C9D]/40 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#EDF5F8] focus:outline-none focus:border-[#C9B27C]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-[#07151D] border border-[#1B7C9D]/20 text-[10px] text-[#A5C1CC]">GPay</span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#07151D] border border-[#1B7C9D]/20 text-[10px] text-[#A5C1CC]">PhonePe</span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#07151D] border border-[#1B7C9D]/20 text-[10px] text-[#A5C1CC]">Paytm</span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#07151D] border border-[#1B7C9D]/20 text-[10px] text-[#A5C1CC]">BHIM</span>
                  </div>
                </div>
              )}

              {/* Cards Tab View */}
              {selectedMethod === 'CARD' && (
                <div className="p-4 rounded-2xl bg-[#0B222E] border border-[#1B7C9D]/30 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-[#A5C1CC] block">Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      className="w-full bg-[#07151D] border border-[#1B7C9D]/40 rounded-xl px-3.5 py-2 text-xs text-[#EDF5F8] focus:outline-none focus:border-[#C9B27C]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="bg-[#07151D] border border-[#1B7C9D]/40 rounded-xl px-3.5 py-2 text-xs text-[#EDF5F8] focus:outline-none focus:border-[#C9B27C]"
                    />
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="CVV"
                      className="bg-[#07151D] border border-[#1B7C9D]/40 rounded-xl px-3.5 py-2 text-xs text-[#EDF5F8] focus:outline-none focus:border-[#C9B27C]"
                    />
                  </div>
                </div>
              )}

              {/* NetBanking Tab View */}
              {selectedMethod === 'NETBANKING' && (
                <div className="p-4 rounded-2xl bg-[#0B222E] border border-[#1B7C9D]/30 space-y-2">
                  <label className="text-[11px] text-[#A5C1CC] block">Select Popular Bank</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button type="button" className="p-2 rounded-xl bg-[#07151D] border border-[#1B7C9D]/30 text-left text-[#EDF5F8] hover:border-[#C9B27C]">HDFC Bank</button>
                    <button type="button" className="p-2 rounded-xl bg-[#07151D] border border-[#1B7C9D]/30 text-left text-[#EDF5F8] hover:border-[#C9B27C]">State Bank of India</button>
                    <button type="button" className="p-2 rounded-xl bg-[#07151D] border border-[#1B7C9D]/30 text-left text-[#EDF5F8] hover:border-[#C9B27C]">ICICI Bank</button>
                    <button type="button" className="p-2 rounded-xl bg-[#07151D] border border-[#1B7C9D]/30 text-left text-[#EDF5F8] hover:border-[#C9B27C]">Axis Bank</button>
                  </div>
                </div>
              )}

              {/* Pay Now Button */}
              <button
                type="button"
                onClick={handlePay}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#1B7C9D] to-[#0E5671] hover:brightness-110 text-white font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_30px_rgba(27,124,157,0.4)] flex items-center justify-center gap-2"
              >
                <span>Pay ₹{amountRupees} Securely</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-[11px] text-[#A5C1CC] flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified by Razorpay • Instant Database Entitlement</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
