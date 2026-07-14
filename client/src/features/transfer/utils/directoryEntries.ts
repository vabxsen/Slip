export interface TraversedFile {
  file: File;
  relativePath?: string;
}

function isFileEntry(entry: FileSystemEntry): entry is FileSystemFileEntry {
  return entry.isFile;
}

function isDirectoryEntry(entry: FileSystemEntry): entry is FileSystemDirectoryEntry {
  return entry.isDirectory;
}

function readEntryFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject));
}

function readDirectoryBatch(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => reader.readEntries(resolve, reject));
}

/** `readEntries` only returns a page at a time; call until it's exhausted. */
async function readAllDirectoryEntries(
  directory: FileSystemDirectoryEntry,
): Promise<FileSystemEntry[]> {
  const reader = directory.createReader();
  const all: FileSystemEntry[] = [];
  let batch = await readDirectoryBatch(reader);
  while (batch.length > 0) {
    all.push(...batch);
    batch = await readDirectoryBatch(reader);
  }
  return all;
}

async function traverseEntry(
  entry: FileSystemEntry,
  pathPrefix: string,
  out: TraversedFile[],
): Promise<void> {
  if (isFileEntry(entry)) {
    const file = await readEntryFile(entry);
    out.push({ file, relativePath: `${pathPrefix}${entry.name}` });
  } else if (isDirectoryEntry(entry)) {
    const children = await readAllDirectoryEntries(entry);
    await Promise.all(children.map((child) => traverseEntry(child, `${pathPrefix}${entry.name}/`, out)));
  }
}

/** Expands dropped items into a flat file list, preserving folder structure as relativePath. */
export async function expandDataTransferItems(items: DataTransferItemList): Promise<TraversedFile[]> {
  const entries: FileSystemEntry[] = [];
  for (const item of Array.from(items)) {
    const entry = item.webkitGetAsEntry?.();
    if (entry) entries.push(entry);
  }
  if (entries.length === 0) return [];

  const out: TraversedFile[] = [];
  await Promise.all(entries.map((entry) => traverseEntry(entry, '', out)));
  return out;
}
