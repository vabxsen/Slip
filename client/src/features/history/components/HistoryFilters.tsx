import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

export type DirectionFilter = 'all' | 'send' | 'receive';
export type StatusFilter = 'all' | 'completed' | 'cancelled' | 'failed';

/** Breaks ToggleButtonGroup's default fused-border look so each button reads as its own separate pill. */
const separatedGroupSx: SxProps<Theme> = {
  gap: 1,
  flexWrap: 'wrap',
  '& .MuiToggleButtonGroup-grouped': {
    margin: 0,
    border: '1px solid',
    borderColor: 'm3.outlineVariant',
    borderRadius: '999px !important',
  },
};

interface HistoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  direction: DirectionFilter;
  onDirectionChange: (value: DirectionFilter) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
}

export function HistoryFilters({
  search,
  onSearchChange,
  direction,
  onDirectionChange,
  status,
  onStatusChange,
}: HistoryFiltersProps) {
  return (
    <Stack spacing={1.5}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search by filename"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <Stack spacing={2}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={direction}
          onChange={(_, value: DirectionFilter | null) => value && onDirectionChange(value)}
          sx={separatedGroupSx}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="send">Sent</ToggleButton>
          <ToggleButton value="receive">Received</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={status}
          onChange={(_, value: StatusFilter | null) => value && onStatusChange(value)}
          sx={separatedGroupSx}
        >
          <ToggleButton value="all">Any status</ToggleButton>
          <ToggleButton value="completed">Completed</ToggleButton>
          <ToggleButton value="cancelled">Cancelled</ToggleButton>
          <ToggleButton value="failed">Failed</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Stack>
  );
}
