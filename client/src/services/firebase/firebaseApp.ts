import type { FirebaseApp, FirebaseOptions } from 'firebase/app';

const config: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/** True when this build has real Firebase project credentials configured. */
export function firebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.projectId && config.appId);
}

let appPromise: Promise<FirebaseApp> | null = null;

/**
 * Lazily initializes and memoizes the single shared Firebase app instance —
 * Analytics and Auth both call this rather than each running their own
 * `initializeApp`, which would throw on the second call. The `firebase/app`
 * SDK is only fetched once real credentials are present.
 */
export function getFirebaseApp(): Promise<FirebaseApp> | null {
  if (!firebaseConfigured()) return null;
  appPromise ??= import('firebase/app').then(({ initializeApp }) => initializeApp(config));
  return appPromise;
}
