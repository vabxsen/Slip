import { create } from 'zustand';

export interface StagedFile {
  id: string;
  file: File;
}

interface TransferState {
  /** Files selected/dropped, waiting for a connected peer to send to. */
  staged: StagedFile[];
  stageFiles: (files: File[]) => void;
  unstageFile: (id: string) => void;
  clearStaged: () => void;
}

export const useTransferStore = create<TransferState>((set) => ({
  staged: [],
  stageFiles: (files) =>
    set((state) => ({
      staged: [
        ...state.staged,
        ...files.map((file) => ({ id: crypto.randomUUID(), file })),
      ],
    })),
  unstageFile: (id) => set((state) => ({ staged: state.staged.filter((f) => f.id !== id) })),
  clearStaged: () => set({ staged: [] }),
}));
