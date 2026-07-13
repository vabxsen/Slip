import { logger } from '../../utils/logger';
import type { RoomRegistry } from '../../modules/pairing/roomRegistry';
import type { SlipSocket } from '../types';

/** Wires pairing lifecycle events for a single socket. */
export function registerPairingHandlers(socket: SlipSocket, registry: RoomRegistry): void {
  socket.on('pair:create', (device, ack) => {
    socket.data.device = device;
    const room = registry.createRoom({ socketId: socket.id, device });
    socket.join(room.code);
    socket.data.roomCode = room.code;
    logger.info(`room ${room.code} created by ${device.name} (${socket.id})`);
    ack({ code: room.code, expiresAt: room.expiresAt });
  });

  socket.on('pair:join', ({ code, device }, ack) => {
    socket.data.device = device;
    const outcome = registry.joinRoom(code, { socketId: socket.id, device });

    if (!outcome.ok) {
      logger.info(`join ${code} by ${device.name} rejected: ${outcome.error}`);
      ack({ ok: false, error: outcome.error });
      return;
    }

    socket.join(code);
    socket.data.roomCode = code;
    // Tell the host a peer arrived; hand the joiner the host's identity.
    socket.to(code).emit('peer:joined', device);
    logger.info(`${device.name} joined room ${code} (host ${outcome.host.device.name})`);
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
