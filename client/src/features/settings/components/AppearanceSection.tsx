import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { SectionCard } from '@/components/SectionCard';
import { useThemeMode, type ThemeMode } from '@/hooks/useThemeMode';

export function AppearanceSection() {
  const { mode, setMode } = useThemeMode();

  return (
    <SectionCard title="Appearance">
      <ToggleButtonGroup
        exclusive
        fullWidth
        value={mode}
        onChange={(_, value: ThemeMode | null) => value && setMode(value)}
      >
        <ToggleButton value="system">
          <SettingsBrightnessOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
          System
        </ToggleButton>
        <ToggleButton value="light">
          <LightModeOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
          Light
        </ToggleButton>
        <ToggleButton value="dark">
          <DarkModeOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
          Dark
        </ToggleButton>
      </ToggleButtonGroup>
    </SectionCard>
  );
}
