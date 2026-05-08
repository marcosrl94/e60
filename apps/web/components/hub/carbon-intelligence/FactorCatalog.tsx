'use client';

import { useMemo, useState } from 'react';
import type { EmissionFactor, FactorSource, Scope } from '@e60/domain';
import { Tag } from '@e60/ui';

interface FactorCatalogProps {
  factors: EmissionFactor[];
}

const SCOPE_LABEL: Record<Scope, string> = {
  s1: 'Scope 1',
  s2: 'Scope 2',
  s3: 'Scope 3',
};

const SCOPE_VARIANT: Record<Scope, 'red' | 'orange' | 'blue'> = {
  s1: 'red',
  s2: 'orange',
  s3: 'blue',
};

const SOURCE_VARIANT: Record<FactorSource, 'green' | 'blue' | 'purple'> = {
  IDAE: 'blue',
  MITECO: 'green',
  DEFRA: 'purple',
};

type ScopeFilter = Scope | 'all';
type SourceFilter = FactorSource | 'all';

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'rounded-md border border-ink-1 bg-ink-1 px-2.5 py-[5px] text-[11px] font-medium text-white transition-colors'
          : 'rounded-md border border-line bg-panel px-2.5 py-[5px] text-[11px] font-medium text-ink-2 transition-colors hover:border-ink-5 hover:text-ink-1'
      }
    >
      {children}
    </button>
  );
}

export function FactorCatalog({ factors }: FactorCatalogProps) {
  const [scope, setScope] = useState<ScopeFilter>('all');
  const [source, setSource] = useState<SourceFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return factors.filter((f) => {
      if (scope !== 'all' && f.scope !== scope) return false;
      if (source !== 'all' && f.source !== source) return false;
      if (q) {
        const hay =
          `${f.activityKey} ${f.activityLabel} ${f.category} ${f.subcategory ?? ''} ${f.region}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [factors, scope, source, search]);

  const hasActiveFilters = scope !== 'all' || source !== 'all' || search.trim().length > 0;
  function clearFilters() {
    setScope('all');
    setSource('all');
    setSearch('');
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line-soft px-[18px] py-[10px]">
        <FilterChip active={scope === 'all'} onClick={() => setScope('all')}>
          All scopes
        </FilterChip>
        {(['s1', 's2', 's3'] as const).map((s) => (
          <FilterChip key={s} active={scope === s} onClick={() => setScope(s)}>
            {SCOPE_LABEL[s]}
          </FilterChip>
        ))}
        <span className="mx-1 h-4 w-px bg-line" aria-hidden />
        <FilterChip active={source === 'all'} onClick={() => setSource('all')}>
          Any source
        </FilterChip>
        {(['IDAE', 'MITECO', 'DEFRA'] as const).map((s) => (
          <FilterChip key={s} active={source === s} onClick={() => setSource(s)}>
            {s}
          </FilterChip>
        ))}
        <input
          type="search"
          value={search}
          placeholder="Search activity, category, region…"
          onChange={(e) => setSearch(e.target.value)}
          className="ml-2 w-[200px] rounded-md border border-line bg-panel px-2 py-[5px] font-mono text-[11px] text-ink-1 placeholder:text-ink-4 focus:border-ink-3 focus:outline-none"
        />
        <div className="ml-auto font-mono text-[10.5px] tracking-wide text-ink-3">
          <span className="text-ink-1">{filtered.length}</span>
          {' / '}
          {factors.length} factors
        </div>
      </div>

      <div className="max-h-[420px] overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-panel">
            <tr className="border-b border-line">
              {['Activity', 'Scope', 'Category', 'Factor', 'Source', 'Region · year'].map(
                (h, i) => (
                  <th
                    key={h}
                    className={
                      'px-[14px] py-[9px] text-left font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3 ' +
                      (i === 3 ? 'text-right' : '')
                    }
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr
                key={f.activityKey}
                className="border-b border-line-soft hover:bg-panel-hover"
              >
                <td className="px-[14px] py-2 align-middle">
                  <div className="text-[12px] text-ink-1">{f.activityLabel}</div>
                  <div className="font-mono text-[9.5px] text-ink-3 tracking-wide">
                    {f.activityKey}
                  </div>
                </td>
                <td className="px-[14px] py-2 align-middle">
                  <Tag variant={SCOPE_VARIANT[f.scope]}>{SCOPE_LABEL[f.scope]}</Tag>
                </td>
                <td className="px-[14px] py-2 align-middle text-[12px] text-ink-2">
                  {f.category}
                  {f.subcategory && (
                    <span className="text-ink-3"> · {f.subcategory}</span>
                  )}
                </td>
                <td className="px-[14px] py-2 text-right align-middle">
                  <span className="font-mono text-[12px] tabular-nums text-ink-1">
                    {f.efValue.toLocaleString('en-US', { maximumFractionDigits: 5 })}
                  </span>
                  <span className="ml-1 font-mono text-[9.5px] text-ink-3">
                    kgCO₂e/{f.efUnit}
                  </span>
                </td>
                <td className="px-[14px] py-2 align-middle">
                  <Tag variant={SOURCE_VARIANT[f.source]}>{f.source}</Tag>
                  {f.sourceVersion && (
                    <div className="mt-0.5 font-mono text-[9px] text-ink-3 tracking-wide">
                      {f.sourceVersion}
                    </div>
                  )}
                </td>
                <td className="px-[14px] py-2 align-middle font-mono text-[10.5px] text-ink-2 tracking-wide">
                  {f.region} · {f.year}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-[14px] py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                      No factors match
                    </div>
                    <p className="max-w-[320px] text-[11.5px] leading-relaxed text-ink-3">
                      Try a different scope or source, or clear the search input.
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-1 rounded-md border border-line bg-panel px-3 py-1.5 text-[12px] font-medium text-ink-1 hover:border-ink-5"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
