import type { PresenceRegistry } from '../../modules/presence/presenceRegistry';
import type { RateLimiter } from '../../utils/rateLimiter';
import { isValidMessageText } from '../../utils/validation';
import type { SlipSocket, SlipSocketServer } from '../types';

/**
 * Pure relay for lightweight text messages — no accept/decline handshake,
 * no storage anywhere. Delivery only succeeds while the recipient is
 * currently online, matching the app's "no persistent history" design.
 */
export function registerMessageHandlers(
  socket: SlipSocket,
  io: SlipSocketServer,
  presence: PresenceRegistry,
  limiter: RateLimiter,
): void {
  socket.on('message:send', ({ toUsername, text }, ack) => {
    if (!socket.data.username) {
      ack({ ok: false, reason: 'not-registered' });
      return;
    }
    if (!limiter.allow(socket.id) || !isValidMessageText(text)) {
      ack({ ok: false, reason: 'invalid' });
      return;
    }
    const targetSocketId = presence.getSocketId(toUsername);
    if (!targetSocketId) {
      ack({ ok: false, reason: 'offline' });
      return;
    }
    io.to(targetSocketId).emit('message:receive', {
      fromUsername: socket.data.username,
      fromDisplayName: socket.data.displayName ?? null,
      text,
      timestamp: Date.now(),
    });
    ack({ ok: true });
  });
}
