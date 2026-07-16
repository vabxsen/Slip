import { useAuthStore } from '@/features/auth/store/authStore';
import { useActiveTransfersStore, type TransferRecord } from '@/features/transfer/store/activeTransfersStore';
import { writeHistoryRecordToCloud } from '@/services/firestore/historyCloud';
import { saveHistoryRecord } from '@/services/storage/historyDb';
import { queryClient } from '@/app/queryClient';
import type { HistoryRecord, HistoryStatus } from '../types';
import { HISTORY_QUERY_KEY } from '../hooks/useHistoryQuery';

const TERMINAL_STATUSES = new Set<TransferRecord['status']>(['completed', 'cancelled', 'failed']);

/** fileIds already written this session, so a later unrelated patch doesn't re-save. */
const persistedIds = new Set<string>();

function toHistoryRecord(record: TransferRecord): HistoryRecord {
  const completedAt = record.completedAt ?? Date.now();
  return {
    id: record.id,
    batchId: record.batchId,
    direction: record.direction,
    status: record.status as HistoryStatus,
    name: record.name,
    size: record.size,
    mimeType: record.mimeType,
    peerName: record.peerName,
    startedAt: record.startedAt,
    completedAt,
    durationMs: Math.max(0, completedAt - record.startedAt),
    errorMessage: record.errorMessage,
  };
}

/**
 * Watches the in-memory transfer store and writes every transfer to
 * IndexedDB the moment it reaches a terminal state — the durable half of
 * the session-scoped `activeTransfersStore`. Call once at app startup.
 */
export function initHistorySync(): () => void {
  return useActiveTransfersStore.subscribe((state) => {
    for (const record of Object.values(state.records)) {
      if (TERMINAL_STATUSES.has(record.status) && !persistedIds.has(record.id)) {
        persistedIds.add(record.id);
        const historyRecord = toHistoryRecord(record);
        void saveHistoryRecord(historyRecord).then(() => {
          void queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY });
        });
        const uid = useAuthStore.getState().user?.uid;
        if (uid) void writeHistoryRecordToCloud(uid, historyRecord);
      }
    }
  });
}
