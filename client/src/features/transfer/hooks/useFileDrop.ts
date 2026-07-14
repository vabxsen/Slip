import { useRef, useState, type DragEvent } from 'react';
import { expandDataTransferItems, type TraversedFile } from '../utils/directoryEntries';

/**
 * Drag-and-drop file handling with correct enter/leave tracking (drag events
 * fire on every child element, so a depth counter keeps `isDragging` stable)
 * and directory-entry traversal so dropped folders keep their structure.
 */
export function useFileDrop(onFiles: (files: TraversedFile[]) => void) {
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

      const { items, files: fileList } = event.dataTransfer;
      void (async () => {
        let result: TraversedFile[] = [];
        if (items && items.length > 0) {
          try {
            result = await expandDataTransferItems(items);
          } catch {
            result = [];
          }
        }
        if (result.length === 0) {
          result = Array.from(fileList).map((file) => ({ file }));
        }
        if (result.length > 0) onFiles(result);
      })();
    },
  };

  return { isDragging, dropHandlers };
}
