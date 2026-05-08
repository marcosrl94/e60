import { Tag } from '@e60/ui';
import { HeroFlow } from './HeroFlow';
import { OutputsGallery } from './OutputsGallery';

/**
 * Output Generators · server component
 *
 * Renders the static header and hero flow server-side; delegates the gallery
 * + disclosure drawer to a client component (OutputsGallery) that owns the
 * "currently-open disclosure" state and imports DISCLOSURES directly so the
 * inline preview React components don't cross the server↔client boundary.
 */
export function OutputsView() {
  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-6">
        <div>
          <h1 className="mb-1 text-[24px] font-semibold leading-tight tracking-tight text-ink-1">
            Output Generators
          </h1>
          <div className="font-mono text-[11.5px] tracking-wide text-ink-3">
            Report once, publish many ·{' '}
            <strong className="font-medium text-ink-1">
              1 datapoint repository → 8 frameworks
            </strong>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tag variant="green">Live</Tag>
          <span className="font-mono text-[10px] tracking-wide text-ink-2">
            12 disclosures Q4
          </span>
        </div>
      </div>

      <HeroFlow />

      <div className="mb-3 flex items-center gap-3">
        <div>
          <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-2">
            Disclosure Catalogue
          </div>
          <div className="font-mono text-[10.5px] tracking-wide text-ink-3">
            5 published · 3 in preparation · 2 scheduled
          </div>
        </div>
      </div>

      <OutputsGallery />
    </>
  );
}
