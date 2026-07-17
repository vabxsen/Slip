export type MessageSendResult =
  | { ok: true }
  | { ok: false; reason: 'offline' | 'not-registered' | 'invalid' };

export interface MessageReceivedPayload {
  fromUsername: string;
  fromDisplayName: string | null;
  text: string;
  timestamp: number;
}
