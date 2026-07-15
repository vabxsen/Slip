import { Chip, Stack } from '@mui/material';
import { SectionCard } from '@/components/SectionCard';
import { BrandLogo } from '@/components/BrandLogo';

const APP_VERSION = '0.1.0';

export function AboutSection() {
  return (
    <SectionCard title="About">
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <BrandLogo />
        <Chip label={`v${APP_VERSION}`} size="small" variant="outlined" />
      </Stack>
    </SectionCard>
  );
}
