import { createServer } from 'node:http';
import { createApp } from './app';
import { config } from './config/env';
import { createSocketServer } from './sockets';
import { logger } from './utils/logger';

const app = createApp(config.corsOrigins);
const httpServer = createServer(app);

createSocketServer(httpServer, config.corsOrigins);

httpServer.listen(config.port, () => {
  logger.info(`Slip signaling server listening on http://localhost:${config.port}`);
  logger.info(`allowed origins: ${config.corsOrigins.join(', ')}`);
});
