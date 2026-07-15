import type { Auth, Unsubscribe, User } from 'firebase/auth';
import { firebaseConfigured, getFirebaseApp } from '../firebase/firebaseApp';

let authPromise: Promise<Auth> | null = null;

function getAuthInstance(): Promise<Auth> | null {
  const appPromise = getFirebaseApp();
  if (!firebaseConfigured() || !appPromise) return null;
  authPromise ??= Promise.all([appPromise, import('firebase/auth')]).then(([app, mod]) =>
    mod.getAuth(app),
  );
  return authPromise;
}

/** Subscribes to sign-in state; returns an unsubscribe function, or null if unconfigured. */
export function onAuthChange(callback: (user: User | null) => void): Promise<Unsubscribe | null> {
  const authInstance = getAuthInstance();
  if (!authInstance) return Promise.resolve(null);
  return Promise.all([authInstance, import('firebase/auth')]).then(([auth, { onAuthStateChanged }]) =>
    onAuthStateChanged(auth, callback),
  );
}

/**
 * Starts Google sign-in via a full-page redirect rather than a popup.
 * `signInWithPopup` requires `window.open` to fire synchronously within the
 * click handler; the dynamic imports this module needs to lazy-load Firebase
 * push that call past the browser's user-gesture window, so popups get
 * blocked unpredictably (confirmed: `auth/popup-blocked` in testing).
 * Redirect has no such timing requirement and behaves better in an installed
 * PWA besides. Call `completeRedirectSignIn` once on startup to finish it.
 */
export async function signInWithGoogle(): Promise<void> {
  const authInstance = getAuthInstance();
  if (!authInstance) throw new Error('Sign-in is not available in this build');
  const [auth, { GoogleAuthProvider, signInWithRedirect }] = await Promise.all([
    authInstance,
    import('firebase/auth'),
  ]);
  await signInWithRedirect(auth, new GoogleAuthProvider());
}

/** Resolves the pending redirect sign-in, if the page was just redirected back. Call once on startup. */
export async function completeRedirectSignIn(): Promise<User | null> {
  const authInstance = getAuthInstance();
  if (!authInstance) return null;
  const [auth, { getRedirectResult }] = await Promise.all([authInstance, import('firebase/auth')]);
  const result = await getRedirectResult(auth);
  return result?.user ?? null;
}

export async function signOut(): Promise<void> {
  const authInstance = getAuthInstance();
  if (!authInstance) return;
  const [auth, { signOut: firebaseSignOut }] = await Promise.all([
    authInstance,
    import('firebase/auth'),
  ]);
  await firebaseSignOut(auth);
}
