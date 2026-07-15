import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ColorizeRoundedIcon from '@mui/icons-material/ColorizeRounded';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';
import { ButtonBase, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { useRef, type ChangeEvent } from 'react';
import { SectionCard } from '@/components/SectionCard';
import { useThemeMode, type ThemeMode } from '@/hooks/useThemeMode';
import { useSettingsStore } from '@/store/settingsStore';
import { SEED_COLOR } from '@/theme';

const PRESET_COLORS = [
  { name: 'Blue', hex: SEED_COLOR },
  { name: 'Purple', hex: '#6750A4' },
  { name: 'Green', hex: '#146C2E' },
  { name: 'Amber', hex: '#8B5000' },
  { name: 'Rose', hex: '#9C4146' },
  { name: 'Teal', hex: '#146C6C' },
  { name: 'Indigo', hex: '#4759B5' },
  { name: 'Red', hex: '#B3261E' },
] as const;

function sameColor(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

const SELECTED_RING =
  '0 0 0 2px var(--mui-palette-background-default), 0 0 0 4px var(--mui-palette-primary-main)';

function ColorSwatch({
  color,
  selected,
  label,
  onClick,
}: {
  color: string;
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip title={label}>
      <ButtonBase
        onClick={onClick}
        aria-label={`${label} theme color${selected ? ' (selected)' : ''}`}
        aria-pressed={selected}
        sx={{
          width: 36,
          height: 36,
          borderRadius: '999px',
          backgroundColor: color,
          boxShadow: selected ? SELECTED_RING : 'none',
          transition: 'box-shadow 0.15s, transform 0.1s',
          '&:hover': { transform: 'scale(1.08)' },
        }}
      >
        {selected && (
          <CheckRoundedIcon
            sx={{ color: '#fff', fontSize: 18, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }}
          />
        )}
      </ButtonBase>
    </Tooltip>
  );
}

export function AppearanceSection() {
  const { mode, setMode } = useThemeMode();
  const seedColor = useSettingsStore((state) => state.seedColor);
  const setSeedColor = useSettingsStore((state) => state.setSeedColor);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const isCustom = !PRESET_COLORS.some((preset) => sameColor(preset.hex, seedColor));

  const handleCustomColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSeedColor(event.target.value);
  };

  return (
    <SectionCard title="Appearance">
      <Stack spacing={2.5}>
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

        <Stack spacing={1}>
          <Typography variant="subtitle2">Color palette</Typography>
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5}>
            {PRESET_COLORS.map((preset) => (
              <ColorSwatch
                key={preset.hex}
                color={preset.hex}
                label={preset.name}
                selected={sameColor(preset.hex, seedColor)}
                onClick={() => setSeedColor(preset.hex)}
              />
            ))}
            <Tooltip title="Custom color">
              <ButtonBase
                onClick={() => colorInputRef.current?.click()}
                aria-label={`Custom theme color${isCustom ? ' (selected)' : ''}`}
                aria-pressed={isCustom}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '999px',
                  border: '2px dashed',
                  borderColor: 'm3.outlineVariant',
                  backgroundColor: isCustom ? seedColor : 'transparent',
                  boxShadow: isCustom ? SELECTED_RING : 'none',
                  transition: 'transform 0.1s',
                  '&:hover': { transform: 'scale(1.08)' },
                }}
              >
                <ColorizeRoundedIcon
                  sx={{ fontSize: 16, color: isCustom ? '#fff' : 'text.secondary' }}
                />
              </ButtonBase>
            </Tooltip>
            <input
              ref={colorInputRef}
              type="color"
              value={seedColor}
              onChange={handleCustomColorChange}
              aria-hidden
              style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Sets the accent color the whole app is themed around, in both light and dark mode.
          </Typography>
        </Stack>
      </Stack>
    </SectionCard>
  );
}
