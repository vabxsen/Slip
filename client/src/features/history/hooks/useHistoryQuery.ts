import { useQuery } from '@tanstack/react-query';
import { getAllHistoryRecords } from '@/services/storage/historyDb';

export const HISTORY_QUERY_KEY = ['history'] as const;

/** All persisted transfers, newest first. Invalidated by historySync on every write. */
export function useHistoryQuery() {
  return useQuery({
    queryKey: HISTORY_QUERY_KEY,
    queryFn: getAllHistoryRecords,
    staleTime: Infinity,
  });
}
