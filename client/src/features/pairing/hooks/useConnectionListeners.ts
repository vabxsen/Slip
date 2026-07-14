import type { DeviceInfo } from '@slip/shared';
import { useEffect } from 'react';
import { connectSocket, getSocket } from '@/services/socket/socketClient';
import { peerSession } from '@/services/webrtc/peerSession';
import { useConnectionStore } from '@/store/connectionStore';
import { showToast } from '@/store/toastStore';
import { hostRoom } from '../services/pairingHost';

/**
 * App-level effect (mounted once): opens the signaling socket, keeps the
 * pairing code fresh across reconnects, and mirrors peer presence into the
 * connection store. Every socket→store binding lives here so components stay
 * declarative.
 */
export function useConnectionListeners(): void {
  useEffect(() => {
    const socket = getSocket();
    const { setSocketStatus, addPeer, removePeer, reset } = useConnectionStore.getState();

    const onConnect = () => {
      setSocketStatus('online');
      void hostRoom();
    };
    // Losing the signaling channel invalidates the pairing session: on
    // reconnect the server issues a fresh room, so stale peers must clear.
    const onDisconnect = () => {
      setSocketStatus('offline');
      peerSession.stop();
      reset();
    };

    // Host side: a peer joined our room — answer its upcoming WebRTC offer.
    const onPeerJoined = (peer: DeviceInfo) => {
      addPeer({ ...peer, quality: 'unknown', connectedAt: Date.now() });
      peerSession.start('responder', peer);
      showToast(`${peer.name} connected`, 'success');
    };
    const onPeerLeft = (peerId: string) => {
      const peer = useConnectionStore.getState().peers.find((p) => p.id === peerId);
      peerSession.stop();
      removePeer(peerId);
      if (peer) showToast(`${peer.name} disconnected`);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('peer:joined', onPeerJoined);
    socket.on('peer:left', onPeerLeft);

    if (socket.connected) onConnect();
    else connectSocket();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('peer:joined', onPeerJoined);
      socket.off('peer:left', onPeerLeft);
    };
  }, []);
}
