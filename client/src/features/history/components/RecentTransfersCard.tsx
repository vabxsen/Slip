import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import { Button, List } from '@mui/material';
import { Link } from 'react-router';
import { ROUTES } from '@/app/router/paths';
import { EmptyState } from '@/components/EmptyState';
import { SectionCard } from '@/components/SectionCard';
import { useHistoryQuery } from '../hooks/useHistoryQuery';
import { HistoryListItem } from './HistoryListItem';

const MAX_PREVIEW = 5;

/**
 * Home preview of the latest persisted transfers — reads the same IndexedDB
 * history as the full History page, so it survives reloads.
 */
export function RecentTransfersCard() {
  const { data: records } = useHistoryQuery();
  const preview = records?.slice(0, MAX_PREVIEW) ?? [];

  return (
    <SectionCard
      title="Recent transfers"
      action={
        <Button component={Link} to={ROUTES.history} size="small">
          View all
        </Button>
      }
    >
      {preview.length === 0 ? (
        <EmptyState
          icon={<SwapVertRoundedIcon />}
          title="Nothing transferred yet"
          description="Files you send and receive will show up here."
        />
      ) : (
        <List disablePadding>
          {preview.map((record) => (
            <HistoryListItem key={record.id} record={record} />
          ))}
        </List>
      )}
    </SectionCard>
  );
}
