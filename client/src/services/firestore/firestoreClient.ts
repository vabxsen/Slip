import type { Firestore } from 'firebase/firestore';
import { firebaseConfigured, getFirebaseApp } from '../firebase/firebaseApp';

let dbPromise: Promise<Firestore> | null = null;

/**
 * Lazily initializes and memoizes the shared Firestore instance, with the
 * SDK's own IndexedDB-backed offline cache enabled so cloud-synced data keeps
 * working offline. Mirrors the lazy/memoized pattern in firebaseApp.ts and
 * auth.ts, including clearing the memoized promise on rejection so a
 * transient failure doesn't permanently block later sync attempts.
 */
export function getFirestoreInstance(): Promise<Firestore> | null {
  const appPromise = getFirebaseApp();
  if (!firebaseConfigured() || !appPromise) return null;
  dbPromise ??= Promise.all([appPromise, import('firebase/firestore')])
    .then(([app, { initializeFirestore, persistentLocalCache }]) =>
      initializeFirestore(app, { localCache: persistentLocalCache() }),
    )
    .catch((error: unknown) => {
      dbPromise = null;
      throw error;
    });
  return dbPromise;
}
