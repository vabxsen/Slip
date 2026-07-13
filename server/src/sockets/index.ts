import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, SocketData } from '@slip/shared';
import { logger } from '../utils/logger';

export type SlipSocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

export function createSocketServer(httpServer: HttpServer, corsOrigins: string[]): SlipSocketServer {
  const io: SlipSocketServer = new Server(httpServer, {
    cors: { origin: corsOrigins },
  });

  io.on('connection', (socket) => {
    logger.info(`socket connected: ${socket.id}`);

    // Pairing and signaling handlers are registered here in later phases.

    socket.on('disconnect', (reason) => {
      logger.info(`socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}
