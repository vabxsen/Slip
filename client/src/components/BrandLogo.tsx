import { Stack, Typography } from '@mui/material';
import brandMark from '@/assets/brand-mark.png';

/** App mark + wordmark, used in the top bar and (later) splash/empty states. */
export function BrandLogo() {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <img src={brandMark} alt="" aria-hidden width={36} height={36} style={{ borderRadius: '10px' }} />
      <Typography variant="h6" component="span" fontWeight={600}>
        Slip
      </Typography>
    </Stack>
  );
}
