import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { ROUTES, type AppRoute } from '@/app/router/paths';

export interface NavItem {
  label: string;
  to: AppRoute;
  /** Outlined icon shown when inactive. */
  Icon: typeof HomeOutlinedIcon;
  /** Filled icon shown when active (M3 convention). */
  ActiveIcon: typeof HomeRoundedIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: ROUTES.home, Icon: HomeOutlinedIcon, ActiveIcon: HomeRoundedIcon },
  {
    label: 'Pair',
    to: ROUTES.pair,
    Icon: QrCodeScannerRoundedIcon,
    ActiveIcon: QrCodeScannerRoundedIcon,
  },
  {
    label: 'Devices',
    to: ROUTES.devices,
    Icon: DevicesOutlinedIcon,
    ActiveIcon: DevicesRoundedIcon,
  },
  {
    label: 'History',
    to: ROUTES.history,
    Icon: HistoryRoundedIcon,
    ActiveIcon: HistoryRoundedIcon,
  },
  {
    label: 'Settings',
    to: ROUTES.settings,
    Icon: SettingsOutlinedIcon,
    ActiveIcon: SettingsRoundedIcon,
  },
];
