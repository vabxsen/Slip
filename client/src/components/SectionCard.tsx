import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

interface SectionCardProps {
  title: string;
  /** Optional element rendered at the right edge of the header (link, button…). */
  action?: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
}

/** Standard titled card used for every Home/History/Settings section. */
export function SectionCard({ title, action, children, sx }: SectionCardProps) {
  return (
    <Card sx={{ height: '100%', ...sx }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, height: '100%' }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2, minHeight: 32 }}
        >
          <Typography variant="subtitle1" component="h2">
            {title}
          </Typography>
          {action}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}
