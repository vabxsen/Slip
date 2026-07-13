import { PAIR_CODE_LENGTH } from '@slip/shared';
import { Alert, Button, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { PageTransition } from '@/components/PageTransition';
import { usePageTitle } from '@/hooks/usePageTitle';
import { CodeInput } from '@/features/pairing/components/CodeInput';
import { useJoinPair } from '@/features/pairing/hooks/useJoinPair';

export function PairPage() {
  usePageTitle('Pair');
  const [searchParams] = useSearchParams();
  const { join, state, error } = useJoinPair();
  const [code, setCode] = useState('');
  const [autoJoined, setAutoJoined] = useState(false);

  // Deep link: /pair?code=123456 prefills and auto-submits once.
  useEffect(() => {
    const deepCode = (searchParams.get('code') ?? '').replace(/\D/g, '').slice(0, PAIR_CODE_LENGTH);
    if (deepCode.length === PAIR_CODE_LENGTH && !autoJoined) {
      setCode(deepCode);
      setAutoJoined(true);
      void join(deepCode);
    }
  }, [searchParams, autoJoined, join]);

  const isJoining = state === 'joining';
  const canSubmit = code.length === PAIR_CODE_LENGTH && !isJoining;

  return (
    <PageTransition>
      <Stack alignItems="center" sx={{ pt: { xs: 2, md: 5 } }}>
        <Card sx={{ maxWidth: 440, width: '100%' }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={3} alignItems="center" textAlign="center">
              <Stack spacing={1} alignItems="center">
                <Typography variant="h5" component="h1" fontWeight={500}>
                  Enter pair code
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type the 6-digit code shown on the other device, or scan its QR code.
                </Typography>
              </Stack>

              <CodeInput
                value={code}
                onChange={setCode}
                onComplete={(full) => void join(full)}
                disabled={isJoining}
                autoFocus
              />

              {error && (
                <Alert severity="error" sx={{ width: '100%', borderRadius: 3 }}>
                  {error}
                </Alert>
              )}

              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={!canSubmit}
                onClick={() => void join(code)}
                startIcon={isJoining ? <CircularProgress size={18} color="inherit" /> : undefined}
              >
                {isJoining ? 'Connecting…' : 'Connect'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </PageTransition>
  );
}
