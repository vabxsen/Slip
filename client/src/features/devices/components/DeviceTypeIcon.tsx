import ComputerRoundedIcon from '@mui/icons-material/ComputerRounded';
import DevicesOtherRoundedIcon from '@mui/icons-material/DevicesOtherRounded';
import LaptopRoundedIcon from '@mui/icons-material/LaptopRounded';
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded';
import TabletRoundedIcon from '@mui/icons-material/TabletRounded';
import type { SvgIconProps } from '@mui/material';
import type { DeviceType } from '@slip/shared';

const ICONS: Record<DeviceType, typeof ComputerRoundedIcon> = {
  desktop: ComputerRoundedIcon,
  laptop: LaptopRoundedIcon,
  tablet: TabletRoundedIcon,
  phone: SmartphoneRoundedIcon,
  unknown: DevicesOtherRoundedIcon,
};

interface DeviceTypeIconProps extends SvgIconProps {
  type: DeviceType;
}

export function DeviceTypeIcon({ type, ...iconProps }: DeviceTypeIconProps) {
  const Icon = ICONS[type];
  return <Icon {...iconProps} />;
}
