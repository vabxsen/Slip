import type { TransferDirection, TransferStatus } from '@slip/shared';
import { create } from 'zustand';

export interface TransferRecord {
  /** Same id as the file's FileMeta — unique per transfer. */
  id: string;
  batchId: string;
  direction: TransferDirection;
  status: TransferStatus;
  name: string;
  size: number;
  mimeType: string;
  bytesTransferred: number;
  speedBps: number;
  peerName: string;
  startedAt: number;
  completedAt?: number;
  errorMessage?: string;
}

const IN_FLIGHT: TransferStatus[] = ['pending', 'accepted', 'transferring'];
const TERMINAL: TransferStatus[] = ['completed', 'cancelled', 'failed'];

interface ActiveTransfersState {
  records: Record<string, TransferRecord>;
  upsert: (record: TransferRecord) => void;
  patch: (id: string, partial: Partial<TransferRecord>) => void;
  failAllInFlight: (reason: string) => void;
  clear: () => void;
}

/**
 * Session-scoped record of every send/receive this tab has driven. Phase 9
 * persists a version of this to IndexedDB; for now it lives only in memory.
 */
export const useActiveTransfersStore = create<ActiveTransfersState>((set) => ({
  records: {},
  upsert: (record) => set((state) => ({ records: { ...state.records, [record.id]: record } })),
  patch: (id, partial) =>
    set((state) => {
      const existing = state.records[id];
      if (!existing) return state;
      return { records: { ...state.records, [id]: { ...existing, ...partial } } };
    }),
  failAllInFlight: (reason) =>
    set((state) => {
      const next = { ...state.records };
      for (const [id, record] of Object.entries(next)) {
        if (IN_FLIGHT.includes(record.status)) {
          next[id] = { ...record, status: 'failed', errorMessage: reason };
        }
      }
      return { records: next };
    }),
  clear: () => set({ records: {} }),
}));

export function selectActiveTransfers(state: ActiveTransfersState): TransferRecord[] {
  return Object.values(state.records)
    .filter((r) => IN_FLIGHT.includes(r.status))
    .sort((a, b) => a.startedAt - b.startedAt);
}

export function selectRecentTransfers(state: ActiveTransfersState): TransferRecord[] {
  return Object.values(state.records)
    .filter((r) => TERMINAL.includes(r.status))
    .sort((a, b) => (b.completedAt ?? b.startedAt) - (a.completedAt ?? a.startedAt));
}
