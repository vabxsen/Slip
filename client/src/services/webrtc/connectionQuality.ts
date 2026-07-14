import type { ConnectionQuality } from '@/store/connectionStore';

/** Maps a measured round-trip time (ms) to a coarse quality band. */
export function qualityFromRtt(rttMs: number | null): ConnectionQuality {
  if (rttMs === null) return 'good'; // connected, but no sample yet
  if (rttMs < 80) return 'excellent';
  if (rttMs < 250) return 'good';
  return 'poor';
}
