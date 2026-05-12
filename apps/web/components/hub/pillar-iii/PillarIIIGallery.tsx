'use client';

import { useMemo, useState } from 'react';
import { usePillarTbls } from '@e60/api-client/hooks';
import { TBLS } from './data';
import { TblCard } from './TblCard';
import { TblDrawer } from './TblDrawer';
import type { UserSignoff } from './PillarIIIView';

/**
 * PillarIIIGallery
 *
 * Client wrapper that owns the "currently-open TBL" state. Reads the TBL
 * list (full templates incl. narrative + feedingDatapointIds) via
 * usePillarTbls; the local TBLS const is passed as TanStack Query
 * initialData for seamless SSR. The drawer pulls its `tbl` from the same
 * hook result by `num`, so list and detail share a single source.
 */
export function PillarIIIGallery({
  userSignoffs,
}: {
  userSignoffs: Record<number, UserSignoff[]>;
}) {
  const { data: tbls = TBLS } = usePillarTbls({ initialData: TBLS });
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const selected = useMemo(
    () => tbls.find((t) => t.num === selectedNum) ?? null,
    [tbls, selectedNum],
  );

  const selectedSignoffs = selectedNum
    ? userSignoffs[selectedNum] ?? []
    : [];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 standard:grid-cols-1">
        {tbls.map((t) => (
          <TblCard
            key={t.num}
            tbl={t}
            userSignoffs={userSignoffs[t.num] ?? []}
            onOpen={setSelectedNum}
          />
        ))}
      </div>
      <TblDrawer
        tbl={selected}
        userSignoffs={selectedSignoffs}
        onClose={() => setSelectedNum(null)}
      />
    </>
  );
}
