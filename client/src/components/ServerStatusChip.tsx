import { Chip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchServerHealth } from '@/services/api/health';

/** Live signaling-server connectivity indicator. */
export function ServerStatusChip() {
  const { isSuccess, isError } = useQuery({
    queryKey: ['server-health'],
    queryFn: fetchServerHealth,
    refetchInterval: 10_000,
  });

  if (isSuccess) return <Chip label="Signaling server online" color="success" size="small" />;
  if (isError) return <Chip label="Signaling server offline" color="error" size="small" />;
  return <Chip label="Checking server…" size="small" />;
}
