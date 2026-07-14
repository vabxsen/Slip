import { QueryClient } from '@tanstack/react-query';

/**
 * Module-level singleton so non-React code (e.g. the history-sync service,
 * which writes to IndexedDB from a Zustand subscription) can invalidate
 * queries directly without threading the client through props.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});
