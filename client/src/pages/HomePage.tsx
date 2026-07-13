import { PagePlaceholder } from '@/components/PagePlaceholder';
import { ServerStatusChip } from '@/components/ServerStatusChip';

export function HomePage() {
  return (
    <PagePlaceholder
      title="Home"
      description="Device identity, QR code, pair code, connected devices, and the drop zone land here in Phase 5."
    >
      <ServerStatusChip />
    </PagePlaceholder>
  );
}
