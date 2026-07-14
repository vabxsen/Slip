import { useEffect } from 'react';
import { initHistorySync } from '../services/historySync';

/** Mounts the IndexedDB persistence subscription once for the app's lifetime. */
export function useHistorySync(): void {
  useEffect(() => initHistorySync(), []);
}
