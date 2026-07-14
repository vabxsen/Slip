import { peerSession } from '@/services/webrtc/peerSession';
import { showToast } from '@/store/toastStore';
import type { StagedFile } from '../store/transferStore';
import { useActiveTransfersStore } from '../store/activeTransfersStore';
import { acceptIncomingBatch, cancelReceiveTransfer, declineIncomingBatch, retryReceiveTransfer } from './receiveEngine';
import { cancelSendTransfer, retrySendTransfer, sendStagedBatch } from './sendEngine';

/**
 * Thin, RTCDataChannel-free API for components. Every function here resolves
 * the live channel from `peerSession` so UI code never touches WebRTC types.
 */

function requireOpenChannel(): RTCDataChannel | null {
  const channel = peerSession.getChannel();
  if (!channel || channel.readyState !== 'open') {
    showToast('No connected device', 'error');
    return null;
  }
  return channel;
}

export function sendFiles(staged: StagedFile[], peerName: string): void {
  const channel = requireOpenChannel();
  if (!channel) return;
  void sendStagedBatch(channel, staged, peerName);
}

export function cancelTransfer(id: string): void {
  const record = useActiveTransfersStore.getState().records[id];
  const channel = peerSession.getChannel();
  if (!record || !channel) return;
  if (record.direction === 'send') cancelSendTransfer(channel, id, record.batchId);
  else cancelReceiveTransfer(channel, id, record.batchId);
}

export function retryTransfer(id: string): void {
  const record = useActiveTransfersStore.getState().records[id];
  if (!record) return;
  const channel = requireOpenChannel();
  if (!channel) return;
  if (record.direction === 'send') retrySendTransfer(channel, id);
  else retryReceiveTransfer(channel, id);
}

export function acceptIncoming(useFolder: boolean): void {
  const channel = requireOpenChannel();
  if (!channel) return;
  void acceptIncomingBatch(channel, useFolder);
}

export function declineIncoming(): void {
  const channel = peerSession.getChannel();
  if (!channel) return;
  declineIncomingBatch(channel);
}
