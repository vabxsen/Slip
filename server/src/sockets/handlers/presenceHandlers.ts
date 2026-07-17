import { getAdminAuth, getAdminFirestore } from '../../config/firebaseAdmin';
import type { PresenceRegistry } from '../../modules/presence/presenceRegistry';
import { logger } from '../../utils/logger';
import type { RateLimiter } from '../../utils/rateLimiter';
import { isValidUsername } from '../../utils/validation';
import type { SlipSocket } from '../types';

/**
 * Verifies a client's Firebase ID token AND that the token's own uid is the
 * confirmed owner of the claimed username (via the `usernames/{name}`
 * uniqueness doc every claim goes through) before recording this socket as
 * representing that username. Without the ownership check, any signed-in
 * user could register presence as an arbitrary existing username and
 * silently receive that person's connect requests and messages.
 * Never disconnects on failure — pairing/transfer must keep working even if
 * a client isn't signed in or presence registration otherwise fails.
 */
export function registerPresenceHandlers(
  socket: SlipSocket,
  presence: PresenceRegistry,
  limiter: RateLimiter,
): void {
  socket.on('presence:register', (payload, ack) => {
    if (!limiter.allow(socket.id)) {
      ack(false);
      return;
    }
    if (!isValidUsername(payload.username)) {
      ack(false);
      return;
    }

    void getAdminAuth()
      .verifyIdToken(payload.idToken)
      .then(async (decoded) => {
        const usernameDoc = await getAdminFirestore()
          .collection('usernames')
          .doc(payload.username.toLowerCase())
          .get();
        const owner = usernameDoc.data() as { uid?: string } | undefined;
        if (owner?.uid !== decoded.uid) {
          logger.info(`presence:register rejected: ${decoded.uid} does not own username ${payload.username}`);
          ack(false);
          return;
        }

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
