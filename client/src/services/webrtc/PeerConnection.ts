import type { RtcCandidatePayload, RtcDescriptionPayload } from '@slip/shared';
import { DATA_CHANNEL_LABEL, ICE_SERVERS } from './iceServers';

export interface PeerConnectionCallbacks {
  sendDescription: (description: RtcDescriptionPayload) => void;
  sendCandidate: (candidate: RtcCandidatePayload) => void;
  onDataChannel: (channel: RTCDataChannel) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
}

/**
 * Thin wrapper around RTCPeerConnection implementing the WebRTC "perfect
 * negotiation" pattern, so either side can (re)negotiate without glare. The
 * initiator opens the data channel (which drives the first offer); the
 * responder receives it via `ondatachannel`.
 */
export class PeerConnection {
  private readonly pc: RTCPeerConnection;
  private readonly polite: boolean;

  private makingOffer = false;
  private ignoreOffer = false;
  private isSettingRemoteAnswerPending = false;

  constructor(
    private readonly callbacks: PeerConnectionCallbacks,
    options: { polite: boolean; initiator: boolean },
  ) {
    this.polite = options.polite;
    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    this.pc.onnegotiationneeded = async () => {
      try {
        this.makingOffer = true;
        await this.pc.setLocalDescription();
        const { localDescription } = this.pc;
        if (localDescription) this.emitDescription(localDescription);
      } catch (error) {
        console.error('[webrtc] negotiation failed', error);
      } finally {
        this.makingOffer = false;
      }
    };

    this.pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        this.callbacks.sendCandidate({
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex,
        });
      }
    };

    this.pc.onconnectionstatechange = () => {
      this.callbacks.onConnectionStateChange(this.pc.connectionState);
    };

    this.pc.ondatachannel = (event) => this.callbacks.onDataChannel(event.channel);

    if (options.initiator) {
      const channel = this.pc.createDataChannel(DATA_CHANNEL_LABEL, { ordered: true });
      this.callbacks.onDataChannel(channel);
    }
  }

  private emitDescription(description: RTCSessionDescription): void {
    if (description.type === 'offer' || description.type === 'answer') {
      this.callbacks.sendDescription({ type: description.type, sdp: description.sdp });
    }
  }

  /** Applies a remote offer/answer, replying with an answer when needed. */
  async acceptDescription(description: RtcDescriptionPayload): Promise<void> {
    const readyForOffer =
      !this.makingOffer &&
      (this.pc.signalingState === 'stable' || this.isSettingRemoteAnswerPending);
    const offerCollision = description.type === 'offer' && !readyForOffer;

    this.ignoreOffer = !this.polite && offerCollision;
    if (this.ignoreOffer) return;

    this.isSettingRemoteAnswerPending = description.type === 'answer';
    await this.pc.setRemoteDescription(description);
    this.isSettingRemoteAnswerPending = false;

    if (description.type === 'offer') {
      await this.pc.setLocalDescription();
      const { localDescription } = this.pc;
      if (localDescription) this.emitDescription(localDescription);
    }
  }

  async acceptCandidate(candidate: RtcCandidatePayload): Promise<void> {
    try {
      await this.pc.addIceCandidate(candidate);
    } catch (error) {
      // Candidates racing an ignored offer are expected; anything else isn't.
      if (!this.ignoreOffer) console.error('[webrtc] addIceCandidate failed', error);
    }
  }

  /** Forces fresh ICE gathering after a connection failure. */
  restartIce(): void {
    this.pc.restartIce();
  }

  /** Samples the negotiated candidate pair's round-trip time, in ms. */
  async sampleRoundTripMs(): Promise<number | null> {
    const stats = await this.pc.getStats();
    let rttMs: number | null = null;
    stats.forEach((report) => {
      if (
        report.type === 'candidate-pair' &&
        report.state === 'succeeded' &&
        typeof report.currentRoundTripTime === 'number'
      ) {
        rttMs = report.currentRoundTripTime * 1000;
      }
    });
    return rttMs;
  }

  get connectionState(): RTCPeerConnectionState {
    return this.pc.connectionState;
  }

  close(): void {
    this.pc.onnegotiationneeded = null;
    this.pc.onicecandidate = null;
    this.pc.onconnectionstatechange = null;
    this.pc.ondatachannel = null;
    this.pc.close();
  }
}
