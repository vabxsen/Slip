import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SectionCard } from '@/components/SectionCard';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { showToast } from '@/store/toastStore';

interface NameFormValues {
  fullName: string;
}

export function PersonalInfoSection() {
  const user = useAuthStore((state) => state.user);
  const personalInfo = useSettingsStore((state) => state.personalInfo);
  const setPersonalInfo = useSettingsStore((state) => state.setPersonalInfo);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NameFormValues>({ defaultValues: { fullName: personalInfo.fullName } });

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
      </Stack>
    </SectionCard>
  );
}
