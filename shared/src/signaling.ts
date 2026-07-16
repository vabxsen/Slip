import type { DeviceInfo } from './device';
import type { MessageReceivedPayload, MessageSendResult } from './messaging';
import type { PairCreateResult, PairJoinResult } from './pairing';
import type {
  ConnectAcceptedPayload,
  ConnectDeclinedPayload,
  ConnectIncomingPayload,
  ConnectRequestResult,
  PresenceRegisterPayload,
} from './presence';

/** Serializable session description exchanged during the WebRTC handshake. */
export interface RtcDescriptionPayload {
  type: 'offer' | 'answer';
  sdp: string;
}

/** Serializable ICE candidate exchanged during the WebRTC handshake. */
export interface RtcCandidatePayload {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
}

/**
 * Socket.IO event maps shared by client and server so both sides get
 * fully typed emitters and handlers. Expanded in later phases.
 */
export interface ClientToServerEvents {
  'pair:create': (device: DeviceInfo, ack: (result: PairCreateResult) => void) => void;
  'pair:join': (
    payload: { code: string; device: DeviceInfo },
    ack: (result: PairJoinResult) => void,
  ) => void;
  'pair:leave': () => void;
  'signal:description': (payload: RtcDescriptionPayload) => void;
  'signal:candidate': (payload: RtcCandidatePayload) => void;
  'presence:register': (payload: PresenceRegisterPayload, ack: (ok: boolean) => void) => void;
  'connect:request': (
    payload: { toUsername: string; fromDevice: DeviceInfo },
    ack: (result: ConnectRequestResult) => void,
  ) => void;
  'connect:respond': (payload: { requestId: string; accept: boolean; device: DeviceInfo }) => void;
  'message:send': (
    payload: { toUsername: string; text: string },
    ack: (result: MessageSendResult) => void,
  ) => void;
}

export interface ServerToClientEvents {
  'peer:joined': (peer: DeviceInfo) => void;
  'peer:left': (peerId: string) => void;
  'signal:description': (payload: RtcDescriptionPayload) => void;
  'signal:candidate': (payload: RtcCandidatePayload) => void;
  'connect:incoming': (payload: ConnectIncomingPayload) => void;
  'connect:accepted': (payload: ConnectAcceptedPayload) => void;
  'connect:declined': (payload: ConnectDeclinedPayload) => void;
  'message:receive': (payload: MessageReceivedPayload) => void;
}

/** Per-socket state kept on the server. */
export interface SocketData {
  device?: DeviceInfo;
  roomCode?: string;
  uid?: string;
  username?: string;
  displayName?: string | null;
}
