import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchServerHealth } from '@/services/api/health';
import { AppProviders } from './AppProviders';

function ServerStatusChip() {
  const { isSuccess, isError } = useQuery({
    queryKey: ['server-health'],
    queryFn: fetchServerHealth,
    refetchInterval: 10_000,
  });

  if (isSuccess) return <Chip label="Signaling server online" color="success" size="small" />;
  if (isError) return <Chip label="Signaling server offline" color="error" size="small" />;
  return <Chip label="Checking server…" size="small" />;
}

function Scaffold() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 3,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 4 }} elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="h4" component="h1" fontWeight={600}>
              Slip
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Phase 1 scaffold is running. Routing, theme, and the real UI arrive in the next
              phases.
            </Typography>
            <ServerStatusChip />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export function App() {
  return (
    <AppProviders>
      <Scaffold />
    </AppProviders>
  );
}
