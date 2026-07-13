import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

/** Friendly placeholder for lists and sections with no content yet. */
export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Stack alignItems="center" spacing={1.5} sx={{ py: 4, textAlign: 'center' }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '999px',
          display: 'grid',
          placeItems: 'center',
          backgroundColor: 'm3.surfaceContainerHigh',
          color: 'm3.onSurfaceVariant',
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle2">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
          {description}
        </Typography>
      )}
    </Stack>
  );
}
