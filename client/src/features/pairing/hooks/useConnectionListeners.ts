import type {
  ConnectAcceptedPayload,
  ConnectDeclinedPayload,
  ConnectIncomingPayload,
  DeviceInfo,
  MessageReceivedPayload,
} from '@slip/shared';
import { useEffect } from 'react';
import '@/features/transfer/services/transferSelfTest';
import { useMessageStore } from '@/features/messaging/store/messageStore';
import { handleChannelMessage, resetTransferSession } from '@/features/transfer/services/transferDispatcher';
import { notify } from '@/services/notifications/notifications';
import { connectSocket, getSocket } from '@/services/socket/socketClient';
import { peerSession } from '@/services/webrtc/peerSession';
import { useConnectionStore } from '@/store/connectionStore';
import { useSettingsStore } from '@/store/settingsStore';
import { showToast } from '@/store/toastStore';
import { hostRoom } from '../services/pairingHost';
import { registerPresence } from '../services/presenceClient';
import { useConnectRequestStore } from '../store/connectRequestStore';

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
      void registerPresence();
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
      if (useSettingsStore.getState().notificationsEnabled) {
        notify('Device connected', { body: peer.name, tag: `peer-${peer.id}` });
      }
    };
    const onPeerLeft = (peerId: string) => {
      const peer = useConnectionStore.getState().peers.find((p) => p.id === peerId);
      peerSession.stop();
      resetTransferSession('Device disconnected');
      removePeer(peerId);
      if (peer) showToast(`${peer.name} disconnected`);
    };

    // Username-initiated connection requests (parallel to the QR/code flow).
    const onConnectIncoming = (payload: ConnectIncomingPayload) => {
      useConnectRequestStore.getState().setIncoming(payload);
    };
    const onConnectAccepted = ({ peer }: ConnectAcceptedPayload) => {
      addPeer({ ...peer, quality: 'unknown', connectedAt: Date.now() });
      // Requester drives the WebRTC handshake, mirroring useJoinPair.ts.
      peerSession.start('initiator', peer);
      useConnectRequestStore.getState().setOutgoing(null);
      showToast(`Connected to ${peer.name}`, 'success');
    };
    const onConnectDeclined = (_payload: ConnectDeclinedPayload) => {
      useConnectRequestStore.getState().declineOutgoing();
    };

    const onMessageReceive = (payload: MessageReceivedPayload) => {
      useMessageStore.getState().addReceived(payload);
      if (useSettingsStore.getState().notificationsEnabled) {
        notify(`Message from ${payload.fromDisplayName ?? payload.fromUsername}`, {
          body: payload.text,
          tag: `message-${payload.fromUsername}`,
        });
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('peer:joined', onPeerJoined);
    socket.on('peer:left', onPeerLeft);
    socket.on('connect:incoming', onConnectIncoming);
    socket.on('connect:accepted', onConnectAccepted);
    socket.on('connect:declined', onConnectDeclined);
    socket.on('message:receive', onMessageReceive);

    if (socket.connected) onConnect();
    else connectSocket();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('peer:joined', onPeerJoined);
      socket.off('peer:left', onPeerLeft);
      socket.off('connect:incoming', onConnectIncoming);
      socket.off('connect:accepted', onConnectAccepted);
      socket.off('connect:declined', onConnectDeclined);
      socket.off('message:receive', onMessageReceive);
    };
  }, []);
}
