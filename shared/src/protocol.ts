import type { FileMeta } from './transfer';

/** Sender announces a batch of files it wants to send. */
export interface BatchOfferMessage {
  kind: 'batch-offer';
  batchId: string;
  files: FileMeta[];
}

export interface BatchAcceptMessage {
  kind: 'batch-accept';
  batchId: string;
}

export interface BatchDeclineMessage {
  kind: 'batch-decline';
  batchId: string;
}

/** Sender announces it is about to stream chunks for one file in the batch. */
export interface FileStartMessage {
  kind: 'file-start';
  batchId: string;
  fileId: string;
}

/** Sender signals the last chunk for a file has been sent. */
export interface FileEndMessage {
  kind: 'file-end';
  batchId: string;
  fileId: string;
}

/** Either side aborts a single in-flight file. */
export interface TransferCancelMessage {
  kind: 'cancel';
  batchId: string;
  fileId: string;
}

/** Receiver asks the sender to resend a file it previously failed/cancelled. */
export interface ResendRequestMessage {
  kind: 'resend-request';
  batchId: string;
  fileId: string;
}

export interface TransferErrorMessage {
  kind: 'error';
  batchId: string;
  fileId: string;
  message: string;
}

export type TransferControlMessage =
  | BatchOfferMessage
  | BatchAcceptMessage
  | BatchDeclineMessage
  | FileStartMessage
  | FileEndMessage
  | TransferCancelMessage
  | ResendRequestMessage
  | TransferErrorMessage;
