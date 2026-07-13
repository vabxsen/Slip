import { useRef, useState, type DragEvent } from 'react';

/**
 * Drag-and-drop file handling with correct enter/leave tracking (drag events
 * fire on every child element, so a depth counter keeps `isDragging` stable).
 */
export function useFileDrop(onFiles: (files: File[]) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const depth = useRef(0);

  const dropHandlers = {
    onDragEnter: (event: DragEvent) => {
      event.preventDefault();
      depth.current += 1;
      setIsDragging(true);
    },
    onDragOver: (event: DragEvent) => {
      event.preventDefault();
    },
    onDragLeave: (event: DragEvent) => {
      event.preventDefault();
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setIsDragging(false);
    },
    onDrop: (event: DragEvent) => {
      event.preventDefault();
      depth.current = 0;
      setIsDragging(false);
      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0) onFiles(files);
    },
  };

  return { isDragging, dropHandlers };
}
