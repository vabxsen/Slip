import { create } from 'zustand';

export interface StagedFile {
  id: string;
  file: File;
  /** Folder-relative path when the file came from a directory drop/pick. */
  relativePath?: string;
}

interface StageInput {
  file: File;
  relativePath?: string;
}

interface TransferState {
  /** Files selected/dropped, waiting for a connected peer to send to. */
  staged: StagedFile[];
  stageFiles: (files: StageInput[]) => void;
  unstageFile: (id: string) => void;
  clearStaged: () => void;
}

export const useTransferStore = create<TransferState>((set) => ({
  staged: [],
  stageFiles: (files) =>
    set((state) => ({
      staged: [
        ...state.staged,
        ...files.map(({ file, relativePath }) => ({ id: crypto.randomUUID(), file, relativePath })),
      ],
    })),
  unstageFile: (id) => set((state) => ({ staged: state.staged.filter((f) => f.id !== id) })),
  clearStaged: () => set({ staged: [] }),
}));
