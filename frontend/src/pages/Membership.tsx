import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Check,
  ShieldCheck,
  Download,
  Music,
  CreditCard,
  Heart,
  HelpCircle,
  FastForward,
  ListMusic,
  Infinity,
  Disc3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { RazorpayModal } from '../components/RazorpayModal.js';
import { SEO } from '../components/SEO.js';

export const MembershipPage: React.FC = () => {
  const { user, isSubscriber, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Always open page cleanly from the very top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const main = document.querySelector('main');
    if (main) main.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [razorpayOrder, setRazorpayOrder] = useState<{
    orderId: string;
    amount: number;
  } | null>(null);

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/auth?redirect=/membership');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const subOrder = await api.payments.createSubscription();
      setRazorpayOrder({
        orderId: subOrder.subscriptionId,
        amount: subOrder.amount || 100,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment initiation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRazorpaySuccess = async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    try {
      const verified = await api.payments.verifySubscription({
        subscriptionId: paymentData.razorpay_order_id,
        paymentId: paymentData.razorpay_payment_id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      });

      if (verified.success) {
        setSuccessMsg("Payment verified! Your One-Time Lifetime VIP Pass has been activated successfully.");
        await refreshUser();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please contact support.');
      throw err;
    }
  };

  const faqs = [
    {
      q: 'Is this really a one-time payment with no recurring fees?',
      a: 'Yes, 100%! You pay ₹299 just once. There are zero recurring monthly or yearly charges. Your account receives lifetime VIP privileges immediately.',
    },
    {
      q: 'Will listening to devotional songs remain free?',
      a: 'Yes. All 68 Telugu devotional vocal songs are completely free for everyone to listen to. Free users have standard free limits (6 skips per day), while VIP members enjoy infinite skips and downloads.',
    },
    {
      q: 'Does the One-Time Pass include karaoke/backing tracks?',
      a: 'The ₹299 One-Time Pass is exclusively for devotional vocal songs (all master WAV downloads, unlimited skips, infinite queue, ad-free listening). Studio minus-one / karaoke backing tracks are engineered specifically for church choirs and live singing and are purchased separately at ₹99 per track.',
    },
    {
      q: 'How do I purchase studio backing tracks?',
      a: 'You can preview any studio backing track for 30 seconds for free, and purchase permanent playback & master WAV download for individual tracks at ₹99 each.',
    },
  ];

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-16">
      <SEO
        title="Songs One-Time Pass (₹299) — Rev. Tony Prakash"
        description="Get Tony's One-Time Lifetime Pass for ₹299. Unlock unlimited skips, infinite queue, full devotional vocal songs master WAV downloads with zero recurring fees."
        canonical="https://tonyprakash.com/membership"
      />
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F5F7] border border-[#D4A017]/30 text-xs font-mono uppercase tracking-widest text-[#D4A017] font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
          <span>One-Time Lifetime Membership • జీవితకాల సభ్యత్వం</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading text-[#1D1D1F] font-bold">
          Songs One-Time Pass
        </h1>
        <p className="font-telugu text-base sm:text-lg text-[#D4A017] font-semibold">
          “ఒక్కసారి చెల్లించి జీవితకాలం అపరిమిత భక్తి సంగీతాన్ని ఆనందించండి”
        </p>
        <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed pt-1">
          Pay once, enjoy forever. Unlock full devotional songs master WAV downloads, infinite skips, unlimited queue additions, and ad-free listening with zero recurring subscriptions.
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs text-center shadow-lg">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs text-center shadow-lg">
          {errorMsg}
        </div>
      )}

      {/* 3 Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {/* Tier 1: Free Public Streaming */}
        <div className="rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-white border border-[#E5E5EA] shadow-md">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-heading text-[#1D1D1F] font-semibold">
                Free Listening
              </h3>
              <p className="font-telugu text-xs text-[#D4A017] mt-1">
                ఉచిత ఆరాధనా శ్రవణం
              </p>
              <p className="text-xs text-[#86868B] mt-1">
                For every believer listening at home, daily devotion, or family prayer.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-mono font-bold text-[#1D1D1F]">₹0</span>
              <span className="text-xs text-[#86868B]">/ always free</span>
            </div>

            <ul className="space-y-3 text-xs text-[#86868B]">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Stream all 68 Devotional Songs in full</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Watch worship ministry videos</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FastForward className="w-4 h-4 text-[#86868B] shrink-0" />
                <span>6 skips per day (resets daily)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Disc3 className="w-4 h-4 text-[#86868B] shrink-0" />
                <span>30-second preview on backing tracks</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              onClick={() => navigate('/music')}
              className="w-full py-3 rounded-full bg-[#F5F5F7] border border-[#E5E5EA] text-xs uppercase tracking-wider font-semibold text-[#1D1D1F] hover:text-[#FA243C] hover:border-[#FA243C]/40 transition-colors"
            >
              Start Free Listening
            </button>
          </div>
        </div>

        {/* Tier 2: VIP Lifetime Pass (Highlighted) */}
        <div className="relative rounded-3xl p-6 sm:p-8 border-2 border-[#D4A017] flex flex-col justify-between bg-gradient-to-b from-[#0E2838] via-[#0E0305] to-[#040D12] shadow-[0_0_50px_rgba(212,160,23,0.2)] md:-translate-y-3">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#D4A017] to-[#E8DCB8] text-[#0E0305] text-[11px] font-bold uppercase tracking-widest shadow-lg">
            ⭐ One-Time Lifetime Pass
          </div>

          <div className="space-y-6 pt-2">
            <div>
              <h3 className="text-2xl font-heading text-[#D4A017] font-bold">
                Tony's VIP Pass
              </h3>
              <p className="font-telugu text-xs text-[#D4A017] mt-1 font-semibold">
                జీవితకాల సభ్యత్వం • Pay Once, Keep Forever
              </p>
              <p className="text-xs text-[#86868B] mt-1">
                Complete unlimited access across the entire platform with zero recurring payments.
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-mono font-bold text-[#D4A017]">₹1</span>
              <span className="text-xs line-through text-gray-400 font-mono">₹299</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40">
                TESTING MODE (₹1)
              </span>
            </div>

            <ul className="space-y-3 text-xs text-[#FFFFFF]">
              <li className="flex items-center gap-2.5">
                <Infinity className="w-4 h-4 text-[#D4A017] shrink-0" />
                <span className="font-semibold text-white">Infinite Skips — Never get limited to 6 skips</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ListMusic className="w-4 h-4 text-[#D4A017] shrink-0" />
                <span className="font-semibold text-white">Infinite Add to Queue & Play Next</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-[#D4A017] shrink-0" />
                <span className="font-semibold text-white">Full WAV Downloads for All Devotional Vocal Songs</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Lifetime Validity (100 Years) • No Renewals</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-300">
                <Disc3 className="w-4 h-4 text-gray-400 shrink-0" />
                <span>Karaoke Backing Tracks Sold Separately (₹99/Track)</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            {isSubscriber ? (
              <div className="w-full py-3.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs uppercase tracking-wider font-bold text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                VIP Lifetime Pass Active
              </div>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#D4A017] via-[#E8DCB8] to-[#D4A017] text-[#0E0305] text-xs font-bold uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isLoading ? 'Processing...' : 'Get Lifetime Pass • ₹299 (One-Time)'}
              </button>
            )}
            <p className="text-[10px] text-gray-400 text-center mt-2.5 font-mono">
              Single payment of ₹299 (29,900 paise). Secure Razorpay integration.
            </p>
          </div>
        </div>

        {/* Tier 3: Individual Backing Track Purchases */}
        <div className="rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-white border border-[#E5E5EA] shadow-md">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-heading text-[#1D1D1F] font-semibold">
                Single Studio Track
              </h3>
              <p className="font-telugu text-xs text-[#D4A017] mt-1">
                సింగిల్ మ్యూజిక్ ట్రాక్ కొనుగోలు
              </p>
              <p className="text-xs text-[#86868B] mt-1">
                Pick individual minus-one / karaoke audio tracks for special church songs or solo singing.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-mono font-bold text-[#D4A017]">₹99</span>
              <span className="text-xs text-[#86868B]">/ per track</span>
            </div>

            <ul className="space-y-3 text-xs text-[#86868B]">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Full playback of selected backing track</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant high-fidelity Studio WAV download</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Permanent ownership tied to your account</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>57 separate backing tracks available</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              onClick={() => navigate('/tracks')}
              className="w-full py-3 rounded-full bg-[#F5F5F7] hover:bg-[#FEE2E2] border border-[#E5E5EA] text-xs uppercase tracking-wider font-semibold text-[#1D1D1F] hover:text-[#D4A017] transition-colors"
            >
              Browse Studio Tracks (₹99)
            </button>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="pt-8 space-y-6 max-w-3xl mx-auto">
        <h3 className="text-2xl font-heading text-[#1D1D1F] text-center font-bold">
          Frequently Asked Questions
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#161618] border border-[#E5E5EA] dark:border-[#27272A] space-y-2 shadow-sm transition-colors"
            >
              <h4 className="text-sm sm:text-base font-bold text-[#1D1D1F] dark:text-[#FFFFFF] flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4A017] shrink-0" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs sm:text-sm text-[#48484A] dark:text-[#D1D1D6] leading-relaxed pl-7 sm:pl-8 font-normal">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Razorpay Gateway Modal */}
      {razorpayOrder && (
        <RazorpayModal
          isOpen={true}
          orderId={razorpayOrder.orderId}
          amountPaise={razorpayOrder.amount}
          itemTitle="Songs One-Time Pass (₹299)"
          itemSubtitle="Lifetime Access: All Devotional Vocal Songs Master Downloads & Infinite Skips"
          isSubscription={true}
          userEmail={user?.email}
          userName={user?.name}
          onSuccess={handleRazorpaySuccess}
          onClose={() => setRazorpayOrder(null)}
        />
      )}
    </div>
  );
};
