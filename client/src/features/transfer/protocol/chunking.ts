/** Safe chunk size across browsers' RTCDataChannel implementations. */
export const CHUNK_SIZE = 16 * 1024;

/** Sender-side backpressure ceiling before pausing further sends. */
const HIGH_WATER_MARK = 1 << 20; // 1 MB

/** Reads a File in fixed-size chunks without loading it entirely into memory. */
export async function* readFileChunks(file: File): AsyncGenerator<ArrayBuffer> {
  let offset = 0;
  while (offset < file.size) {
    const slice = file.slice(offset, offset + CHUNK_SIZE);
    yield await slice.arrayBuffer();
    offset += CHUNK_SIZE;
  }
}

/**
 * Resolves once the channel's outgoing buffer has drained below the high
 * water mark, so a fast reader never floods a slower peer connection.
 */
export function waitForDrain(channel: RTCDataChannel): Promise<void> {
  if (channel.bufferedAmount <= HIGH_WATER_MARK) return Promise.resolve();

  return new Promise((resolve) => {
    channel.bufferedAmountLowThreshold = HIGH_WATER_MARK;
    const onLow = () => {
      channel.removeEventListener('bufferedamountlow', onLow);
      resolve();
    };
    channel.addEventListener('bufferedamountlow', onLow);
  });
}
