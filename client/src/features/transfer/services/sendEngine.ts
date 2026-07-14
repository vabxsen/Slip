import type { BatchOfferMessage, FileMeta, TransferControlMessage } from '@slip/shared';
import { showToast } from '@/store/toastStore';
import { readFileChunks, waitForDrain } from '../protocol/chunking';
import { useActiveTransfersStore } from '../store/activeTransfersStore';
import type { StagedFile } from '../store/transferStore';
import { clearCancelled, isCancelled, markCancelled } from './cancelRegistry';

interface PendingBatch {
  resolve: (accepted: boolean) => void;
}

const BATCH_RESPONSE_TIMEOUT_MS = 30_000;
const PROGRESS_TICK_MS = 120;

const pendingBatches = new Map<string, PendingBatch>();
const retainedFiles = new Map<string, File>();

function sendControl(channel: RTCDataChannel, message: TransferControlMessage): void {
  channel.send(JSON.stringify(message));
}

/** Offers a batch to the peer, then streams each accepted file sequentially. */
export async function sendStagedBatch(
  channel: RTCDataChannel,
  staged: StagedFile[],
  peerName: string,
): Promise<void> {
  if (staged.length === 0) return;
  if (channel.readyState !== 'open') {
    showToast('No connected device to send to', 'error');
    return;
  }

  const batchId = crypto.randomUUID();
  const files: FileMeta[] = [];
  const { upsert } = useActiveTransfersStore.getState();
  const now = Date.now();

  for (const { id, file, relativePath } of staged) {
    retainedFiles.set(id, file);
    const meta: FileMeta = { id, name: file.name, size: file.size, mimeType: file.type || 'application/octet-stream', relativePath };
    files.push(meta);
    upsert({
      id,
      batchId,
      direction: 'send',
      status: 'pending',
      name: meta.name,
      size: meta.size,
      mimeType: meta.mimeType,
      bytesTransferred: 0,
      speedBps: 0,
      peerName,
      startedAt: now,
    });
  }

  sendControl(channel, { kind: 'batch-offer', batchId, files } satisfies BatchOfferMessage);

  const accepted = await new Promise<boolean>((resolve) => {
    pendingBatches.set(batchId, { resolve });
    setTimeout(() => {
      if (pendingBatches.delete(batchId)) resolve(false);
    }, BATCH_RESPONSE_TIMEOUT_MS);
  });

  if (!accepted) {
    const { patch } = useActiveTransfersStore.getState();
    for (const meta of files) patch(meta.id, { status: 'failed', errorMessage: 'Declined or timed out' });
    showToast(`${peerName} declined the transfer`, 'warning');
    return;
  }

  for (const meta of files) {
    if (isCancelled(meta.id)) continue;
    const file = retainedFiles.get(meta.id);
    if (!file) continue;
    await sendSingleFile(channel, batchId, meta.id, file);
  }
}

/** Streams one file's chunks with backpressure, honoring cancellation mid-flight. */
export async function sendSingleFile(
  channel: RTCDataChannel,
  batchId: string,
  fileId: string,
  file: File,
): Promise<void> {
  const { patch } = useActiveTransfersStore.getState();
  if (channel.readyState !== 'open') {
    patch(fileId, { status: 'failed', errorMessage: 'Connection lost' });
    return;
  }

  patch(fileId, { status: 'transferring', bytesTransferred: 0, speedBps: 0, errorMessage: undefined });
  sendControl(channel, { kind: 'file-start', batchId, fileId });

  let sent = 0;
  let lastTick = Date.now();
  let lastBytes = 0;
  let speed = 0;

  for await (const chunk of readFileChunks(file)) {
    if (isCancelled(fileId) || channel.readyState !== 'open') {
      patch(fileId, { status: 'cancelled' });
      if (channel.readyState === 'open') sendControl(channel, { kind: 'cancel', batchId, fileId });
      return;
    }

    await waitForDrain(channel);
    channel.send(chunk);
    sent += chunk.byteLength;

    const now = Date.now();
    if (now - lastTick >= PROGRESS_TICK_MS || sent === file.size) {
      const elapsedSeconds = Math.max((now - lastTick) / 1000, 0.001);
      const instant = (sent - lastBytes) / elapsedSeconds;
      speed = speed === 0 ? instant : speed * 0.7 + instant * 0.3;
      patch(fileId, { bytesTransferred: sent, speedBps: speed });
      lastTick = now;
      lastBytes = sent;
    }
  }

  sendControl(channel, { kind: 'file-end', batchId, fileId });
  patch(fileId, { status: 'completed', bytesTransferred: file.size, speedBps: 0, completedAt: Date.now() });
}

/** Reacts to control messages relevant to transfers *we* are sending. */
export function handleSenderControl(channel: RTCDataChannel, message: TransferControlMessage): void {
  const { patch } = useActiveTransfersStore.getState();

  if (message.kind === 'batch-accept') {
    pendingBatches.get(message.batchId)?.resolve(true);
    pendingBatches.delete(message.batchId);
  } else if (message.kind === 'batch-decline') {
    pendingBatches.get(message.batchId)?.resolve(false);
    pendingBatches.delete(message.batchId);
  } else if (message.kind === 'cancel') {
    if (retainedFiles.has(message.fileId)) {
      markCancelled(message.fileId);
      patch(message.fileId, { status: 'cancelled' });
    }
  } else if (message.kind === 'resend-request') {
    const file = retainedFiles.get(message.fileId);
    if (file) {
      clearCancelled(message.fileId);
      void sendSingleFile(channel, message.batchId, message.fileId, file);
    } else {
      sendControl(channel, {
        kind: 'error',
        batchId: message.batchId,
        fileId: message.fileId,
        message: 'Sender no longer has this file',
      });
    }
  }
}

export function cancelSendTransfer(channel: RTCDataChannel, fileId: string, batchId: string): void {
  markCancelled(fileId);
  useActiveTransfersStore.getState().patch(fileId, { status: 'cancelled' });
  if (channel.readyState === 'open') sendControl(channel, { kind: 'cancel', batchId, fileId });
}

export function retrySendTransfer(channel: RTCDataChannel, fileId: string): void {
  const record = useActiveTransfersStore.getState().records[fileId];
  const file = retainedFiles.get(fileId);
  if (!record || !file) {
    showToast('This file is no longer available to resend', 'error');
    return;
  }
  clearCancelled(fileId);
  void sendSingleFile(channel, record.batchId, fileId, file);
}

export function resetSendEngine(): void {
  pendingBatches.clear();
  retainedFiles.clear();
}
