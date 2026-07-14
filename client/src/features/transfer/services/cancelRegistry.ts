/**
 * Fast, synchronous "should this file's transfer loop stop" flag, shared by
 * both the send and receive engines and keyed by fileId. Kept outside any
 * store because it's polled inside a tight chunk loop, not rendered.
 */
const cancelledFileIds = new Set<string>();

export function markCancelled(fileId: string): void {
  cancelledFileIds.add(fileId);
}

export function isCancelled(fileId: string): boolean {
  return cancelledFileIds.has(fileId);
}

export function clearCancelled(fileId: string): void {
  cancelledFileIds.delete(fileId);
}

export function resetCancelRegistry(): void {
  cancelledFileIds.clear();
}
