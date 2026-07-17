import { Box, Stack, Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

/** Friendly placeholder for lists and sections with no content yet. */
export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Stack alignItems="center" spacing={2} sx={{ py: 5, textAlign: 'center' }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '999px',
          display: 'grid',
          placeItems: 'center',
          backgroundImage: (theme: Theme) =>
            `radial-gradient(circle at 30% 25%, ${(theme.vars ?? theme).palette.m3.primaryContainer}, ${(theme.vars ?? theme).palette.m3.surfaceContainerHigh} 75%)`,
          color: 'm3.onPrimaryContainer',
          fontSize: 30,
          '& svg': { fontSize: 'inherit' },
        }}
      >
        {icon}
      </Box>
      <Stack spacing={0.5} alignItems="center">
        <Typography variant="subtitle1" fontWeight={500}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
            {description}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
