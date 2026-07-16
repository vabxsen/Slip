import type { ConnectRequestResult, DeviceInfo } from '@slip/shared';
import { connectSocket, emitWithAck } from '@/services/socket/socketClient';

/** Asks the server to relay a connection request to `toUsername`, if they're currently online. */
export function requestConnect(toUsername: string, fromDevice: DeviceInfo): Promise<ConnectRequestResult> {
  return emitWithAck<ConnectRequestResult>('connect:request', { toUsername, fromDevice });
}

/** Accepts or declines an incoming connection request. Fire-and-forget — outcome (if accepted) arrives via connect:accepted/peer:joined. */
export function respondToConnect(requestId: string, accept: boolean, device: DeviceInfo): void {
  connectSocket().emit('connect:respond', { requestId, accept, device });
}
