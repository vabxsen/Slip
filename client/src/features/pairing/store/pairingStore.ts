import { create } from 'zustand';

export type PairingStatus = 'idle' | 'creating' | 'ready' | 'error';

interface PairingState {
  /** This device's current pairing code, issued by the server. */
  code: string | null;
  expiresAt: number | null;
  status: PairingStatus;
  setCode: (code: string, expiresAt: number) => void;
  setStatus: (status: PairingStatus) => void;
}

export const usePairingStore = create<PairingState>((set) => ({
  code: null,
  expiresAt: null,
  status: 'idle',
  setCode: (code, expiresAt) => set({ code, expiresAt, status: 'ready' }),
  setStatus: (status) => set({ status }),
}));

/** URL another device opens (or scans) to pair with this one. */
export function buildPairUrl(code: string): string {
  return `${window.location.origin}/pair?code=${code}`;
}
