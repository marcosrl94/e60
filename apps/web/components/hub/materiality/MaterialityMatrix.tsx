'use client';

import { useState } from 'react';
import {
  resolveMateriality,
  SCOPE_CATEGORIES_ORDER,
  SCOPE_CATEGORY_LABELS,
  type IndustryMateriality,
  type IndustryMaterialityLevel,
  type NaceSector,
  type OrgMaterialityOverride,
  type ScopeCategory,
} from '@e60/domain';
import {
  useIndustryMateriality,
  useNaceSectors,
} from '@e60/api-client/hooks';
import { useMaterialityStore } from './store';
import { OverrideModal } from './OverrideModal';

interface MaterialityMatrixProps {
  initialSectors: NaceSector[];
  initialCatalogue: IndustryMateriality[];
  /** User overrides — fetched server-side, refreshed via revalidatePath. */
  overrides: OrgMaterialityOverride[];
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

export function MaterialityMatrix({
  initialSectors,
  initialCatalogue,
  overrides,
}: MaterialityMatrixProps) {
  const { data: sectors = initialSectors } = useNaceSectors({
    initialData: initialSectors,
  });
  const { data: catalog = initialCatalogue } = useIndustryMateriality({
    initialData: initialCatalogue,
  });
  const orgSectors = useMaterialityStore((s) => s.orgSectors);

  const [editing, setEditing] = useState<{
    sectorCode: string;
    scopeCategory: ScopeCategory;
  } | null>(null);
  const [compact, setCompact] = useState(false);

  const orgSectorObjs = sectors.filter((s) => orgSectors.includes(s.code));

  if (orgSectorObjs.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-center text-[12px] text-ink-3">
        Pick at least one sector to render the heatmap.
      </div>
    );
  }

  // Compact density tightens cell height, hides the big number in
  // favour of color-only encoding, and shrinks the sector label row.
  // Useful when there are 5+ org sectors and the matrix grows tall.
  const cellH = compact ? 'h-5' : 'h-9';
  const cellText = compact ? 'text-[9px]' : 'text-[12px]';
  const cellMinW = compact ? 'min-w-[44px]' : 'min-w-[80px]';
  const cellRow = compact ? 'py-px' : 'py-0.5';
  const headPad = compact ? 'px-2 py-1' : 'px-2 py-2';
  const rowHeadPad = compact ? 'px-3 py-1' : 'px-3 py-1.5';
  const rowHeadText = compact ? 'text-[11px]' : 'text-[12px]';

  return (
    <>
      {/* Density toggle */}
      <div className="mb-2 flex items-center justify-end gap-1.5 px-1">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-3">
          Density
        </span>
        <div
          role="radiogroup"
          aria-label="Heatmap density"
          className="inline-flex rounded-md border border-line bg-panel p-0.5"
        >
          <button
            type="button"
            role="radio"
            aria-checked={!compact}
            onClick={() => setCompact(false)}
            className={
              'rounded px-2 py-[3px] text-[10.5px] font-medium transition-colors ' +
              (!compact
                ? 'bg-ink-1 text-white'
                : 'text-ink-2 hover:text-ink-1')
            }
          >
            Standard
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={compact}
            onClick={() => setCompact(true)}
            className={
              'rounded px-2 py-[3px] text-[10.5px] font-medium transition-colors ' +
              (compact
                ? 'bg-ink-1 text-white'
                : 'text-ink-2 hover:text-ink-1')
            }
          >
            Compact
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th
                className={
                  'sticky left-0 z-10 bg-panel text-left font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3 ' +
                  headPad
                }
              >
                Category
              </th>
              {orgSectorObjs.map((s) => (
                <th
                  key={s.code}
                  className={
                    'text-center font-mono text-[9.5px] font-semibold tracking-wide text-ink-2 ' +
                    headPad
                  }
                  title={s.labelEs}
                >
                  <div>{s.code}</div>
                  {!compact && (
                    <div className="font-normal text-[8.5px] text-ink-3 line-clamp-1 max-w-[120px]">
                      {s.labelEs}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCOPE_CATEGORIES_ORDER.map((cat) => (
              <tr key={cat} className="border-b border-line-soft">
                <th
                  scope="row"
                  className={
                    'sticky left-0 z-10 bg-panel text-left font-medium text-ink-1 ' +
                    rowHeadPad +
                    ' ' +
                    rowHeadText
                  }
                >
                  {SCOPE_CATEGORY_LABELS[cat]}
                </th>
                {orgSectorObjs.map((s) => {
                  const r = resolveMateriality(s.code, cat, catalog, overrides);
                  const isOverride = r.source === 'override';
                  const isInherit = r.source === 'inherit' && r.resolvedFrom !== s.code;
                  return (
                    <td key={s.code} className={'px-1 text-center ' + cellRow}>
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
                          'group relative flex w-full items-center justify-center rounded-md font-semibold transition-shadow ' +
                          cellH +
                          ' ' +
                          cellMinW +
                          ' ' +
                          cellText +
                          ' ' +
                          LEVEL_BG[r.level] +
                          ' ' +
                          LEVEL_TEXT[r.level] +
                          ' hover:ring-1 hover:ring-ink-3 ' +
                          (isOverride ? 'ring-2 ring-nfq-purple ring-offset-1' : '')
                        }
                      >
                        {!compact && <span>{r.level}</span>}
                        {isInherit && !compact && (
                          <span className="absolute right-1 top-0.5 font-mono text-[7.5px] text-ink-4 tracking-tight">
                            ↑{r.resolvedFrom}
                          </span>
                        )}
                        {compact && isInherit && (
                          <span className="absolute right-px top-px h-1 w-1 rounded-full bg-ink-4" />
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
          overrides={overrides}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
