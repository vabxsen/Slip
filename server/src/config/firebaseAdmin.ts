import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

let auth: Auth | null = null;

/**
 * Lazily initializes the Firebase Admin SDK. No explicit credentials are
 * passed — Cloud Run supplies Application Default Credentials automatically.
 * For local dev, set GOOGLE_APPLICATION_CREDENTIALS to a service account key.
 */
export function getAdminAuth(): Auth {
  if (!auth) {
    if (getApps().length === 0) initializeApp();
    auth = getAuth();
  }
  return auth;
}
