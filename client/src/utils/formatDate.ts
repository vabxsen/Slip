/** Formats a timestamp for display, e.g. "Jul 14, 2026, 3:42 PM". */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
