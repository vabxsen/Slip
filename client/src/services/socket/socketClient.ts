import type { ClientToServerEvents, ServerToClientEvents } from '@slip/shared';
import { io, type Socket } from 'socket.io-client';
import { SERVER_URL } from '@/utils/env';

export type SlipClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: SlipClientSocket | null = null;

/** Lazily-created singleton socket. Connection is opened via `connectSocket`. */
export function getSocket(): SlipClientSocket {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      // Default transport order (polling → websocket upgrade) is the most
      // resilient behind dev proxies and when a tab is backgrounded.
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
    });
  }
  return socket;
}

export function connectSocket(): SlipClientSocket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

/**
 * Promise-based emit for events that carry a server ack. Rejects if the
 * socket never acknowledges within `timeoutMs`.
 */
export function emitWithAck<TResult>(
  event: keyof ClientToServerEvents,
  payload: unknown,
  timeoutMs = 8000,
): Promise<TResult> {
  const s = connectSocket();
  return new Promise<TResult>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`"${event}" timed out`)), timeoutMs);
    const done = (result: TResult) => {
      clearTimeout(timer);
      resolve(result);
    };
    // socket.io preserves the trailing ack callback across our typed maps.
    (s.emit as (e: string, p: unknown, ack: (r: TResult) => void) => void)(event, payload, done);
  });
}
