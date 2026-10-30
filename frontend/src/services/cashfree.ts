// Cashfree Payments Frontend SDK Helper (Cashfree JS SDK v3)

declare global {
  interface Window {
    Cashfree?: any;
  }
}

let cashfreePromise: Promise<any> | null = null;

export function loadCashfreeSDK(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window not available'));
  }

  if (window.Cashfree) {
    return Promise.resolve(window.Cashfree);
  }

  if (cashfreePromise) {
    return cashfreePromise;
  }

  cashfreePromise = new Promise((resolve, reject) => {
    // Check if script is already present in DOM
    const existingScript = document.querySelector('script[src*="cashfree.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.Cashfree));
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Cashfree SDK')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) {
        resolve(window.Cashfree);
      } else {
        reject(new Error('Cashfree object not found on window after script load'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Cashfree JS SDK from CDN'));
    document.head.appendChild(script);
  });

  return cashfreePromise;
}

export interface CashfreeCheckoutOptions {
  paymentSessionId: string;
  mode?: 'sandbox' | 'production';
  redirectTarget?: '_self' | '_blank' | '_modal';
}

export async function openCashfreeCheckout(options: CashfreeCheckoutOptions): Promise<any> {
  const CashfreeConstructor = await loadCashfreeSDK();
  if (!CashfreeConstructor) {
    throw new Error('Cashfree SDK is not available');
  }

  const mode = options.mode || (import.meta.env.PROD ? 'production' : 'sandbox');
  const cashfree = CashfreeConstructor({ mode });

  return cashfree.checkout({
    paymentSessionId: options.paymentSessionId,
    redirectTarget: options.redirectTarget || '_modal',
  });
}
