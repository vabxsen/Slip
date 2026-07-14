export interface FileSink {
  write(chunk: ArrayBuffer): Promise<void> | void;
  close(): Promise<void>;
  abort(): Promise<void>;
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** Buffers chunks in memory, then triggers a normal browser download. */
export function createMemorySink(fileName: string, mimeType: string): FileSink {
  const parts: BlobPart[] = [];
  return {
    write: (chunk) => {
      parts.push(chunk);
    },
    close: async () => {
      triggerBrowserDownload(new Blob(parts, { type: mimeType || 'application/octet-stream' }), fileName);
    },
    abort: async () => {
      parts.length = 0;
    },
  };
}

function sanitizeSegment(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || 'file';
}

/** Streams chunks directly to disk under a user-chosen directory. */
export async function createFsaSink(
  rootHandle: FileSystemDirectoryHandle,
  fileName: string,
  relativePath?: string,
): Promise<FileSink> {
  let dir = rootHandle;
  const segments = (relativePath ?? '').split('/').filter(Boolean);
  segments.pop(); // last segment is the filename itself, already handled below
  for (const segment of segments) {
    dir = await dir.getDirectoryHandle(sanitizeSegment(segment), { create: true });
  }

  const fileHandle = await dir.getFileHandle(sanitizeSegment(fileName), { create: true });
  const writable = await fileHandle.createWritable();
  return {
    write: (chunk) => writable.write(chunk),
    close: () => writable.close(),
    abort: () => writable.abort(),
  };
}

/** Prompts the user for a save directory; null if unsupported or cancelled. */
export async function pickDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  if (!window.showDirectoryPicker) return null;
  try {
    return await window.showDirectoryPicker({ mode: 'readwrite' });
  } catch {
    return null;
  }
}
