import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { Button, List, Stack, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { PageTransition } from '@/components/PageTransition';
import { showToast } from '@/store/toastStore';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuthStore } from '@/features/auth/store/authStore';
import { clearHistoryInCloud } from '@/services/firestore/historyCloud';
import { clearHistory } from '@/services/storage/historyDb';
import { ClearHistoryDialog } from '@/features/history/components/ClearHistoryDialog';
import {
  HistoryFilters,
  type DirectionFilter,
  type StatusFilter,
} from '@/features/history/components/HistoryFilters';
import { HistoryListItem } from '@/features/history/components/HistoryListItem';
import { HISTORY_QUERY_KEY, useHistoryQuery } from '@/features/history/hooks/useHistoryQuery';
import { queryClient } from '@/app/queryClient';

export function HistoryPage() {
  usePageTitle('History');

  const { data: records, isLoading } = useHistoryQuery();
  const [search, setSearch] = useState('');
  const [direction, setDirection] = useState<DirectionFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!records) return [];
    const term = search.trim().toLowerCase();
    return records.filter((record) => {
      if (term && !record.name.toLowerCase().includes(term)) return false;
      if (direction !== 'all' && record.direction !== direction) return false;
      if (status !== 'all' && record.status !== status) return false;
      return true;
    });
  }, [records, search, direction, status]);

  const hasAnyRecords = (records?.length ?? 0) > 0;

  const handleClear = async () => {
    // Cloud first: the live history listener re-saves whatever it sees in
    // Firestore into IndexedDB, so clearing local before cloud would let
    // the just-cleared records sync straight back.
    const uid = useAuthStore.getState().user?.uid;
    if (uid) await clearHistoryInCloud(uid);
    await clearHistory();
    await queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY });
    showToast('Transfer history cleared', 'success');
  };

  return (
    <PageTransition>
      <Stack spacing={2.5} sx={{ maxWidth: 720, mx: 'auto' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="h1" fontWeight={500}>
            History
          </Typography>
          {hasAnyRecords && (
            <Button
              size="small"
              color="inherit"
              startIcon={<DeleteOutlineRoundedIcon fontSize="small" />}
              onClick={() => setClearDialogOpen(true)}
            >
              Clear
            </Button>
          )}
        </Stack>

        {hasAnyRecords && (
          <HistoryFilters
            search={search}
            onSearchChange={setSearch}
            direction={direction}
            onDirectionChange={setDirection}
            status={status}
            onStatusChange={setStatus}
          />
        )}

        {!isLoading && !hasAnyRecords && (
          <EmptyState
            icon={<HistoryRoundedIcon />}
            title="No transfers yet"
            description="Completed, cancelled, and failed transfers will show up here."
          />
        )}

        {hasAnyRecords && filtered.length === 0 && (
          <EmptyState
            icon={<HistoryRoundedIcon />}
            title="No matches"
            description="Try a different search term or filter."
          />
        )}

        <List disablePadding>
          <AnimatePresence initial={false}>
            {filtered.map((record) => (
              <motion.div
                key={record.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <HistoryListItem record={record} />
              </motion.div>
            ))}
          </AnimatePresence>
        </List>
      </Stack>

      <ClearHistoryDialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        onConfirm={() => void handleClear()}
      />
    </PageTransition>
  );
}
