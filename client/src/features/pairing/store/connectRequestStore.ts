import type { ConnectIncomingPayload, PublicProfile } from '@slip/shared';
import { create } from 'zustand';

export type OutgoingRequestStatus = 'pending' | 'declined';

export interface OutgoingRequest {
  requestId: string;
  status: OutgoingRequestStatus;
  peerProfile: PublicProfile;
}

interface ConnectRequestState {
  incoming: ConnectIncomingPayload | null;
  outgoing: OutgoingRequest | null;
  setIncoming: (incoming: ConnectIncomingPayload | null) => void;
  setOutgoing: (outgoing: OutgoingRequest | null) => void;
  declineOutgoing: () => void;
}

/** Ephemeral, in-memory only — pairing requests never need to survive a reload. */
export const useConnectRequestStore = create<ConnectRequestState>((set) => ({
  incoming: null,
  outgoing: null,
  setIncoming: (incoming) => set({ incoming }),
  setOutgoing: (outgoing) => set({ outgoing }),
  declineOutgoing: () =>
    set((state) => (state.outgoing ? { outgoing: { ...state.outgoing, status: 'declined' } } : state)),
}));
