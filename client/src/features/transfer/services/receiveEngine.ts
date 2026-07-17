import type { FileMeta, TransferControlMessage } from '@slip/shared';
import { notify } from '@/services/notifications/notifications';
import { playReceivedSound } from '@/services/sound/sound';
import { useConnectionStore } from '@/store/connectionStore';
import { useSettingsStore } from '@/store/settingsStore';
import { showToast } from '@/store/toastStore';
import { useActiveTransfersStore } from '../store/activeTransfersStore';
import { useIncomingRequestStore } from '../store/incomingRequestStore';
import { clearCancelled, markCancelled } from './cancelRegistry';
import { createFsaSink, createMemorySink, pickDirectoryHandle, type FileSink } from './sinks';

interface ActiveReceive {
  fileId: string;
  batchId: string;
  meta: FileMeta;
  /** Resolves once the sink is ready; writes chain off this to preserve order. */
  sinkPromise: Promise<FileSink>;
  writeQueue: Promise<void>;
  received: number;
  lastTick: number;
  lastBytes: number;
  speed: number;
}

const PROGRESS_TICK_MS = 120;

let currentReceive: ActiveReceive | null = null;
let currentDirHandle: FileSystemDirectoryHandle | null = null;
const acceptedFiles = new Map<string, FileMeta>();

function sendControl(channel: RTCDataChannel, message: TransferControlMessage): void {
  channel.send(JSON.stringify(message));
}

async function openSink(meta: FileMeta): Promise<FileSink> {
  if (currentDirHandle) {
    try {
      return await createFsaSink(currentDirHandle, meta.name, meta.relativePath);
    } catch (error) {
      console.error('[transfer] falling back to memory sink', error);
    }
  }
  return createMemorySink(meta.name, meta.mimeType);
}

/** Accepts the pending batch offer, optionally choosing a save folder first. */
export async function acceptIncomingBatch(channel: RTCDataChannel, tryUseFolder: boolean): Promise<void> {
  const request = useIncomingRequestStore.getState().request;
  if (!request) return;

  acceptedFiles.clear();
  request.files.forEach((f) => acceptedFiles.set(f.id, f));

  const { upsert } = useActiveTransfersStore.getState();
  const now = Date.now();
  request.files.forEach((f) => {
    upsert({
      id: f.id,
      batchId: request.batchId,
      direction: 'receive',
      status: 'pending',
      name: f.name,
      size: f.size,
      mimeType: f.mimeType,
      bytesTransferred: 0,
      speedBps: 0,
      peerName: request.peerName,
      startedAt: now,
    });
  });

  currentDirHandle = null;
  if (tryUseFolder) {
    currentDirHandle = await pickDirectoryHandle();
    if (!currentDirHandle) showToast('Saving files to your downloads', 'info');
  }

  useIncomingRequestStore.getState().clear();
  sendControl(channel, { kind: 'batch-accept', batchId: request.batchId });
}

export function declineIncomingBatch(channel: RTCDataChannel): void {
  const request = useIncomingRequestStore.getState().request;
  if (!request) return;
  sendControl(channel, { kind: 'batch-decline', batchId: request.batchId });
  useIncomingRequestStore.getState().clear();
}

/** Whether to offer the save-folder picker: user opted in and the browser supports it. */
export function shouldPromptForFolder(): boolean {
  return useSettingsStore.getState().downloadPreference === 'ask' && Boolean(window.showDirectoryPicker);
}

