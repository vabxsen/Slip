import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SectionCard } from '@/components/SectionCard';
import { useAuthStore } from '@/features/auth/store/authStore';
import { claimUsername } from '@/services/firestore/usernameCloud';
import { useSettingsStore } from '@/store/settingsStore';
import { showToast } from '@/store/toastStore';
import { ClaimUsernameDialog } from './ClaimUsernameDialog';

interface NameFormValues {
  fullName: string;
}

interface UsernameFormValues {
  username: string;
}

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

const CLAIM_ERROR_MESSAGES = {
  taken: 'That username is already taken',
  'already-set': 'You already have a username set',
  invalid: 'Enter a valid username',
  offline: "Couldn't connect — check your connection and try again",
  unknown: 'Something went wrong — try again',
};

export function PersonalInfoSection() {
  const user = useAuthStore((state) => state.user);
  const personalInfo = useSettingsStore((state) => state.personalInfo);
  const setPersonalInfo = useSettingsStore((state) => state.setPersonalInfo);
  const username = useSettingsStore((state) => state.username);
  const setUsernameLocal = useSettingsStore((state) => state.setUsernameLocal);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NameFormValues>({ defaultValues: { fullName: personalInfo.fullName } });

  const {
    register: registerUsername,
    handleSubmit: handleSubmitUsername,
    reset: resetUsername,
    formState: { errors: usernameErrors },
  } = useForm<UsernameFormValues>({ defaultValues: { username: '' } });

  // Seed the name from the Google account on first sign-in — never
  // overwrites a name the user has already set or customized.
  useEffect(() => {
    if (user?.displayName && !personalInfo.fullName) {
      setPersonalInfo({ fullName: user.displayName });
    }
  }, [user, personalInfo.fullName, setPersonalInfo]);

  useEffect(() => reset({ fullName: personalInfo.fullName }), [personalInfo.fullName, reset]);

  const onSubmit = handleSubmit((values) => {
    const fullName = values.fullName.trim();
    setPersonalInfo({ fullName });
    reset({ fullName });
    setIsEditing(false);
    showToast('Name updated', 'success');
  });

  const cancelEdit = () => {
    reset({ fullName: personalInfo.fullName });
    setIsEditing(false);
  };

  const onSubmitUsername = handleSubmitUsername((values) => {
    setClaimError(null);
    setPendingUsername(values.username);
  });

  const handleConfirmClaim = () => {
    if (!pendingUsername || !user) return;
    const chosen = pendingUsername;
    setIsClaiming(true);
    void claimUsername(user.uid, chosen).then((result) => {
      setIsClaiming(false);
      setPendingUsername(null);
      if (result.ok) {
        setUsernameLocal(chosen);
        resetUsername({ username: '' });
        showToast('Username claimed', 'success');
      } else {
        setClaimError(CLAIM_ERROR_MESSAGES[result.reason]);
      }
    });
  };

  return (
    <SectionCard title="Personal info">
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {user
            ? 'Synced to your Google account — visible on any device you sign into.'
            : 'Stored only on this device — sign in with Google to sync across devices.'}
        </Typography>

        {isEditing ? (
          <form onSubmit={onSubmit} noValidate>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <TextField
                fullWidth
                autoFocus
                size="small"
                label="Full name"
                error={Boolean(errors.fullName)}
                helperText={errors.fullName?.message}
                {...register('fullName', {
                  maxLength: { value: 60, message: 'Keep it under 60 characters' },
                })}
              />
              <Button type="submit" variant="outlined" startIcon={<SaveRoundedIcon fontSize="small" />}>
                Save
              </Button>
              <Button color="inherit" onClick={cancelEdit}>
                Cancel
              </Button>
            </Stack>
          </form>
        ) : (
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
            <Stack sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                Full name
              </Typography>
              <Typography variant="body1" noWrap>
                {personalInfo.fullName || 'Not set'}
              </Typography>
            </Stack>
            <IconButton onClick={() => setIsEditing(true)} aria-label="Edit name" size="small">
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        )}

        <Stack>
          <Typography variant="caption" color="text.secondary">
            Email
          </Typography>
          <Typography variant="body1" color={user?.email ? 'text.primary' : 'text.secondary'} noWrap>
            {user?.email ?? 'Sign in with Google to link your email'}
          </Typography>
        </Stack>

        <Stack>
          <Typography variant="caption" color="text.secondary">
            Username
          </Typography>
          {!user ? (
            <Typography variant="body1" color="text.secondary">
              Sign in with Google to claim a username
            </Typography>
          ) : username ? (
            <Typography variant="body1" noWrap>
              @{username}
            </Typography>
          ) : (
            <form onSubmit={onSubmitUsername} noValidate>
              <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mt: 0.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Choose a username"
                  autoComplete="off"
                  error={Boolean(usernameErrors.username) || Boolean(claimError)}
                  helperText={
                    usernameErrors.username?.message ??
                    claimError ??
                    '3–20 characters: letters, numbers, underscores. Permanent once claimed.'
                  }
                  {...registerUsername('username', {
                    required: 'Enter a username',
                    pattern: {
                      value: USERNAME_PATTERN,
                      message: '3–20 characters: letters, numbers, underscores only',
                    },
                    onChange: () => setClaimError(null),
                  })}
                />
                <Button type="submit" variant="outlined" disabled={isClaiming}>
                  Claim
                </Button>
              </Stack>
            </form>
          )}
        </Stack>
      </Stack>

      <ClaimUsernameDialog
        open={pendingUsername !== null}
        username={pendingUsername ?? ''}
        onClose={() => setPendingUsername(null)}
        onConfirm={handleConfirmClaim}
      />
    </SectionCard>
  );
}
