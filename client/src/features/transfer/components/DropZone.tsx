import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import { Box, Button, Stack, Typography } from '@mui/material';
import { motion } from 'motion/react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { showToast } from '@/store/toastStore';
import { useFileDrop } from '../hooks/useFileDrop';
import { useFilePicker } from '../hooks/useFilePicker';
import { useTransferStore } from '../store/transferStore';
import type { TraversedFile } from '../utils/directoryEntries';
import { StagedFilesList } from './StagedFilesList';

/** Large drop target + click-to-browse area; staged files appear below it. */
export function DropZone() {
  const stageFiles = useTransferStore((state) => state.stageFiles);

  const handleFiles = (files: TraversedFile[]) => {
    stageFiles(files);
    showToast(
      files.length === 1 ? `Added ${files[0]?.file.name}` : `Added ${files.length} files`,
      'success',
    );
  };

  const { isDragging, dropHandlers } = useFileDrop(handleFiles);
  const { openPicker, input } = useFilePicker(handleFiles);
  const { openPicker: openFolderPicker, input: folderInput } = useFilePicker(handleFiles, { directory: true });

  return (
    <Box sx={{ height: '100%' }}>
      <motion.div
        animate={{ scale: isDragging ? 1.015 : 1 }}
        transition={{ duration: 0.15 }}
        style={{ height: '100%' }}
      >
        <Box
          role="button"
          tabIndex={0}
          aria-label="Add files to send: drop files here or press Enter to browse"
          onClick={openPicker}
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') openPicker();
          }}
          {...dropHandlers}
          sx={{
            height: '100%',
            minHeight: 220,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: 3,
            borderRadius: '16px',
            border: '2px dashed',
            borderColor: isDragging ? 'primary.main' : 'm3.outlineVariant',
            backgroundColor: isDragging ? 'm3.primaryContainer' : 'm3.surfaceContainerLow',
            color: isDragging ? 'm3.onPrimaryContainer' : 'text.primary',
            cursor: 'pointer',
            transition: 'border-color 0.2s, background-color 0.2s',
            outlineColor: 'primary.main',
          }}
        >
          <Stack spacing={1.5} alignItems="center" textAlign="center">
            <CloudUploadOutlinedIcon sx={{ fontSize: 44, color: 'm3.primary' }} />
            <Typography variant="subtitle1">
              {isDragging ? 'Drop to add files' : 'Drag & drop files here'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click anywhere in this area to browse
            </Typography>
            <Button
              size="small"
              startIcon={<FolderOpenRoundedIcon fontSize="small" />}
              onClick={(event: MouseEvent) => {
                event.stopPropagation();
                openFolderPicker();
              }}
            >
              Select a folder
            </Button>
          </Stack>
          <StagedFilesList />
        </Box>
      </motion.div>
      {input}
      {folderInput}
    </Box>
  );
}
