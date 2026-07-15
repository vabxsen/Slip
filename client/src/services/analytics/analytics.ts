import type { Analytics } from 'firebase/analytics';
import { firebaseConfigured, getFirebaseApp } from '../firebase/firebaseApp';

let analytics: Analytics | null = null;

/**
 * No-ops until real Firebase project credentials are added to `.env` — Slip
 * works fully without them. Call once at startup.
 */
export async function initAnalytics(): Promise<void> {
  const appPromise = getFirebaseApp();
  if (!firebaseConfigured() || !appPromise) return;
  try {
    const [app, { getAnalytics }] = await Promise.all([appPromise, import('firebase/analytics')]);
    analytics = getAnalytics(app);
  } catch (error) {
    console.error('[analytics] failed to initialize', error);
  }
}

export async function logEvent(name: string, params?: Record<string, unknown>): Promise<void> {
  if (!analytics) return;
  const { logEvent: logFirebaseEvent } = await import('firebase/analytics');
  logFirebaseEvent(analytics, name, params);
}
