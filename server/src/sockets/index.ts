import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { ROOM_SWEEP_INTERVAL_MS } from '../config/constants';
import { RoomRegistry } from '../modules/pairing/roomRegistry';
import { PresenceRegistry } from '../modules/presence/presenceRegistry';
import { logger } from '../utils/logger';
import { RateLimiter } from '../utils/rateLimiter';
import { registerConnectRequestHandlers } from './handlers/connectRequestHandlers';
import { leaveRoom, registerPairingHandlers } from './handlers/pairingHandlers';
import { registerMessageHandlers } from './handlers/messageHandlers';
import { registerPresenceHandlers } from './handlers/presenceHandlers';
import { registerSignalingHandlers } from './handlers/signalingHandlers';
import type { SlipSocketServer } from './types';

export type { SlipSocketServer } from './types';

export function createSocketServer(httpServer: HttpServer, corsOrigins: string[]): SlipSocketServer {
  const io: SlipSocketServer = new Server(httpServer, {
    cors: { origin: corsOrigins },
    // Tolerate brief network hiccups and background-tab timer throttling
    // before declaring a client gone.
    pingTimeout: 30_000,
  });

  const registry = new RoomRegistry();
  const presence = new PresenceRegistry();
  const sweep = setInterval(() => registry.sweep(), ROOM_SWEEP_INTERVAL_MS);
  sweep.unref?.();

  // Per-socket sliding-window limits — generous enough that no legitimate
  // use ever gets close, tight enough to blunt automated room-flooding,
  // pair-code brute-forcing, and message/request spam.
  const pairCreateLimiter = new RateLimiter(10, 60_000);
  const pairJoinLimiter = new RateLimiter(8, 60_000);
  const presenceLimiter = new RateLimiter(10, 60_000);
  const connectRequestLimiter = new RateLimiter(10, 60_000);
  const messageLimiter = new RateLimiter(20, 60_000);
  const limiters = [pairCreateLimiter, pairJoinLimiter, presenceLimiter, connectRequestLimiter, messageLimiter];

  io.on('connection', (socket) => {
    logger.info(`socket connected: ${socket.id}`);

    registerPairingHandlers(socket, registry, pairCreateLimiter, pairJoinLimiter);
    registerSignalingHandlers(socket, registry);
    registerPresenceHandlers(socket, presence, presenceLimiter);
    registerConnectRequestHandlers(socket, io, registry, presence, connectRequestLimiter);
    registerMessageHandlers(socket, io, presence, messageLimiter);

    socket.on('disconnect', (reason) => {
      leaveRoom(socket, registry);
      presence.removeSocket(socket.id);
      for (const limiter of limiters) limiter.clear(socket.id);
      logger.info(`socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}
