import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, RefreshCw, ArrowRight, Music, Home, ShieldCheck } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { SEO } from '../components/SEO.js';

export const PaymentReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Verifying payment with gateway servers...');

  useEffect(() => {
    let isMounted = true;

    async function verify() {
      try {
        const orderId = searchParams.get('order_id') || searchParams.get('orderId');
        const gateway = (searchParams.get('gateway') || 'CASHFREE').toUpperCase();
        const paymentId = searchParams.get('payment_id') || searchParams.get('cf_payment_id') || undefined;
        const paymentRequestId = searchParams.get('payment_request_id') || undefined;

        if (!orderId && !paymentRequestId) {
          if (isMounted) {
            setIsLoading(false);
            setIsSuccess(false);
            setStatusMessage('No order information found in return URL.');
          }
          return;
        }

        // Call server-side verification API
        const res = await api.payments.verifyUnifiedPayment({
          orderId: orderId || paymentRequestId || '',
          gateway,
          paymentId,
          paymentRequestId,
        });

        if (isMounted) {
          setIsLoading(false);
          if (res.success) {
            setIsSuccess(true);
            setOrderInfo(res);
            setStatusMessage(res.message || 'Payment successfully verified!');
            await refreshUser();
          } else {
            setIsSuccess(false);
            setStatusMessage(res.message || 'Payment could not be verified.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setIsLoading(false);
          setIsSuccess(false);
          setStatusMessage(err.message || 'Error occurred while verifying transaction.');
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [searchParams, refreshUser]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <SEO title="Payment Status • Tony Prakash Official Music" />

      <div className="w-full max-w-md bg-[#0E0305] text-white border border-[#D4A017]/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.85)] text-center space-y-6">
        {isLoading ? (
          <div className="py-10 space-y-4">
            <div className="w-14 h-14 border-4 border-[#D4A017] border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="text-xl font-heading font-bold text-white">
              Verifying Payment...
            </h3>
            <p className="text-xs text-gray-400">
              Validating transaction status with official gateway servers. Please wait.
            </p>
          </div>
        ) : isSuccess ? (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-heading font-bold text-white">
                Payment Successful!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-400 font-medium">
                {statusMessage}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-left space-y-1.5">
              <div className="flex justify-between text-gray-400">
                <span>Order Reference:</span>
                <span className="font-mono text-white font-bold">{orderInfo?.orderId}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Access Status:</span>
                <span className="text-emerald-400 font-bold">UNLOCKED</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => navigate(orderInfo?.itemType === 'TRACK' ? '/tracks' : '/membership')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4A017] via-[#E8DCB8] to-[#D4A017] text-[#0E0305] text-xs font-bold uppercase tracking-widest shadow-xl hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>{orderInfo?.itemType === 'TRACK' ? 'View My Backing Tracks' : 'Go to VIP Membership'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-2.5 rounded-xl text-xs text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-3xl bg-red-500/15 border-2 border-red-500/30 flex items-center justify-center mx-auto text-red-500 shadow-lg shadow-red-500/10">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-heading font-bold text-white">
                Payment Verification Notice
              </h3>
              <p className="text-xs sm:text-sm text-red-400 font-medium">
                {statusMessage}
              </p>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              If your bank account was debited, your order will be automatically activated via server webhook. You can also contact Rev. Tony Prakash directly with your transaction details.
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => navigate('/membership')}
                className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-widest transition-all"
              >
                Back to Membership & Tracks
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
