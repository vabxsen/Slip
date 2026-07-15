import { create } from 'zustand';

export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export type AuthStatus = 'loading' | 'signed-in' | 'signed-out';

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  setUser: (user: AuthUser | null) => void;
}

/**
 * Mirrors Firebase Auth's own sign-in state (Firebase persists the session
 * itself in IndexedDB) — this store is just the read model the UI subscribes
 * to, kept in sync by useAuthListener.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  setUser: (user) => set({ user, status: user ? 'signed-in' : 'signed-out' }),
}));
