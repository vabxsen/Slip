import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

export type DirectionFilter = 'all' | 'send' | 'receive';
export type StatusFilter = 'all' | 'completed' | 'cancelled' | 'failed';

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
      <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
        <ToggleButtonGroup
          size="small"
          exclusive
          value={direction}
          onChange={(_, value: DirectionFilter | null) => value && onDirectionChange(value)}
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
