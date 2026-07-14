import type { DeviceInfo } from '@slip/shared';
import { getSocket } from '@/services/socket/socketClient';
import { useConnectionStore } from '@/store/connectionStore';
import { PeerConnection } from './PeerConnection';
import { qualityFromRtt } from './connectionQuality';

export type SessionRole = 'initiator' | 'responder';
export type ChannelMessageHandler = (data: ArrayBuffer | string) => void;

const QUALITY_POLL_MS = 2500;

/**
 * Manages the single active peer-to-peer session (Slip pairs 1:1). Owns the
 * RTCPeerConnection, wires signaling to/from the socket, tracks data-channel
 * readiness and connection quality, and hands the open channel to the
 * transfer engine (Phase 8) via `setMessageHandler` / `getChannel`.
 */
class PeerSession {
  private connection: PeerConnection | null = null;
  private channel: RTCDataChannel | null = null;
  private peer: DeviceInfo | null = null;
  private qualityTimer: ReturnType<typeof setInterval> | null = null;
  private messageHandler: ChannelMessageHandler | null = null;
  private iceRestarted = false;

  start(role: SessionRole, peer: DeviceInfo): void {
    this.stop();
    this.peer = peer;
    this.iceRestarted = false;

    const socket = getSocket();
    this.connection = new PeerConnection(
      {
        sendDescription: (description) => socket.emit('signal:description', description),
        sendCandidate: (candidate) => socket.emit('signal:candidate', candidate),
        onDataChannel: (channel) => this.attachChannel(channel),
        onConnectionStateChange: (state) => this.handleConnectionState(state),
      },
      { polite: role === 'responder', initiator: role === 'initiator' },
    );

    socket.on('signal:description', this.onSignalDescription);
    socket.on('signal:candidate', this.onSignalCandidate);
  }

  stop(): void {
    const socket = getSocket();
    socket.off('signal:description', this.onSignalDescription);
    socket.off('signal:candidate', this.onSignalCandidate);

    if (this.qualityTimer) clearInterval(this.qualityTimer);
    this.qualityTimer = null;

    this.channel?.close();
    this.channel = null;
    this.connection?.close();
    this.connection = null;
    this.peer = null;

    useConnectionStore.getState().setDataChannelReady(false);
  }

  getChannel(): RTCDataChannel | null {
    return this.channel;
  }

  setMessageHandler(handler: ChannelMessageHandler | null): void {
    this.messageHandler = handler;
  }

  private onSignalDescription = (description: Parameters<PeerConnection['acceptDescription']>[0]) => {
    void this.connection?.acceptDescription(description);
  };

  private onSignalCandidate = (candidate: Parameters<PeerConnection['acceptCandidate']>[0]) => {
    void this.connection?.acceptCandidate(candidate);
  };

  private attachChannel(channel: RTCDataChannel): void {
    channel.binaryType = 'arraybuffer';
    this.channel = channel;

    channel.onopen = () => {
      useConnectionStore.getState().setDataChannelReady(true);
      this.startQualityPolling();
    };
    channel.onclose = () => useConnectionStore.getState().setDataChannelReady(false);
    channel.onmessage = (event: MessageEvent<ArrayBuffer | string>) =>
      this.messageHandler?.(event.data);
  }

  private handleConnectionState(state: RTCPeerConnectionState): void {
    if (!this.peer) return;
    const { setPeerQuality } = useConnectionStore.getState();

    if (state === 'connected') {
      this.iceRestarted = false;
      void this.sampleQuality();
    } else if (state === 'disconnected') {
      setPeerQuality(this.peer.id, 'poor');
    } else if (state === 'failed') {
      setPeerQuality(this.peer.id, 'poor');
      // One automatic ICE restart before giving up on the link.
      if (!this.iceRestarted) {
        this.iceRestarted = true;
        this.connection?.restartIce();
      }
    }
  }

  private startQualityPolling(): void {
    if (this.qualityTimer) return;
    this.qualityTimer = setInterval(() => void this.sampleQuality(), QUALITY_POLL_MS);
  }

  private async sampleQuality(): Promise<void> {
    if (!this.connection || !this.peer) return;
    const rtt = await this.connection.sampleRoundTripMs();
    useConnectionStore.getState().setPeerQuality(this.peer.id, qualityFromRtt(rtt));
  }
}

export const peerSession = new PeerSession();

if (import.meta.env.DEV) {
  const devWindow = window as unknown as {
    __slipPeer?: () => unknown;
    __slipWebrtcSelfTest?: () => Promise<unknown>;
  };

  devWindow.__slipPeer = () => ({
    channelState: peerSession.getChannel()?.readyState ?? 'none',
    dataChannelReady: useConnectionStore.getState().dataChannelReady,
    peers: useConnectionStore.getState().peers.map((p) => ({ name: p.name, quality: p.quality })),
  });

  // Loopback test: wires two PeerConnection instances directly to each other
  // to verify the full handshake, data channel, and stats in one page.
  devWindow.__slipWebrtcSelfTest = () =>
    new Promise((resolve) => {
      const state = { aOpen: false, bOpen: false, received: '' as string, rtt: null as number | null };
      let chanA: RTCDataChannel | null = null;

      const finish = async () => {
        if (!state.aOpen || !state.bOpen || !chanA) return;
        chanA.send('hello-from-A');
        setTimeout(async () => {
          state.rtt = await a.sampleRoundTripMs();
          a.close();
          b.close();
          resolve(state);
        }, 200);
      };

      const a: PeerConnection = new PeerConnection(
        {
          sendDescription: (d) => void b.acceptDescription(d),
          sendCandidate: (c) => void b.acceptCandidate(c),
          onDataChannel: (ch) => {
            chanA = ch;
            ch.onopen = () => {
              state.aOpen = true;
              void finish();
            };
          },
          onConnectionStateChange: () => {},
        },
        { polite: false, initiator: true },
      );

      const b: PeerConnection = new PeerConnection(
        {
          sendDescription: (d) => void a.acceptDescription(d),
          sendCandidate: (c) => void a.acceptCandidate(c),
          onDataChannel: (ch) => {
            ch.onopen = () => {
              state.bOpen = true;
              void finish();
            };
            ch.onmessage = (e: MessageEvent<string>) => {
              state.received = e.data;
            };
          },
          onConnectionStateChange: () => {},
        },
        { polite: true, initiator: false },
      );
    });
}
