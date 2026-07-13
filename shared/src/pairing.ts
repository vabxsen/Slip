import type { DeviceInfo } from './device';

export const PAIR_CODE_LENGTH = 6;

/** How long a pairing code stays valid before it must be regenerated. */
export const PAIR_CODE_TTL_MS = 5 * 60_000;

export interface PairCreateResult {
  code: string;
  expiresAt: number;
}

export type PairJoinResult =
  | { ok: true; peer: DeviceInfo }
  | { ok: false; error: PairJoinError };

export type PairJoinError = 'not-found' | 'expired' | 'room-full' | 'invalid-code';
