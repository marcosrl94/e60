'use client';

import { useMemo, useState } from 'react';
import { DISCLOSURES } from './data';
import { DisclosureCard } from './DisclosureCard';
import { DisclosureDrawer } from './DisclosureDrawer';

/**
 * OutputsGallery
 *
 * Client wrapper that owns the "currently-open disclosure" state. Imports
 * DISCLOSURES directly (rather than receiving it as a prop) so the inline
 * preview React components don't cross the server↔client boundary.
 */
export function OutputsGallery() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => DISCLOSURES.find((d) => d.id === selectedId) ?? null,
    [selectedId],
  );
  return (
    <>
      <div className="grid grid-cols-3 gap-4 standard:grid-cols-2 cramped:grid-cols-1">
        {DISCLOSURES.map((d) => (
          <DisclosureCard key={d.id} data={d} onOpen={setSelectedId} />
        ))}
      </div>
      <DisclosureDrawer
        disclosure={selected}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
