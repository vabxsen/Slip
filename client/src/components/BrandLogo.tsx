import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import { Box, Stack, Typography } from '@mui/material';

/** App mark + wordmark, used in the top bar and (later) splash/empty states. */
export function BrandLogo() {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Box
        aria-hidden
        sx={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          background:
            'linear-gradient(135deg, var(--mui-palette-m3-primary), var(--mui-palette-m3-tertiary))',
        }}
      >
        <SwapHorizRoundedIcon fontSize="small" />
      </Box>
      <Typography variant="h6" component="span" fontWeight={600}>
        Slip
      </Typography>
    </Stack>
  );
}
