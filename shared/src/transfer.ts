export type TransferDirection = 'send' | 'receive';

export type TransferStatus =
  | 'pending'
  | 'accepted'
  | 'transferring'
  | 'completed'
  | 'cancelled'
  | 'failed';

/** Metadata describing a single file inside a transfer. */
export interface FileMeta {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  /** Path relative to the dropped folder, when a whole folder is sent. */
  relativePath?: string;
}
