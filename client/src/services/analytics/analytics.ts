import type { FirebaseOptions } from 'firebase/app';
import type { Analytics } from 'firebase/analytics';

const config: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let analytics: Analytics | null = null;

/**
 * No-ops until real Firebase project credentials are added to `.env` — Slip
 * works fully without them. The `firebase` SDK (~400KB) is only fetched when
 * credentials are actually present, so unconfigured builds never pay for it.
 * Call once at startup.
 */
export async function initAnalytics(): Promise<void> {
  if (!config.apiKey || !config.measurementId) return;
  try {
    const [{ initializeApp }, { getAnalytics }] = await Promise.all([
      import('firebase/app'),
      import('firebase/analytics'),
    ]);
    const app = initializeApp(config);
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
