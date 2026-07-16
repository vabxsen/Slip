import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import { Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { MessagesDialog } from '@/features/messaging/components/MessagesDialog';
import { SectionCard } from '@/components/SectionCard';
import { SendToUsernameDialog } from './SendToUsernameDialog';

/** Entry points for connecting to or messaging another user by their claimed username. */
export function SendToUserCard() {
  const [sendOpen, setSendOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);

  return (
    <SectionCard title="Send to username">
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          Connect directly to another Slip account by their username — no code needed if they're online.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<PersonSearchRoundedIcon fontSize="small" />}
          onClick={() => setSendOpen(true)}
        >
          Send to username
        </Button>
        <Button
          color="inherit"
          startIcon={<ChatBubbleOutlineRoundedIcon fontSize="small" />}
          onClick={() => setMessagesOpen(true)}
        >
          Messages
        </Button>
      </Stack>

      <SendToUsernameDialog open={sendOpen} onClose={() => setSendOpen(false)} />
      <MessagesDialog open={messagesOpen} onClose={() => setMessagesOpen(false)} />
    </SectionCard>
  );
}
