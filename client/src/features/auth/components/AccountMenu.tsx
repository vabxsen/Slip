import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/router/paths';
import { firebaseConfigured } from '@/services/firebase/firebaseApp';
import { signInWithGoogle, signOut } from '@/services/auth/auth';
import { showToast } from '@/store/toastStore';
import { useAuthStore } from '../store/authStore';
import { GoogleIcon } from './GoogleIcon';
import { SignOutDialog } from './SignOutDialog';

function initialsFrom(name: string | null, email: string | null): string {
  const source = name ?? email ?? '?';
  return source.trim().charAt(0).toUpperCase();
}

export function AccountMenu() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const open = Boolean(anchorEl);

  if (!firebaseConfigured()) return null;

  const closeMenu = () => setAnchorEl(null);

  const handleSignIn = async () => {
    closeMenu();
    try {
      await signInWithGoogle();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign-in failed';
      showToast(message, 'error');
    }
  };

  const requestSignOut = () => {
    closeMenu();
    setSignOutDialogOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    showToast('Signed out', 'info');
  };

  const goToSettings = () => {
    closeMenu();
    navigate(ROUTES.settings);
  };

  return (
    <>
      <IconButton
        onClick={(event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)}
        aria-label="Account"
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        {status === 'loading' ? (
          <CircularProgress size={22} />
        ) : user ? (
          <Avatar src={user.photoURL ?? undefined} sx={{ width: 32, height: 32 }}>
            {initialsFrom(user.displayName, user.email)}
          </Avatar>
        ) : (
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'm3.surfaceContainerHighest' }}>
            <LoginRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          </Avatar>
        )}
      </IconButton>
      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {user ? (
          [
            <Box key="info" sx={{ px: 2, py: 1.5, minWidth: 240 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar src={user.photoURL ?? undefined} sx={{ width: 40, height: 40 }}>
                  {initialsFrom(user.displayName, user.email)}
                </Avatar>
                <Stack sx={{ minWidth: 0 }}>
                  <Typography variant="body1" fontWeight={500} noWrap>
                    {user.displayName ?? 'Signed in'}
                  </Typography>
                  {user.email && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {user.email}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Box>,
            <Divider key="divider" />,
            <MenuItem key="settings" onClick={goToSettings}>
              <ListItemIcon>
                <SettingsRoundedIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>,
            <MenuItem key="signout" onClick={requestSignOut} sx={{ color: 'error.main' }}>
              <ListItemIcon sx={{ color: 'inherit' }}>
                <LogoutRoundedIcon fontSize="small" />
              </ListItemIcon>
              Sign out
            </MenuItem>,
          ]
        ) : (
          <MenuItem onClick={() => void handleSignIn()}>
            <ListItemIcon>
              <GoogleIcon fontSize="small" />
            </ListItemIcon>
            Sign in with Google
          </MenuItem>
        )}
      </Menu>
      <SignOutDialog
        open={signOutDialogOpen}
        onClose={() => setSignOutDialogOpen(false)}
        onConfirm={() => void handleSignOut()}
      />
    </>
  );
}
