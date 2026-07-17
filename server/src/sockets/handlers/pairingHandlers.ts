import { logger } from '../../utils/logger';
import type { RoomRegistry } from '../../modules/pairing/roomRegistry';
import type { RateLimiter } from '../../utils/rateLimiter';
import { sanitizeDevice } from '../../utils/validation';
import type { SlipSocket } from '../types';

/** Wires pairing lifecycle events for a single socket. */
export function registerPairingHandlers(
  socket: SlipSocket,
  registry: RoomRegistry,
  createLimiter: RateLimiter,
  joinLimiter: RateLimiter,
): void {
  socket.on('pair:create', (device, ack) => {
    // Rate-limited requests are silently dropped rather than acked — the
    // client's emitWithAck times out cleanly, and a legitimate user never
    // gets close to this limit (it exists to blunt automated room-flooding).
    if (!createLimiter.allow(socket.id)) return;

    const safeDevice = sanitizeDevice(device);
    socket.data.device = safeDevice;
    const room = registry.createRoom({ socketId: socket.id, device: safeDevice });
    socket.join(room.code);
    socket.data.roomCode = room.code;
    logger.info(`room ${room.code} created by ${safeDevice.name} (${socket.id})`);
    ack({ code: room.code, expiresAt: room.expiresAt });
  });

  socket.on('pair:join', ({ code, device }, ack) => {
    // Capped low and per-socket — closes off brute-forcing the 6-digit code
    // space, since a real user never needs more than a couple of retries.
    if (!joinLimiter.allow(socket.id)) {
      ack({ ok: false, error: 'not-found' });
      return;
    }

    const safeDevice = sanitizeDevice(device);
    socket.data.device = safeDevice;
    const outcome = registry.joinRoom(code, { socketId: socket.id, device: safeDevice });

    if (!outcome.ok) {
      logger.info(`join ${code} by ${safeDevice.name} rejected: ${outcome.error}`);
      ack({ ok: false, error: outcome.error });
      return;
    }

    socket.join(code);
    socket.data.roomCode = code;
    // Tell the host a peer arrived; hand the joiner the host's identity.
    socket.to(code).emit('peer:joined', safeDevice);
    logger.info(`${safeDevice.name} joined room ${code} (host ${outcome.host.device.name})`);
    ack({ ok: true, peer: outcome.host.device });
  });

  socket.on('pair:leave', () => {
    leaveRoom(socket, registry);
  });
}

/** Removes a socket from its room and notifies the remaining peer. */
export function leaveRoom(socket: SlipSocket, registry: RoomRegistry): void {
  const result = registry.removeSocket(socket.id);
  if (!result) return;
  const { room, peer } = result;
  if (peer && socket.data.device) {
    socket.to(room.code).emit('peer:left', socket.data.device.id);
  }
  socket.leave(room.code);
  socket.data.roomCode = undefined;
}
