type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function write(level: LogLevel, message: string, ...meta: unknown[]): void {
  const line = `[${new Date().toISOString()}] ${level.toUpperCase().padEnd(5)} ${message}`;
  switch (level) {
    case 'error':
      console.error(line, ...meta);
      break;
    case 'warn':
      console.warn(line, ...meta);
      break;
    default:
      console.log(line, ...meta);
  }
}

export const logger = {
  debug: (message: string, ...meta: unknown[]) => write('debug', message, ...meta),
  info: (message: string, ...meta: unknown[]) => write('info', message, ...meta),
  warn: (message: string, ...meta: unknown[]) => write('warn', message, ...meta),
  error: (message: string, ...meta: unknown[]) => write('error', message, ...meta),
};
