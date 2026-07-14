import type { TransferControlMessage } from '@slip/shared';
import { useActiveTransfersStore } from '../store/activeTransfersStore';
import { handleIncomingChunk, handleReceiverControl, resetReceiveEngine } from './receiveEngine';
import { handleSenderControl, resetSendEngine } from './sendEngine';
import { resetCancelRegistry } from './cancelRegistry';

/**
 * Single entry point for every message on the transfer data channel. Control
 * messages (JSON strings) are routed to both engines — each only reacts to
 * the kinds relevant to its role (send vs. receive) and no-ops otherwise,
 * since a fileId only ever belongs to one direction. Binary messages are
 * always chunk data for the file currently being received.
 */
export function handleChannelMessage(channel: RTCDataChannel, data: ArrayBuffer | string): void {
  if (typeof data === 'string') {
    let message: TransferControlMessage;
    try {
      message = JSON.parse(data) as TransferControlMessage;
    } catch {
      return;
    }
    handleSenderControl(channel, message);
    handleReceiverControl(channel, message);
  } else {
    handleIncomingChunk(data);
  }
}

/** Called when the peer link drops — fails in-flight transfers and clears engine state. */
export function resetTransferSession(reason: string): void {
  useActiveTransfersStore.getState().failAllInFlight(reason);
  resetSendEngine();
  resetReceiveEngine();
  resetCancelRegistry();
}
