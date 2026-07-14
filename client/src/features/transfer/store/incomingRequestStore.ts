import type { FileMeta } from '@slip/shared';
import { create } from 'zustand';

export interface IncomingBatchRequest {
  batchId: string;
  peerName: string;
  files: FileMeta[];
}

interface IncomingRequestState {
  request: IncomingBatchRequest | null;
  setRequest: (request: IncomingBatchRequest) => void;
  clear: () => void;
}

/** The single pending "someone wants to send you files" prompt, if any. */
export const useIncomingRequestStore = create<IncomingRequestState>((set) => ({
  request: null,
  setRequest: (request) => set({ request }),
  clear: () => set({ request: null }),
}));
