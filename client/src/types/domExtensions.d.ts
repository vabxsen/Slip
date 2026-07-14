export {};

declare global {
  interface Window {
    showDirectoryPicker?: (options?: {
      mode?: 'read' | 'readwrite';
    }) => Promise<FileSystemDirectoryHandle>;
  }
}

// Non-standard attribute that enables folder selection on a file input.
declare module 'react' {
  interface InputHTMLAttributes<_T> {
    webkitdirectory?: string;
    directory?: string;
  }
}
