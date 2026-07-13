import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import { Button } from '@mui/material';
import { Link } from 'react-router';
import { ROUTES } from '@/app/router/paths';
import { EmptyState } from '@/components/EmptyState';
import { SectionCard } from '@/components/SectionCard';

/**
 * Home preview of the latest transfers. Reads real history once the
 * IndexedDB-backed store lands in Phase 9 — until then, the empty state.
 */
export function RecentTransfersCard() {
  return (
    <SectionCard
      title="Recent transfers"
      action={
        <Button component={Link} to={ROUTES.history} size="small">
          View all
        </Button>
      }
    >
      <EmptyState
        icon={<SwapVertRoundedIcon />}
        title="Nothing transferred yet"
        description="Files you send and receive will show up here."
      />
    </SectionCard>
  );
}
