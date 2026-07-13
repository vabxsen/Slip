import { Box, CircularProgress } from '@mui/material';

/** Centered loader used while lazy routes and initial data resolve. */
export function FullPageLoader() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
      <CircularProgress size={32} />
    </Box>
  );
}
