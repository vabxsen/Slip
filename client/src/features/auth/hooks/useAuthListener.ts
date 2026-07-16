import { useEffect } from 'react';
import { completeRedirectSignIn, onAuthChange } from '@/services/auth/auth';
import { showToast } from '@/store/toastStore';
import { useAuthStore } from '../store/authStore';

/**
 * Mounts once at app startup: resolves a pending redirect sign-in (if the
 * page was just navigated back to from Google), then subscribes to Firebase
 * Auth state and mirrors it into authStore. No-ops (stays 'loading' forever)
 * if Firebase isn't configured — AccountSection shows a "not configured"
 * state in that case.
 */
export function useAuthListener(): void {
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    completeRedirectSignIn()
      .then((user) => {
        if (user) showToast('Signed in', 'success');
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Sign-in failed';
        showToast(message, 'error');
      });

    onAuthChange((firebaseUser) => {
      useAuthStore.getState().setUser(
        firebaseUser
          ? {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
            }
          : null,
      );
    })
      .then((unsub) => {
        if (cancelled) unsub?.();
        else unsubscribe = unsub;
      })
      .catch(() => {
        // Firebase failed to initialize (flaky network, blocked script, stale
        // chunk after a redeploy) — fall back to signed-out rather than
        // leaving the UI stuck on "Checking sign-in status…" forever.
        if (!cancelled) useAuthStore.getState().setUser(null);
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);
}
