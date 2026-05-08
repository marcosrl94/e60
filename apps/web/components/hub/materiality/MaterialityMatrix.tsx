'use client';

import { useState } from 'react';
import {
  resolveMateriality,
  SCOPE_CATEGORIES_ORDER,
  SCOPE_CATEGORY_LABELS,
  type IndustryMateriality,
  type IndustryMaterialityLevel,
  type NaceSector,
  type ScopeCategory,
} from '@e60/domain';
import { useMaterialityStore } from './store';
import { OverrideModal } from './OverrideModal';

interface MaterialityMatrixProps {
  sectors: NaceSector[];
  catalog: IndustryMateriality[];
}

const LEVEL_BG: Record<IndustryMaterialityLevel, string> = {
  0: 'bg-canvas',
  1: 'bg-nfq-greenBg',
  2: 'bg-nfq-orangeBg',
  3: 'bg-nfq-redBg',
};

const LEVEL_TEXT: Record<IndustryMaterialityLevel, string> = {
  0: 'text-ink-4',
  1: 'text-nfq-green',
  2: 'text-nfq-orange',
  3: 'text-nfq-red',
};

const LEVEL_LABEL: Record<IndustryMaterialityLevel, string> = {
  0: 'Not material',
  1: 'Potential',
  2: 'Material',
  3: 'High',
};

export function MaterialityMatrix({ sectors, catalog }: MaterialityMatrixProps) {
  const orgSectors = useMaterialityStore((s) => s.orgSectors);
  const overrides = useMaterialityStore((s) => s.overrides);

  const [editing, setEditing] = useState<{
    sectorCode: string;
    scopeCategory: ScopeCategory;
  } | null>(null);

  const orgSectorObjs = sectors.filter((s) => orgSectors.includes(s.code));

  if (orgSectorObjs.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-center text-[12px] text-ink-3">
        Pick at least one sector to render the heatmap.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th className="sticky left-0 z-10 bg-panel px-3 py-2 text-left font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                Category
              </th>
              {orgSectorObjs.map((s) => (
                <th
                  key={s.code}
                  className="px-2 py-2 text-center font-mono text-[9.5px] font-semibold tracking-wide text-ink-2"
                  title={s.labelEs}
                >
                  <div>{s.code}</div>
                  <div className="font-normal text-[8.5px] text-ink-3 line-clamp-1 max-w-[120px]">
                    {s.labelEs}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCOPE_CATEGORIES_ORDER.map((cat) => (
              <tr key={cat} className="border-b border-line-soft">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-panel px-3 py-1.5 text-left text-[12px] font-medium text-ink-1"
                >
                  {SCOPE_CATEGORY_LABELS[cat]}
                </th>
                {orgSectorObjs.map((s) => {
                  const r = resolveMateriality(s.code, cat, catalog, overrides);
                  const isOverride = r.source === 'override';
                  const isInherit = r.source === 'inherit' && r.resolvedFrom !== s.code;
                  return (
                    <td key={s.code} className="px-1 py-0.5 text-center">
                      <button
                        type="button"
                        onClick={() => setEditing({ sectorCode: s.code, scopeCategory: cat })}
                        title={[
                          `${LEVEL_LABEL[r.level]} (${r.level})`,
                          r.source === 'override'
                            ? `Override: ${r.notes ?? 'no justification'}`
                            : isInherit
                              ? `Inherited from section ${r.resolvedFrom}`
                              : `${r.source}${r.notes ? ` · ${r.notes}` : ''}`,
                        ].join(' · ')}
                        className={
                          'group relative flex h-9 w-full min-w-[80px] items-center justify-center rounded-md text-[12px] font-semibold transition-shadow ' +
                          LEVEL_BG[r.level] +
                          ' ' +
                          LEVEL_TEXT[r.level] +
                          ' hover:ring-1 hover:ring-ink-3 ' +
                          (isOverride ? 'ring-2 ring-nfq-purple ring-offset-1' : '')
                        }
                      >
                        <span>{r.level}</span>
                        {isInherit && (
                          <span className="absolute right-1 top-0.5 font-mono text-[7.5px] text-ink-4 tracking-tight">
                            ↑{r.resolvedFrom}
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line-soft px-[18px] py-2.5">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-3">
          Legend
        </span>
        {([0, 1, 2, 3] as const).map((lvl) => (
          <span key={lvl} className="flex items-center gap-1.5">
            <span
              className={'inline-block h-3 w-5 rounded-sm ' + LEVEL_BG[lvl]}
            />
            <span className="font-mono text-[10px] text-ink-2">
              {lvl} · {LEVEL_LABEL[lvl]}
            </span>
          </span>
        ))}
        <span className="ml-auto font-mono text-[9.5px] text-ink-3">
          Click a cell to add a per-org override · ring = override · ↑X = inherited from parent section
        </span>
      </div>

      {editing && (
        <OverrideModal
          sectorCode={editing.sectorCode}
          scopeCategory={editing.scopeCategory}
          sectors={sectors}
          catalog={catalog}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
