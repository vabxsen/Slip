import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { Avatar, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { SectionCard } from '@/components/SectionCard';
import { firebaseConfigured } from '@/services/firebase/firebaseApp';
import { signInWithGoogle, signOut } from '@/services/auth/auth';
import { showToast } from '@/store/toastStore';
import { useAuthStore } from '../store/authStore';
import { GoogleIcon } from './GoogleIcon';
import { SignOutDialog } from './SignOutDialog';

function initialsFrom(name: string | null, email: string | null): string {
  const source = name ?? email ?? '?';
  return source.trim().charAt(0).toUpperCase();
}

export function AccountSection() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

  const handleSignIn = async () => {
    try {
      // Navigates the page away to Google; on success it comes back and
      // useAuthListener's completeRedirectSignIn picks up the result.
      await signInWithGoogle();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign-in failed';
      showToast(message, 'error');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    showToast('Signed out', 'info');
  };

  if (!firebaseConfigured()) {
    return (
      <SectionCard title="Account">
        <Typography variant="body2" color="text.secondary">
          Sign-in isn&apos;t configured for this build. Add Firebase credentials to enable it.
        </Typography>
      </SectionCard>
    );
  }

  return (
    <>
      <SectionCard title="Account">
        {status === 'loading' ? (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Checking sign-in status…
            </Typography>
          </Stack>
        ) : user ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={user.photoURL ?? undefined} sx={{ width: 44, height: 44 }}>
              {initialsFrom(user.displayName, user.email)}
            </Avatar>
            <Stack sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" fontWeight={500} noWrap>
                {user.displayName ?? 'Signed in'}
              </Typography>
              {user.email && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user.email}
                </Typography>
              )}
            </Stack>
            <Button
              size="small"
              color="error"
              startIcon={<LogoutRoundedIcon fontSize="small" />}
              onClick={() => setSignOutDialogOpen(true)}
            >
              Sign out
            </Button>
          </Stack>
        ) : (
          <Stack spacing={1.5} alignItems="flex-start">
            <Typography variant="body2" color="text.secondary">
              Sign in to identify this device as yours.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => void handleSignIn()}
              sx={{
                color: 'text.primary',
                borderColor: 'm3.outlineVariant',
                gap: 1,
                textTransform: 'none',
              }}
            >
              <GoogleIcon />
              Sign in with Google
            </Button>
          </Stack>
        )}
      </SectionCard>
      <SignOutDialog
        open={signOutDialogOpen}
        onClose={() => setSignOutDialogOpen(false)}
        onConfirm={() => void handleSignOut()}
      />
    </>
  );
}
