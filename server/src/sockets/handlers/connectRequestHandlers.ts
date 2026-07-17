import { randomUUID } from 'node:crypto';
import type { DeviceInfo } from '@slip/shared';
import type { RoomRegistry } from '../../modules/pairing/roomRegistry';
import type { PresenceRegistry } from '../../modules/presence/presenceRegistry';
import { logger } from '../../utils/logger';
import type { RateLimiter } from '../../utils/rateLimiter';
import { sanitizeDevice } from '../../utils/validation';
import type { SlipSocket, SlipSocketServer } from '../types';

const REQUEST_TTL_MS = 30_000;

interface PendingRequest {
  fromSocketId: string;
  fromDevice: DeviceInfo;
  toSocketId: string;
  timeout: NodeJS.Timeout;
}

// Module-scoped: a request raised by one socket must be resolvable by a
// different socket's `connect:respond` handler, so this can't live on
// either individual connection's closure.
const pendingRequests = new Map<string, PendingRequest>();

/**
 * Relays a "send to username" connection request between two online
 * sockets, then — on accept — pairs them through the same RoomRegistry the
 * QR/code pairing flow uses, so the existing signal relay and file-transfer
 * stack need zero changes to handle a username-initiated connection.
 */
export function registerConnectRequestHandlers(
  socket: SlipSocket,
  io: SlipSocketServer,
  registry: RoomRegistry,
  presence: PresenceRegistry,
  limiter: RateLimiter,
): void {
  socket.on('connect:request', ({ toUsername, fromDevice }, ack) => {
    if (!socket.data.username) {
      ack({ ok: false, reason: 'not-registered' });
      return;
    }
    if (!limiter.allow(socket.id)) {
      ack({ ok: false, reason: 'offline' });
      return;
    }
    if (toUsername === socket.data.username) {
      // Self-targeted requests can't be paired — createRoom/joinRoom with
      // the same socket ID on both sides empties then orphans the room.
      ack({ ok: false, reason: 'not-found' });
      return;
    }
    const targetSocketId = presence.getSocketId(toUsername);
    if (!targetSocketId) {
      ack({ ok: false, reason: 'offline' });
      return;
    }

    const safeFromDevice = sanitizeDevice(fromDevice);
    const requestId = randomUUID();
    const timeout = setTimeout(() => pendingRequests.delete(requestId), REQUEST_TTL_MS);
    timeout.unref?.();
    pendingRequests.set(requestId, {
      fromSocketId: socket.id,
      fromDevice: safeFromDevice,
      toSocketId: targetSocketId,
      timeout,
    });

    io.to(targetSocketId).emit('connect:incoming', {
      requestId,
      fromDevice: safeFromDevice,
      fromUsername: socket.data.username,
      fromDisplayName: socket.data.displayName ?? null,
    });
    logger.info(`connect request ${requestId}: ${socket.data.username} -> ${toUsername}`);
    ack({ ok: true, requestId });
  });

  socket.on('connect:respond', ({ requestId, accept, device }) => {
    const pending = pendingRequests.get(requestId);
    if (!pending || pending.toSocketId !== socket.id) return;
    pendingRequests.delete(requestId);
    clearTimeout(pending.timeout);

    if (!accept) {
      io.to(pending.fromSocketId).emit('connect:declined', { requestId });
      return;
    }

    const safeDevice = sanitizeDevice(device);
    const room = registry.createRoom({ socketId: socket.id, device: safeDevice });
    socket.join(room.code);
    socket.data.roomCode = room.code;

    const requesterSocket = io.sockets.sockets.get(pending.fromSocketId);
    const outcome = registry.joinRoom(room.code, {
      socketId: pending.fromSocketId,
      device: pending.fromDevice,
    });
    if (!requesterSocket || !outcome.ok) {
      // Requester vanished before we could pair them — tear the room back down.
      registry.removeSocket(socket.id);
      socket.leave(room.code);
      socket.data.roomCode = undefined;
      return;
    }
    requesterSocket.join(room.code);
    requesterSocket.data.roomCode = room.code;

    io.to(pending.fromSocketId).emit('connect:accepted', { requestId, peer: safeDevice });
    // Direct to the accepter's own socket (not a room broadcast, which would
    // exclude the sender) — this reuses the exact same event the pair-code
    // flow's host side already listens for, so onPeerJoined's existing
    // responder-start/toast/notification logic fires unmodified.
    socket.emit('peer:joined', pending.fromDevice);
    logger.info(`connect request ${requestId} accepted, room ${room.code}`);
  });
}
