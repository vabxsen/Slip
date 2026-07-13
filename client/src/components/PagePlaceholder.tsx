import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { PageTransition } from '@/components/PageTransition';
import { usePageTitle } from '@/hooks/usePageTitle';

interface PagePlaceholderProps {
  title: string;
  description: string;
  children?: ReactNode;
}

/**
 * Temporary stand-in used while pages are being built out phase by phase.
 * Deleted once every page has its real content.
 */
export function PagePlaceholder({ title, description, children }: PagePlaceholderProps) {
  usePageTitle(title);

  return (
    <PageTransition>
      <Stack alignItems="center" sx={{ p: 3, pt: 6 }}>
        <Card sx={{ maxWidth: 480, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2} alignItems="flex-start">
              <Typography variant="h4" component="h1" fontWeight={600}>
                {title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {description}
              </Typography>
              {children}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </PageTransition>
  );
}
