import { PAIR_CODE_LENGTH } from '@slip/shared';
import { create } from 'zustand';

export type PairingStatus = 'idle' | 'generating' | 'ready';

interface PairingState {
  code: string | null;
  status: PairingStatus;
  regenerate: () => void;
}

/**
 * TODO(phase-6): replace the local generator with a `pair:create` request to
 * the signaling server — the store shape stays identical, only the source of
 * the code changes.
 */
function generateLocalCode(): string {
  const max = 10 ** PAIR_CODE_LENGTH;
  const value = crypto.getRandomValues(new Uint32Array(1))[0]! % max;
  return String(value).padStart(PAIR_CODE_LENGTH, '0');
}

export const usePairingStore = create<PairingState>((set) => ({
  code: generateLocalCode(),
  status: 'ready',
  regenerate: () => set({ code: generateLocalCode(), status: 'ready' }),
}));

/** URL another device opens (or scans) to pair with this one. */
export function buildPairUrl(code: string): string {
  return `${window.location.origin}/pair?code=${code}`;
}
