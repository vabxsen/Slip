import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import {
  Chip,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { SectionCard } from '@/components/SectionCard';
import { useSettingsStore, type DownloadPreference } from '@/store/settingsStore';

const supportsFolderPicker = typeof window !== 'undefined' && Boolean(window.showDirectoryPicker);

export function TransferSettingsSection() {
  const downloadPreference = useSettingsStore((state) => state.downloadPreference);
  const setDownloadPreference = useSettingsStore((state) => state.setDownloadPreference);
  const autoAcceptTrusted = useSettingsStore((state) => state.autoAcceptTrusted);
  const setAutoAcceptTrusted = useSettingsStore((state) => state.setAutoAcceptTrusted);
  const trustedDevices = useSettingsStore((state) => state.trustedDevices);
  const untrustDevice = useSettingsStore((state) => state.untrustDevice);

  return (
    <SectionCard title="Transfers">
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">Download location</Typography>
          <RadioGroup
            value={downloadPreference}
            onChange={(e) => setDownloadPreference(e.target.value as DownloadPreference)}
          >
            <FormControlLabel
              value="ask"
              control={<Radio size="small" />}
              disabled={!supportsFolderPicker}
              label={
                <Stack>
                  <Typography variant="body2">Ask each time</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {supportsFolderPicker
                      ? 'Choose a save folder when accepting a transfer'
                      : 'Not supported in this browser'}
                  </Typography>
                </Stack>
              }
            />
            <FormControlLabel
              value="auto"
              control={<Radio size="small" />}
              label={
                <Stack>
                  <Typography variant="body2">Save to Downloads automatically</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Files download like any other browser download
                  </Typography>
                </Stack>
              }
            />
          </RadioGroup>
        </Stack>

        <FormControlLabel
          control={
            <Switch
              checked={autoAcceptTrusted}
              onChange={(e) => setAutoAcceptTrusted(e.target.checked)}
            />
          }
          label={
            <Stack>
              <Typography variant="body2">Auto-accept trusted devices</Typography>
              <Typography variant="caption" color="text.secondary">
                Skip the confirmation dialog for devices you&apos;ve trusted
              </Typography>
            </Stack>
          }
        />

        <Stack spacing={1}>
          <Typography variant="subtitle2">Trusted devices</Typography>
          {trustedDevices.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              Mark a connected device as trusted from the Home page to see it here.
            </Typography>
          ) : (
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
              {trustedDevices.map((device) => (
                <Chip
                  key={device.id}
                  icon={<ShieldRoundedIcon />}
                  label={device.name}
                  onDelete={() => untrustDevice(device.id)}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </SectionCard>
  );
}
