import { getAdminAuth } from '../../config/firebaseAdmin';
import type { PresenceRegistry } from '../../modules/presence/presenceRegistry';
import { logger } from '../../utils/logger';
import type { SlipSocket } from '../types';

/**
 * Verifies a client's Firebase ID token and, only on success, records this
 * socket as representing that username for the rest of its connection.
 * Never disconnects on failure — pairing/transfer must keep working even if
 * a client isn't signed in or presence registration otherwise fails.
 */
export function registerPresenceHandlers(socket: SlipSocket, presence: PresenceRegistry): void {
  socket.on('presence:register', (payload, ack) => {
    void getAdminAuth()
      .verifyIdToken(payload.idToken)
      .then((decoded) => {
        socket.data.uid = decoded.uid;
        socket.data.username = payload.username;
        socket.data.displayName = payload.displayName;
        presence.register(payload.username, socket.id);
        logger.info(`presence registered: ${payload.username} (${socket.id})`);
        ack(true);
      })
      .catch((error: unknown) => {
        logger.info(`presence:register failed: ${error instanceof Error ? error.message : 'unknown error'}`);
        ack(false);
      });
  });
}
