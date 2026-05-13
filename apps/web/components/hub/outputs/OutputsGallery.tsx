import { DISCLOSURES } from './data';
import { DisclosureCard } from './DisclosureCard';
import type { DisclosureMetrics } from './metrics';

interface OutputsGalleryProps {
  metrics: Record<string, DisclosureMetrics>;
}

/**
 * OutputsGallery
 *
 * Each card links to `/disclosure-hub/outputs/<id>` (the A4 preview
 * view). Server component — no client state needed. The legacy
 * `DisclosureDrawer` stays in source but is no longer wired from
 * here.
 */
export function OutputsGallery({ metrics }: OutputsGalleryProps) {
  return (
    <div className="grid grid-cols-3 gap-4 standard:grid-cols-2 cramped:grid-cols-1">
      {DISCLOSURES.map((d) => (
        <DisclosureCard
          key={d.id}
          data={d}
          metrics={metrics[d.id]}
          href={`/disclosure-hub/outputs/${d.id}`}
        />
      ))}
    </div>
  );
}
