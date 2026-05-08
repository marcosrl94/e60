'use client';

import { useMemo, useState } from 'react';
import type { NaceSector } from '@e60/domain';
import { useNaceSectors } from '@e60/api-client/hooks';
import { useMaterialityStore } from './store';

interface SectorPickerProps {
  initialSectors: NaceSector[];
}

/**
 * SectorPicker
 *
 * Multi-select for the organisation's NACE sectors. Drives every other
 * Materiality Studio block (heatmap rows, hotspot list, override modal).
 *
 * UI: search + scope-by-section grouping, ticked items show on top.
 *
 * Reads sectors via useNaceSectors with the seed as initialData so SSR HTML
 * renders immediately. TanStack Query dedupes the network call across this
 * component and MaterialityMatrix.
 */
export function SectorPicker({ initialSectors }: SectorPickerProps) {
  const { data: sectors = initialSectors } = useNaceSectors({
    initialData: initialSectors,
  });
  const orgSectors = useMaterialityStore((s) => s.orgSectors);
  const toggleSector = useMaterialityStore((s) => s.toggleSector);
  const [search, setSearch] = useState('');

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = sectors.filter((s) => {
      if (!q) return true;
      const hay = `${s.code} ${s.labelEs} ${s.labelEn}`.toLowerCase();
      return hay.includes(q);
    });
    // Group by section letter
    const map = new Map<string, NaceSector[]>();
    for (const s of filtered) {
      const section = s.code.split('.')[0]!;
      if (!map.has(section)) map.set(section, []);
      map.get(section)!.push(s);
    }
    // Sort: section header first, divisions after
    for (const [, arr] of map) {
      arr.sort((a, b) => {
        if (a.level !== b.level) return a.level === 'section' ? -1 : 1;
        return a.code.localeCompare(b.code);
      });
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [sectors, search]);

  const selected = sectors.filter((s) => orgSectors.includes(s.code));

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {selected.length === 0 ? (
          <span className="font-mono text-[10.5px] text-ink-3">
            No sectors selected · pick at least one to see the matrix.
          </span>
        ) : (
          selected.map((s) => (
            <button
              key={s.code}
              type="button"
              onClick={() => toggleSector(s.code)}
              title={`Remove ${s.code}`}
              className="inline-flex items-center gap-1 rounded-md bg-nfq-purpleBg px-2 py-[3px] font-mono text-[10.5px] font-medium text-nfq-purple hover:bg-nfq-purple/20"
            >
              <span>{s.code}</span>
              <span className="text-nfq-purple/70">·</span>
              <span className="line-clamp-1 max-w-[180px] text-[10.5px] font-normal">
                {s.labelEs}
              </span>
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
              </svg>
            </button>
          ))
        )}
      </div>

      <input
        type="search"
        value={search}
        placeholder="Buscar por código o nombre (banca, refino, K.64…)"
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2 w-full rounded-md border border-line bg-panel px-2 py-[6px] font-mono text-[11px] text-ink-1 placeholder:text-ink-4 focus:border-ink-3 focus:outline-none"
      />

      <div className="max-h-[260px] overflow-auto rounded-md border border-line">
        {grouped.map(([section, items]) => (
          <div key={section}>
            <div className="sticky top-0 z-10 border-b border-line-soft bg-panel-soft px-3 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
              Section {section}
            </div>
            {items.map((s) => {
              const checked = orgSectors.includes(s.code);
              return (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => toggleSector(s.code)}
                  className={
                    'flex w-full items-center gap-2 border-b border-line-soft px-3 py-1.5 text-left last:border-b-0 ' +
                    (checked ? 'bg-nfq-purpleBg/40' : 'hover:bg-panel-hover')
                  }
                >
                  <span
                    className={
                      'flex h-3.5 w-3.5 items-center justify-center rounded-sm border ' +
                      (checked
                        ? 'border-nfq-purple bg-nfq-purple text-white'
                        : 'border-line bg-panel')
                    }
                  >
                    {checked && (
                      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3 6l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="font-mono text-[10.5px] tracking-wide text-ink-2">
                    {s.code}
                  </span>
                  <span className="flex-1 line-clamp-1 text-[12px] text-ink-1">
                    {s.labelEs}
                  </span>
                  {s.level === 'division' && (
                    <span className="font-mono text-[9px] uppercase tracking-wide text-ink-4">
                      div.
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="px-3 py-6 text-center text-[12px] text-ink-3">
            No sectors match.
          </div>
        )}
      </div>
    </div>
  );
}
