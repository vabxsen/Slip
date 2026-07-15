import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SectionCard } from '@/components/SectionCard';
import { useSettingsStore, type PersonalInfo } from '@/store/settingsStore';
import { showToast } from '@/store/toastStore';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[\d\s()+-]{7,20}$/;

export function PersonalInfoSection() {
  const personalInfo = useSettingsStore((state) => state.personalInfo);
  const setPersonalInfo = useSettingsStore((state) => state.setPersonalInfo);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PersonalInfo>({ defaultValues: personalInfo });

  useEffect(() => reset(personalInfo), [personalInfo, reset]);

  const onSubmit = handleSubmit((values) => {
    const trimmed: PersonalInfo = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
    };
    setPersonalInfo(trimmed);
    showToast('Personal info updated', 'success');
    reset(trimmed);
  });

  return (
    <SectionCard title="Personal info">
      <form onSubmit={onSubmit} noValidate>
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Stored only on this device — Slip has no backend, so this never leaves your browser.
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Full name"
            error={Boolean(errors.fullName)}
            helperText={errors.fullName?.message}
            {...register('fullName', {
              maxLength: { value: 60, message: 'Keep it under 60 characters' },
            })}
          />
          <TextField
            fullWidth
            size="small"
            type="email"
            label="Email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email', {
              validate: (value) =>
                !value || EMAIL_PATTERN.test(value) || 'Enter a valid email address',
            })}
          />
          <TextField
            fullWidth
            size="small"
            type="tel"
            label="Phone"
            error={Boolean(errors.phone)}
            helperText={errors.phone?.message}
            {...register('phone', {
              validate: (value) =>
                !value || PHONE_PATTERN.test(value) || 'Enter a valid phone number',
            })}
          />
          <Button
            type="submit"
            variant="outlined"
            disabled={!isDirty || isSubmitting}
            startIcon={<SaveRoundedIcon fontSize="small" />}
            sx={{ alignSelf: 'flex-start' }}
          >
            Save
          </Button>
        </Stack>
      </form>
    </SectionCard>
  );
}
