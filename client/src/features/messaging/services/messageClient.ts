import type { MessageSendResult } from '@slip/shared';
import { emitWithAck } from '@/services/socket/socketClient';

/** Sends a text message; only succeeds if the recipient is currently online — nothing is ever stored server-side. */
export function sendMessage(toUsername: string, text: string): Promise<MessageSendResult> {
  return emitWithAck<MessageSendResult>('message:send', { toUsername, text });
}
