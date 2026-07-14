import type { DeviceInfo } from '@slip/shared';
import { create } from 'zustand';

export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'unknown';

/** Socket.IO signaling-channel status (distinct from peer WebRTC links). */
export type SocketStatus = 'connecting' | 'online' | 'offline';

export interface ConnectedPeer extends DeviceInfo {
  quality: ConnectionQuality;
  connectedAt: number;
}

interface ConnectionState {
  socketStatus: SocketStatus;
  peers: ConnectedPeer[];
  /** True once the WebRTC data channel to the peer is open and usable. */
  dataChannelReady: boolean;
  setSocketStatus: (status: SocketStatus) => void;
  addPeer: (peer: ConnectedPeer) => void;
  removePeer: (peerId: string) => void;
  setPeerQuality: (peerId: string, quality: ConnectionQuality) => void;
  setDataChannelReady: (ready: boolean) => void;
  reset: () => void;
}

/**
 * Live connections to paired devices. Populated by the socket/WebRTC
 * services (Phases 6–7); the UI only ever reads from here.
 */
export const useConnectionStore = create<ConnectionState>((set) => ({
  socketStatus: 'connecting',
  peers: [],
  dataChannelReady: false,
  setSocketStatus: (socketStatus) => set({ socketStatus }),
  addPeer: (peer) =>
    set((state) => ({
      peers: [...state.peers.filter((p) => p.id !== peer.id), peer],
    })),
  removePeer: (peerId) =>
    set((state) => ({
      peers: state.peers.filter((p) => p.id !== peerId),
      dataChannelReady: state.peers.some((p) => p.id !== peerId) ? state.dataChannelReady : false,
    })),
  setPeerQuality: (peerId, quality) =>
    set((state) => ({
      peers: state.peers.map((p) => (p.id === peerId ? { ...p, quality } : p)),
    })),
  setDataChannelReady: (dataChannelReady) => set({ dataChannelReady }),
  reset: () => set({ peers: [], dataChannelReady: false }),
}));

if (import.meta.env.DEV) {
  // Dev-console helper to preview the connected-devices UI before Phase 6.
  (window as unknown as { __slipMockPeer?: () => void }).__slipMockPeer = () =>
    useConnectionStore.getState().addPeer({
      id: crypto.randomUUID(),
      name: 'Pixel 9',
      type: 'phone',
      platform: 'Android · Chrome',
      quality: 'excellent',
      connectedAt: Date.now(),
    });
}
