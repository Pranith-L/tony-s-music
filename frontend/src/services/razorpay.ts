// Razorpay Standard Web Checkout Integration Service

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  orderId: string;
  amountPaise: number;
  currency?: string;
  itemTitle: string;
  itemDescription?: string;
  userEmail?: string;
  userName?: string;
  userContact?: string;
  keyId?: string;
  onSuccess: (response: RazorpayPaymentSuccessResponse) => void | Promise<void>;
  onDismiss?: () => void;
  onError?: (error: any) => void;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
  }

  const keyId =
    options.keyId ||
    import.meta.env.VITE_RAZORPAY_KEY_ID ||
    'rzp_test_TsCQlNDdeIP4v3';

  const rzpOptions = {
    key: keyId,
    amount: options.amountPaise,
    currency: options.currency || 'INR',
    name: "Tony's Music",
    description: options.itemTitle,
    image: '/favicon.png',
    order_id: options.orderId,
    prefill: {
      name: options.userName || '',
      email: options.userEmail || '',
      contact: options.userContact || '',
    },
    notes: {
      platform: "Tony's Music Web App",
      item: options.itemTitle,
    },
    theme: {
      color: '#FA243C', // Apple Music Red Brand color
    },
    modal: {
      confirm_close: true,
      ondismiss: function () {
        if (options.onDismiss) {
          options.onDismiss();
        }
      },
    },
    handler: function (response: RazorpayPaymentSuccessResponse) {
      options.onSuccess(response);
    },
  };

  const rzp = new window.Razorpay(rzpOptions);

  rzp.on('payment.failed', function (failureData: any) {
    console.error('Razorpay payment failed:', failureData);
    if (options.onError) {
      options.onError(failureData?.error || failureData);
    }
  });

  rzp.open();
}
