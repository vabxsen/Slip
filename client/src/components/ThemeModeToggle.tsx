import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';
import { IconButton, Tooltip } from '@mui/material';
import { useThemeMode, type ThemeMode } from '@/hooks/useThemeMode';

const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

const MODE_ICON: Record<ThemeMode, typeof LightModeOutlinedIcon> = {
  system: SettingsBrightnessOutlinedIcon,
  light: LightModeOutlinedIcon,
  dark: DarkModeOutlinedIcon,
};

/** Cycles theme mode: system → light → dark. */
export function ThemeModeToggle() {
  const { mode, setMode } = useThemeMode();
  const Icon = MODE_ICON[mode];

  return (
    <Tooltip title={`Theme: ${mode}`}>
      <IconButton
        aria-label={`Theme mode: ${mode}. Click to switch.`}
        onClick={() => setMode(NEXT_MODE[mode])}
        size="small"
      >
        <Icon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
