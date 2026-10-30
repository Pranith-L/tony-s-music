/**
 * Payment Gateway Configuration Flag
 * Defaults to true (paused) until live production credentials are confirmed.
 */
export const PAYMENTS_PAUSED = import.meta.env.VITE_PAYMENTS_PAUSED !== 'false';

