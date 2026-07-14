import type { DeviceInfo } from '@slip/shared';
import { useEffect } from 'react';
import '@/features/transfer/services/transferSelfTest';
import { handleChannelMessage, resetTransferSession } from '@/features/transfer/services/transferDispatcher';
import { connectSocket, getSocket } from '@/services/socket/socketClient';
import { peerSession } from '@/services/webrtc/peerSession';
import { useConnectionStore } from '@/store/connectionStore';
import { showToast } from '@/store/toastStore';
import { hostRoom } from '../services/pairingHost';

/**
 * App-level effect (mounted once): opens the signaling socket, keeps the
 * pairing code fresh across reconnects, mirrors peer presence into the
 * connection store, and routes data-channel messages to the transfer engine.
 * Every socket→store binding lives here so components stay declarative.
 */
export function useConnectionListeners(): void {
  useEffect(() => {
    const socket = getSocket();
    const { setSocketStatus, addPeer, removePeer, reset } = useConnectionStore.getState();

    peerSession.setMessageHandler((data) => {
      const channel = peerSession.getChannel();
      if (channel) handleChannelMessage(channel, data);
    });

    const onConnect = () => {
      setSocketStatus('online');
      void hostRoom();
    };
    // Losing the signaling channel invalidates the pairing session: on
    // reconnect the server issues a fresh room, so stale peers must clear.
    const onDisconnect = () => {
      setSocketStatus('offline');
      peerSession.stop();
      resetTransferSession('Connection lost');
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
      resetTransferSession('Device disconnected');
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
