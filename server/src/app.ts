import cors from 'cors';
import express, { type Express } from 'express';

export function createApp(corsOrigins: string[]): Express {
  const app = express();

  app.use(cors({ origin: corsOrigins }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  return app;
}
