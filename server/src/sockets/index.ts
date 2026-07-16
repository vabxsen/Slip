import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { ROOM_SWEEP_INTERVAL_MS } from '../config/constants';
import { RoomRegistry } from '../modules/pairing/roomRegistry';
import { PresenceRegistry } from '../modules/presence/presenceRegistry';
import { logger } from '../utils/logger';
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

  io.on('connection', (socket) => {
    logger.info(`socket connected: ${socket.id}`);

    registerPairingHandlers(socket, registry);
    registerSignalingHandlers(socket, registry);
    registerPresenceHandlers(socket, presence);
    registerConnectRequestHandlers(socket, io, registry, presence);
    registerMessageHandlers(socket, io, presence);

    socket.on('disconnect', (reason) => {
      leaveRoom(socket, registry);
      presence.removeSocket(socket.id);
      logger.info(`socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}
