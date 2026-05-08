'use client';

import { useMemo, useState } from 'react';
import { usePillarTbls } from '@e60/api-client/hooks';
import { TBLS } from './data';
import { TblCard } from './TblCard';
import { TblDrawer } from './TblDrawer';

/**
 * PillarIIIGallery
 *
 * Client wrapper that owns the "currently-open TBL" state.
 *
 * Cards in the list view come from the API summary endpoint
 * (/pillar-iii/tbls), with the local TBLS const passed as TanStack Query
 * initialData so SSR + client are seamless. The drawer reads the FULL
 * template (narrative, feeding datapoint ids…) from the local const since
 * those fields aren't part of the public list payload.
 */
export function PillarIIIGallery() {
  const initial = useMemo(
    () =>
      TBLS.map((t) => ({
        num: t.num,
        code: t.code,
        title: t.title,
        summary: t.summary,
        family: t.family,
        status: t.status,
        datapointCount: t.datapointCount,
        rowCount: t.rowCount,
        signoff: t.signoff,
        deadline: t.deadline,
      })),
    [],
  );
  const { data: tbls = initial } = usePillarTbls({ initialData: initial });

  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const selected = useMemo(
    () => TBLS.find((t) => t.num === selectedNum) ?? null,
    [selectedNum],
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-3 standard:grid-cols-1">
        {tbls.map((t) => (
          <TblCard key={t.num} tbl={t} onOpen={setSelectedNum} />
        ))}
      </div>
      <TblDrawer tbl={selected} onClose={() => setSelectedNum(null)} />
    </>
  );
}
