// Google Analytics 4 (GA4) Integration for Tony Prakash Platform

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID =
  (import.meta as any).env?.VITE_GA_MEASUREMENT_ID || 'G-TONYPRAKASH26';

let isInitialized = false;

export function initGA(measurementId: string = GA_MEASUREMENT_ID) {
  if (isInitialized || typeof window === 'undefined') return;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false, // Managed dynamically via router hook
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
  });

  // Inject gtag.js script if not present
  if (!document.getElementById('google-analytics-gtag')) {
    const script = document.createElement('script');
    script.id = 'google-analytics-gtag';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  }

  isInitialized = true;
  console.log(`[Google Analytics] Initialized with Measurement ID: ${measurementId}`);
}

export function trackPageView(path: string, title?: string) {
  if (typeof window === 'undefined' || !window.gtag) {
    initGA();
  }

  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href,
    });
  }
}

export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number,
  params?: Record<string, any>
) {
  if (typeof window === 'undefined' || !window.gtag) {
    initGA();
  }

  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...params,
    });
  }
}

export function trackSongPlay(songTitle: string, isTrack: boolean = false) {
  trackEvent('song_play', isTrack ? 'BackingTrack' : 'DevotionalSong', songTitle);
}

export function trackPurchaseIntent(itemTitle: string, amount: number) {
  trackEvent('begin_checkout', 'Ecommerce', itemTitle, amount, {
    currency: 'INR',
    value: amount / 100,
  });
}

export function trackPurchaseSuccess(itemTitle: string, orderId: string, amount: number) {
  trackEvent('purchase', 'Ecommerce', itemTitle, amount, {
    transaction_id: orderId,
    currency: 'INR',
    value: amount / 100,
  });
}
