'use client';

import { useMemo, useState } from 'react';
import { TBLS } from './data';
import { TblCard } from './TblCard';
import { TblDrawer } from './TblDrawer';

/**
 * PillarIIIGallery
 *
 * Client wrapper that owns the "currently-open TBL" state. Imports TBLS
 * directly so the static template content stays out of the server↔client
 * boundary.
 */
export function PillarIIIGallery() {
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const selected = useMemo(
    () => TBLS.find((t) => t.num === selectedNum) ?? null,
    [selectedNum],
  );
  return (
    <>
      <div className="grid grid-cols-2 gap-3 standard:grid-cols-1">
        {TBLS.map((t) => (
          <TblCard key={t.num} tbl={t} onOpen={setSelectedNum} />
        ))}
      </div>
      <TblDrawer tbl={selected} onClose={() => setSelectedNum(null)} />
    </>
  );
}