/** Reacts to control messages relevant to transfers *we* are receiving. */
export function handleReceiverControl(channel: RTCDataChannel, message: TransferControlMessage): void {
  const { patch } = useActiveTransfersStore.getState();

  switch (message.kind) {
    case 'batch-offer': {
      const peer = useConnectionStore.getState().peers[0];
      const { autoAcceptTrusted, isTrusted } = useSettingsStore.getState();

      useIncomingRequestStore.getState().setRequest({
        batchId: message.batchId,
        files: message.files,
        peerName: peer?.name ?? 'Unknown device',
      });

      if (peer && autoAcceptTrusted && isTrusted(peer.id)) {
        void acceptIncomingBatch(channel, shouldPromptForFolder());
      }
      break;
    }
    case 'file-start': {
      const meta = acceptedFiles.get(message.fileId);
      if (!meta) return;
      // Created synchronously so no chunk can arrive before this exists —
      // writes queue behind sinkPromise even while it's still resolving.
      const sinkPromise = openSink(meta);
      currentReceive = {
        fileId: message.fileId,
        batchId: message.batchId,
        meta,
        sinkPromise,
        writeQueue: sinkPromise.then(() => undefined),
        received: 0,
        lastTick: Date.now(),
        lastBytes: 0,
        speed: 0,
      };
      patch(message.fileId, { status: 'transferring' });
      break;
    }
    case 'file-end': {
      const active = currentReceive;
      if (!active || active.fileId !== message.fileId) return;
      currentReceive = null;
      void active.writeQueue
        .then(() => active.sinkPromise)
        .then((sink) => sink.close())
        .then(() => {
          patch(message.fileId, {
            status: 'completed',
            bytesTransferred: active.meta.size,
            speedBps: 0,
            completedAt: Date.now(),
          });
          if (useSettingsStore.getState().notificationsEnabled) {
            notify('File received', { body: active.meta.name, tag: active.fileId });
          }
          if (useSettingsStore.getState().soundEffectsEnabled) playReceivedSound();
        })
        .catch((error: unknown) => {
          console.error('[transfer] failed to finalize file', error);
          patch(message.fileId, { status: 'failed', errorMessage: 'Could not save file' });
        });
      break;
    }
    case 'cancel': {
      if (currentReceive?.fileId === message.fileId) {
        const active = currentReceive;
        currentReceive = null;
        void active.writeQueue
          .then(() => active.sinkPromise)
          .then((sink) => sink.abort())
          .catch(() => undefined);
      }
      if (acceptedFiles.has(message.fileId)) patch(message.fileId, { status: 'cancelled' });
      break;
    }
    case 'error': {
      if (acceptedFiles.has(message.fileId)) {
        patch(message.fileId, { status: 'failed', errorMessage: message.message });
      }
      break;
    }
    default:
      break;
  }
}

export function handleIncomingChunk(data: ArrayBuffer): void {
  const active = currentReceive;
  if (!active) return;

  active.writeQueue = active.writeQueue.then(() => active.sinkPromise).then((sink) => sink.write(data));
  active.received += data.byteLength;

  const now = Date.now();
  if (now - active.lastTick >= PROGRESS_TICK_MS || active.received === active.meta.size) {
    const elapsedSeconds = Math.max((now - active.lastTick) / 1000, 0.001);
    const instant = (active.received - active.lastBytes) / elapsedSeconds;
    active.speed = active.speed === 0 ? instant : active.speed * 0.7 + instant * 0.3;
    useActiveTransfersStore.getState().patch(active.fileId, {
      bytesTransferred: active.received,
      speedBps: active.speed,
    });
    active.lastTick = now;
    active.lastBytes = active.received;
  }
}

export function cancelReceiveTransfer(channel: RTCDataChannel, fileId: string, batchId: string): void {
  markCancelled(fileId);
  useActiveTransfersStore.getState().patch(fileId, { status: 'cancelled' });
  if (currentReceive?.fileId === fileId) {
    const active = currentReceive;
    currentReceive = null;
    void active.writeQueue
      .then(() => active.sinkPromise)
      .then((sink) => sink.abort())
      .catch(() => undefined);
  }
  if (channel.readyState === 'open') sendControl(channel, { kind: 'cancel', batchId, fileId });
}

export function retryReceiveTransfer(channel: RTCDataChannel, fileId: string): void {
  const record = useActiveTransfersStore.getState().records[fileId];
  if (!record) return;
  clearCancelled(fileId);
  useActiveTransfersStore.getState().patch(fileId, { status: 'pending', bytesTransferred: 0, errorMessage: undefined });
  if (channel.readyState === 'open') {
    sendControl(channel, { kind: 'resend-request', batchId: record.batchId, fileId });
  }
}

export function resetReceiveEngine(): void {
  currentReceive = null;
  currentDirHandle = null;
  acceptedFiles.clear();
}
