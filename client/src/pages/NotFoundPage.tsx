import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import { ROUTES } from '@/app/router/paths';
import { PageTransition } from '@/components/PageTransition';
import { usePageTitle } from '@/hooks/usePageTitle';

export function NotFoundPage() {
  usePageTitle('Page not found');

  return (
    <PageTransition>
      <Stack spacing={2} alignItems="center" sx={{ p: 3, pt: 10, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" fontWeight={700}>
          404
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This page slipped away. Let&apos;s get you back home.
        </Typography>
        <Button component={Link} to={ROUTES.home} variant="contained" sx={{ borderRadius: 5 }}>
          Back to Home
        </Button>
      </Stack>
    </PageTransition>
  );
}
