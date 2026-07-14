import { useActiveTransfersStore } from '../store/activeTransfersStore';
import { useIncomingRequestStore } from '../store/incomingRequestStore';
import type { StagedFile } from '../store/transferStore';
import { acceptIncomingBatch } from './receiveEngine';
import { sendStagedBatch } from './sendEngine';
import { handleChannelMessage } from './transferDispatcher';

/**
 * Loopback verification: wires two RTCDataChannels directly to each other
 * (same trick as the Phase 7 WebRTC self-test) and runs the *real* send and
 * receive engines against them — full offer/accept, chunked streaming with
 * backpressure, and sink finalization — without needing two separate tabs.
 */
async function runTransferSelfTest(): Promise<unknown> {
  return new Promise((resolve) => {
    const pcA = new RTCPeerConnection();
    const pcB = new RTCPeerConnection();
    let channelB: RTCDataChannel;

    pcA.onicecandidate = (e) => {
      if (e.candidate) void pcB.addIceCandidate(e.candidate);
    };
    pcB.onicecandidate = (e) => {
      if (e.candidate) void pcA.addIceCandidate(e.candidate);
    };

    const channelA: RTCDataChannel = pcA.createDataChannel('test');
    channelA.binaryType = 'arraybuffer';
    channelA.onmessage = (event: MessageEvent<ArrayBuffer | string>) =>
      handleChannelMessage(channelA, event.data);

    pcB.ondatachannel = (event) => {
      channelB = event.channel;
      channelB.binaryType = 'arraybuffer';
      channelB.onmessage = (ev: MessageEvent<ArrayBuffer | string>) => handleChannelMessage(channelB, ev.data);
      void start();
    };

    pcA.onnegotiationneeded = async () => {
      await pcA.setLocalDescription();
      const offer = pcA.localDescription;
      if (!offer) return;
      await pcB.setRemoteDescription(offer);
      const answer = await pcB.createAnswer();
      await pcB.setLocalDescription(answer);
      const answerDesc = pcB.localDescription;
      if (answerDesc) await pcA.setRemoteDescription(answerDesc);
    };

    async function start(): Promise<void> {
      const bytes = new Uint8Array(200_000);
      for (let i = 0; i < bytes.length; i += 1) bytes[i] = i % 256;
      const file = new File([bytes], 'selftest.bin', { type: 'application/octet-stream' });
      const fileId = crypto.randomUUID();
      const staged: StagedFile[] = [{ id: fileId, file }];

      const unsubscribe = useIncomingRequestStore.subscribe((state) => {
        if (state.request) {
          unsubscribe();
          void acceptIncomingBatch(channelB, false);
        }
      });

      await sendStagedBatch(channelA, staged, 'Peer B (self-test)');

      const deadline = Date.now() + 5000;
      while (Date.now() < deadline) {
        const record = useActiveTransfersStore.getState().records[fileId];
        if (record?.status === 'completed' || record?.status === 'failed') break;
        await new Promise((r) => setTimeout(r, 50));
      }

      const record = useActiveTransfersStore.getState().records[fileId];
      pcA.close();
      pcB.close();
      resolve({
        status: record?.status,
        bytesTransferred: record?.bytesTransferred,
        expectedSize: file.size,
      });
    }
  });
}

if (import.meta.env.DEV) {
  (window as unknown as { __slipTransferSelfTest?: () => Promise<unknown> }).__slipTransferSelfTest =
    runTransferSelfTest;
}
