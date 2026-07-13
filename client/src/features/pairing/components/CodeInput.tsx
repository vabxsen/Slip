import { PAIR_CODE_LENGTH } from '@slip/shared';
import { Box, InputBase } from '@mui/material';
import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

type FieldKeyEvent = KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>;

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Called when all cells are filled (auto-submit trigger). */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

/** Accessible segmented 6-digit code entry with paste + backspace handling. */
export function CodeInput({ value, onChange, onComplete, disabled, autoFocus }: CodeInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: PAIR_CODE_LENGTH }, (_, i) => value[i] ?? '');

  const commit = (next: string) => {
    const cleaned = next.replace(/\D/g, '').slice(0, PAIR_CODE_LENGTH);
    onChange(cleaned);
    if (cleaned.length === PAIR_CODE_LENGTH) onComplete?.(cleaned);
  };

  const setDigit = (index: number, digit: string) => {
    const chars = value.split('');
    chars[index] = digit;
    const next = chars.join('').slice(0, PAIR_CODE_LENGTH);
    commit(next);
    if (digit && index < PAIR_CODE_LENGTH - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: FieldKeyEvent) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < PAIR_CODE_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    commit(pasted);
    const target = Math.min(pasted.length, PAIR_CODE_LENGTH - 1);
    refs.current[target]?.focus();
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }} role="group" aria-label="Pair code">
      {digits.map((digit, index) => (
        <InputBase
          key={index}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          inputRef={(el: HTMLInputElement | null) => {
            refs.current[index] = el;
          }}
          onChange={(e) => setDigit(index, e.target.value.replace(/\D/g, '').slice(-1))}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          inputProps={{
            inputMode: 'numeric',
            'aria-label': `Digit ${index + 1}`,
            maxLength: 1,
            style: { textAlign: 'center', padding: 0 },
          }}
          sx={{
            width: { xs: 44, sm: 52 },
            height: { xs: 54, sm: 62 },
            fontSize: '1.6rem',
            fontWeight: 500,
            borderRadius: '12px',
            backgroundColor: 'm3.surfaceContainerHighest',
            border: '2px solid',
            borderColor: digit ? 'primary.main' : 'transparent',
            transition: 'border-color 0.15s',
            '&.Mui-focused': { borderColor: 'primary.main' },
          }}
        />
      ))}
    </Box>
  );
}
