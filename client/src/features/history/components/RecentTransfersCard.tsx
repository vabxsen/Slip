import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import { Avatar, Button, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { Link } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
import { ROUTES } from '@/app/router/paths';
import { EmptyState } from '@/components/EmptyState';
import { SectionCard } from '@/components/SectionCard';
import { formatBytes } from '@/utils/formatBytes';
import { selectRecentTransfers, useActiveTransfersStore } from '@/features/transfer/store/activeTransfersStore';

const MAX_PREVIEW = 5;

/**
 * Home preview of the latest transfers this session. Phase 9 persists this
 * to IndexedDB and adds search/filters on the full History page.
 */
export function RecentTransfersCard() {
  // selectRecentTransfers derives a fresh array each call; useShallow keeps
  // the render stable by comparing contents instead of reference identity.
  const records = useActiveTransfersStore(useShallow(selectRecentTransfers)).slice(0, MAX_PREVIEW);

  return (
    <SectionCard
      title="Recent transfers"
      action={
        <Button component={Link} to={ROUTES.history} size="small">
          View all
        </Button>
      }
    >
      {records.length === 0 ? (
        <EmptyState
          icon={<SwapVertRoundedIcon />}
          title="Nothing transferred yet"
          description="Files you send and receive will show up here."
        />
      ) : (
        <List disablePadding>
          {records.map((record) => (
            <ListItem key={record.id} disableGutters>
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: record.status === 'completed' ? 'success.light' : 'error.light',
                    color: '#fff',
                  }}
                >
                  {record.status === 'completed' ? (
                    <CheckCircleRoundedIcon fontSize="small" />
                  ) : (
                    <ErrorRoundedIcon fontSize="small" />
                  )}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={record.name}
                secondary={`${record.direction === 'send' ? 'Sent to' : 'Received from'} ${record.peerName} · ${formatBytes(record.size)}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </SectionCard>
  );
}
