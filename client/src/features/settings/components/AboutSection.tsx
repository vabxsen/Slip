import { Button, Chip, Stack } from '@mui/material';
import { useState } from 'react';
import { SectionCard } from '@/components/SectionCard';
import { BrandLogo } from '@/components/BrandLogo';
import { CreditsDialog } from './CreditsDialog';

const APP_VERSION = '0.1.0';

export function AboutSection() {
  const [creditsOpen, setCreditsOpen] = useState(false);

  return (
    <SectionCard title="About">
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <BrandLogo />
          <Chip label={`v${APP_VERSION}`} size="small" variant="outlined" />
        </Stack>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setCreditsOpen(true)}
          sx={{ alignSelf: 'flex-start' }}
        >
          Credits
        </Button>
      </Stack>
      <CreditsDialog open={creditsOpen} onClose={() => setCreditsOpen(false)} />
    </SectionCard>
  );
}
