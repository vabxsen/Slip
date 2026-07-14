import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDeviceStore } from '@/store/deviceStore';
import { showToast } from '@/store/toastStore';

interface DeviceNameFormValues {
  name: string;
}

const NAME_MAX_LENGTH = 40;

export function DeviceNameForm() {
  const device = useDeviceStore((state) => state.device);
  const renameDevice = useDeviceStore((state) => state.renameDevice);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<DeviceNameFormValues>({ defaultValues: { name: device.name } });

  // Keep the field in sync if the name changes elsewhere (e.g. a future sync feature).
  useEffect(() => reset({ name: device.name }), [device.name, reset]);

  const onSubmit = handleSubmit(({ name }) => {
    renameDevice(name);
    showToast('Device name updated', 'success');
    reset({ name: name.trim() });
  });

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          This is how your device appears to others while pairing.
        </Typography>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <TextField
            fullWidth
            size="small"
            label="Device name"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register('name', {
              required: 'Enter a device name',
              maxLength: { value: NAME_MAX_LENGTH, message: `Keep it under ${NAME_MAX_LENGTH} characters` },
              validate: (value) => value.trim().length > 0 || 'Enter a device name',
            })}
          />
          <Button
            type="submit"
            variant="outlined"
            disabled={!isDirty || isSubmitting}
            startIcon={<SaveRoundedIcon fontSize="small" />}
            sx={{ flexShrink: 0 }}
          >
            Save
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
