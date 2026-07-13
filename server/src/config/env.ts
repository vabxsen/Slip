export interface ServerConfig {
  port: number;
  corsOrigins: string[];
  isProduction: boolean;
}

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed < 65536 ? parsed : fallback;
}

function parseOrigins(value: string | undefined): string[] {
  if (!value) return ['http://localhost:5173'];
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const config: ServerConfig = {
  port: parsePort(process.env.PORT, 3001),
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
  isProduction: process.env.NODE_ENV === 'production',
};
