import { useRef, type ChangeEvent } from 'react';
import type { TraversedFile } from '../utils/directoryEntries';

interface UseFilePickerOptions {
  /** When true, the picker opens a folder chooser instead of a file chooser. */
  directory?: boolean;
}

/**
 * Hidden file input + imperative opener. Render `{input}` once inside the
 * component, call `openPicker()` from any click handler.
 */
export function useFilePicker(onFiles: (files: TraversedFile[]) => void, options: UseFilePickerOptions = {}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => inputRef.current?.click();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(event.target.files ?? []);
    const files: TraversedFile[] = fileList.map((file) => ({
      file,
      relativePath: file.webkitRelativePath || undefined,
    }));
    if (files.length > 0) onFiles(files);
    // Reset so picking the same file(s) again still fires onChange.
    event.target.value = '';
  };

  const input = (
    <input
      ref={inputRef}
      type="file"
      multiple
      hidden
      onChange={handleChange}
      aria-hidden
      webkitdirectory={options.directory ? '' : undefined}
      directory={options.directory ? '' : undefined}
    />
  );

  return { openPicker, input };
}
