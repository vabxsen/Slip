import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { ROOM_SWEEP_INTERVAL_MS } from '../config/constants';
import { RoomRegistry } from '../modules/pairing/roomRegistry';
import { logger } from '../utils/logger';
import { leaveRoom, registerPairingHandlers } from './handlers/pairingHandlers';
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
  const sweep = setInterval(() => registry.sweep(), ROOM_SWEEP_INTERVAL_MS);
  sweep.unref?.();

  io.on('connection', (socket) => {
    logger.info(`socket connected: ${socket.id}`);

    registerPairingHandlers(socket, registry);
    registerSignalingHandlers(socket, registry);

    socket.on('disconnect', (reason) => {
      leaveRoom(socket, registry);
      logger.info(`socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}
