import SendRoundedIcon from '@mui/icons-material/SendRounded';
import type { PublicProfile } from '@slip/shared';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { fetchPublicProfileByUsername } from '@/services/firestore/publicProfileCloud';
import { sendMessage } from '../services/messageClient';
import { useMessageStore } from '../store/messageStore';

interface MessagesDialogProps {
  open: boolean;
  onClose: () => void;
}

type LookupStatus = 'idle' | 'looking-up' | 'not-found';

export function MessagesDialog({ open, onClose }: MessagesDialogProps) {
  const [usernameInput, setUsernameInput] = useState('');
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle');
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [text, setText] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const messages = useMessageStore((state) => state.messages);
  const addSent = useMessageStore((state) => state.addSent);
  const setActiveUsername = useMessageStore((state) => state.setActiveUsername);
  const clear = useMessageStore((state) => state.clear);

  const handleClose = () => {
    setUsernameInput('');
    setLookupStatus('idle');
    setProfile(null);
    setText('');
    setSendError(null);
    clear();
    onClose();
  };

  const handleLookup = async (event: FormEvent) => {
    event.preventDefault();
    if (!usernameInput.trim()) return;
    setLookupStatus('looking-up');
    const result = await fetchPublicProfileByUsername(usernameInput.trim());
    if (result) {
      setProfile(result);
      setActiveUsername(result.username);
      setLookupStatus('idle');
    } else {
      setProfile(null);
      setLookupStatus('not-found');
    }
  };

  const handleSend = async () => {
    if (!profile || !text.trim()) return;
    const messageText = text.trim();
    setText('');
    setSendError(null);
    const result = await sendMessage(profile.username, messageText);
    if (result.ok) {
      addSent(profile.username, messageText);
    } else {
      setSendError(`${profile.displayName ?? profile.username} isn't online right now.`);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Messages</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: profile ? 380 : undefined }}
      >
        {!profile ? (
          <form onSubmit={(event) => void handleLookup(event)}>
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              <TextField
                autoFocus
                fullWidth
                size="small"
                label="Username"
                autoComplete="off"
                value={usernameInput}
                onChange={(event) => setUsernameInput(event.target.value)}
                error={lookupStatus === 'not-found'}
                helperText={lookupStatus === 'not-found' ? 'No user found with that username.' : ' '}
              />
              <Button
                type="submit"
                variant="outlined"
                disabled={!usernameInput.trim() || lookupStatus === 'looking-up'}
                sx={{ alignSelf: 'flex-start' }}
              >
                {lookupStatus === 'looking-up' ? 'Looking up…' : 'Start chat'}
              </Button>
            </Stack>
          </form>
        ) : (
          <>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar src={profile.photoURL ?? undefined} sx={{ width: 36, height: 36 }}>
                {(profile.displayName ?? profile.username).charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="subtitle2">{profile.displayName ?? profile.username}</Typography>
            </Stack>
            <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
              {messages.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
                  No messages yet — nothing is saved once you close this.
                </Typography>
              )}
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    alignSelf: message.direction === 'sent' ? 'flex-end' : 'flex-start',
                    bgcolor: message.direction === 'sent' ? 'm3.primaryContainer' : 'm3.surfaceContainerHigh',
                    color: message.direction === 'sent' ? 'm3.onPrimaryContainer' : 'text.primary',
                    borderRadius: '12px',
                    px: 1.5,
                    py: 0.75,
                    maxWidth: '80%',
                  }}
                >
                  <Typography variant="body2">{message.text}</Typography>
                </Box>
              ))}
            </Box>
            {sendError && (
              <Typography variant="caption" color="error">
                {sendError}
              </Typography>
            )}
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="Message"
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={handleKeyDown}
                slotProps={{ htmlInput: { maxLength: 2000 } }}
              />
              <IconButton onClick={() => void handleSend()} disabled={!text.trim()} color="primary">
                <SendRoundedIcon />
              </IconButton>
            </Stack>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
