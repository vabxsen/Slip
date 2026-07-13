import { useRef, type ChangeEvent } from 'react';

/**
 * Hidden file input + imperative opener. Render `{input}` once inside the
 * component, call `openPicker()` from any click handler.
 */
export function useFilePicker(onFiles: (files: File[]) => void) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => inputRef.current?.click();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) onFiles(files);
    // Reset so picking the same file again still fires onChange.
    event.target.value = '';
  };

  const input = (
    <input ref={inputRef} type="file" multiple hidden onChange={handleChange} aria-hidden />
  );

  return { openPicker, input };
}
