import type { Datapoint } from '@e60/domain';
import seed from '@/data/seed/datapoints.json';
import {
  applyDemoOverlay,
  statsFor,
} from '@/components/hub/repository/demo-overlay';
import { RepositoryView } from '@/components/hub/repository/RepositoryView';

/**
 * Disclosure Hub · Datapoint Repository
 *
 * Phase 2 of the migration plan. The seed JSON is the official EFRAG IG 3
 * list (1184 ESRS datapoints, downloaded 2026-05-08). Status + value +
 * mappings are layered on top by `applyDemoOverlay` so the catalogue feels
 * alive without a backend wired up. Replace that overlay once the API is
 * available.
 */
const datapoints = applyDemoOverlay(seed as unknown as Datapoint[]);
const stats = statsFor(datapoints);

export default function RepositoryPage() {
  const captured = stats.live + stats.partial;
  const pending = stats.pending + stats.blocked;
  return (
    <RepositoryView
      datapoints={datapoints}
      capturedTotal={captured}
      pendingTotal={pending}
    />
  );
}
