import type { DeviceInfo, PairCreateResult, PairJoinResult } from '@slip/shared';
import { emitWithAck } from '@/services/socket/socketClient';

/** Registers this device as a pairing host and returns its code + expiry. */
export function createRoom(device: DeviceInfo): Promise<PairCreateResult> {
  return emitWithAck<PairCreateResult>('pair:create', device);
}

/** Attempts to join the room named by `code`, presenting this device. */
export function joinRoom(code: string, device: DeviceInfo): Promise<PairJoinResult> {
  return emitWithAck<PairJoinResult>('pair:join', { code, device });
}
