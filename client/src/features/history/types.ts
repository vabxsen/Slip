import type { TransferDirection } from '@slip/shared';

export type HistoryStatus = 'completed' | 'cancelled' | 'failed';

/** A finished transfer, persisted to IndexedDB so it survives reloads. */
export interface HistoryRecord {
  id: string;
  batchId: string;
  direction: TransferDirection;
  status: HistoryStatus;
  name: string;
  size: number;
  mimeType: string;
  peerName: string;
  startedAt: number;
  completedAt: number;
  durationMs: number;
  errorMessage?: string;
}
