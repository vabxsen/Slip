import type { DeviceInfo } from './device';

/** Public-facing profile shown when someone looks up a username — never includes email. */
export interface PublicProfile {
  username: string;
  displayName: string | null;
  photoURL: string | null;
}

export type ConnectRequestResult =
  | { ok: true; requestId: string }
  /** 'not-found' is a rare defensive fallback — the client resolves the
   *  username via Firestore before ever calling connect:request, so by the
   *  time the server sees it the account is already known to exist. */
  | { ok: false; reason: 'offline' | 'not-found' | 'not-registered' };

export interface ConnectIncomingPayload {
  requestId: string;
  fromDevice: DeviceInfo;
  fromUsername: string;
  fromDisplayName: string | null;
}

export interface ConnectAcceptedPayload {
  requestId: string;
  peer: DeviceInfo;
}

export interface ConnectDeclinedPayload {
  requestId: string;
}

export interface PresenceRegisterPayload {
  idToken: string;
  username: string;
  displayName: string | null;
}
