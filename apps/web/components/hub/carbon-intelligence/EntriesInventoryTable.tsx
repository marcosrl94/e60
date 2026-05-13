'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Scope } from '@e60/domain';
import { Tag, type TagVariant } from '@e60/ui';
import type { OperationalUnit } from '@/lib/operational-units-shared';
import { DataTable } from '@/components/datatable/DataTable';
import type { PersistedEmissionEntry } from './RecentEntriesColumn';

const SCOPE_LABEL: Record<Scope, string> = {
  s1: 'Scope 1',
  s2: 'Scope 2',
  s3: 'Scope 3',
};

const SCOPE_VARIANT: Record<Scope, TagVariant> = {
  s1: 'red',
  s2: 'orange',
  s3: 'blue',
};

const SCOPE_CHIPS: { id: Scope | 'all'; label: string }[] = [
  { id: 'all', label: 'All scopes' },
  { id: 's1', label: 'Scope 1' },
  { id: 's2', label: 'Scope 2' },
  { id: 's3', label: 'Scope 3' },
];

function fmtT(n: number): string {
  if (n === 0) return '0';
  if (n < 1) return n.toFixed(3);
  if (n < 100) return n.toFixed(2);
  return Math.round(n).toLocaleString('en-US');
}

function relativeTime(iso: string): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return iso;
  const min = Math.round((Date.now() - d) / 60000);
  if (min < 60) return `${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d`;
  const mo = Math.round(day / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.round(mo / 12)}y`;
}

function unitShort(units: Map<string, OperationalUnit>, id: string | null): {
  label: string;
  full: string;
} {
  if (!id) return { label: '—', full: 'Unattributed' };
  const u = units.get(id);
  if (!u) return { label: '—', full: 'Unknown' };
  return {
    label: u.shortCode ?? u.name,
    full: u.name + (u.country ? ` · ${u.country}` : ''),
  };
}

/**
 * Carbon Intelligence · all entries TanStack table.
 *
 * Replaces the dashboard-y 3-column grid as the source-of-truth view
 * once a user has more than a handful of entries. Receives the already
 * filtered set (by disclosure / location URL params) so the table is
 * a pure presentation layer; sort + search live client-side.
 */
export function EntriesInventoryTable({
  entries,
  units,
}: {
  entries: PersistedEmissionEntry[];
  units: OperationalUnit[];
}) {
  const [scopeFilter, setScopeFilter] = useState<Scope | 'all'>('all');
  const [search, setSearch] = useState('');

  const unitMap = useMemo(
    () => new Map(units.map((u) => [u.id, u] as const)),
    [units],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (scopeFilter !== 'all' && e.scope !== scopeFilter) return false;
      if (q) {
        const hay =
          `${e.activityLabel} ${e.category} ${e.factorSource}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [entries, scopeFilter, search]);

  const totalTco2e = useMemo(
    () => filtered.reduce((acc, e) => acc + (e.tco2e ?? 0), 0),
    [filtered],
  );

  const columns: ColumnDef<PersistedEmissionEntry>[] = useMemo(
    () => [
      {
        id: 'scope',
        header: 'Scope',
        size: 90,
        accessorKey: 'scope',
        cell: ({ row }) => {
          const e = row.original;
          return (
            <span className="inline-flex items-center gap-1">
              <Tag variant={SCOPE_VARIANT[e.scope]}>{SCOPE_LABEL[e.scope]}</Tag>
              {e.scope === 's2' && e.scope2Method && (
                <span className="font-mono text-[9.5px] text-ink-3">
                  {e.scope2Method === 'market_based' ? 'MB' : 'LB'}
                </span>
              )}
            </span>
          );
        },
      },
      {
        id: 'activity',
        header: 'Activity',
        accessorKey: 'activityLabel',
        cell: ({ row }) => {
          const e = row.original;
          return (
            <div className="flex min-w-0 flex-col gap-[1px]">
              <span className="line-clamp-1 text-[12px] text-ink-1">
                {e.activityLabel}
              </span>
              <span className="line-clamp-1 font-mono text-[9.5px] text-ink-3 tracking-wide">
                {e.category} · {e.factorSource}
              </span>
            </div>
          );
        },
      },
      {
        id: 'location',
        header: 'Location',
        size: 110,
        enableSorting: false,
        cell: ({ row }) => {
          const u = unitShort(unitMap, row.original.operationalUnitId);
          return (
            <span
              title={u.full}
              className="font-mono text-[10.5px] tracking-wide text-ink-2"
            >
              {u.label}
            </span>
          );
        },
      },
      {
        id: 'quantity',
        header: 'Quantity',
        size: 110,
        meta: { align: 'right' },
        accessorFn: (e) => e.quantityInput,
        cell: ({ row }) => {
          const e = row.original;
          return (
            <span className="font-mono text-[11px] tabular-nums text-ink-1">
              {e.quantityInput.toLocaleString('en-US', {
                maximumFractionDigits: 3,
              })}
              <span className="ml-1 text-ink-3">{e.quantityInputUnit}</span>
            </span>
          );
        },
      },
      {
        id: 'tco2e',
        header: 'tCO₂e',
        size: 95,
        meta: { align: 'right' },
        accessorKey: 'tco2e',
        cell: ({ row }) => (
          <span className="font-mono text-[11.5px] tabular-nums font-semibold text-ink-1">
            {fmtT(row.original.tco2e)}
          </span>
        ),
      },
      {
        id: 'bindings',
        header: 'Feeds',
        size: 110,
        enableSorting: false,
        cell: ({ row }) => {
          const b = row.original.disclosureBindings;
          if (b.length === 0) return <span className="text-ink-4">—</span>;
          const first = b[0]!;
          const rest = b.length - 1;
          return (
            <span
              title={b.join(', ')}
              className="inline-flex items-center gap-1 font-mono text-[10px] text-nfq-purple"
            >
              {first}
              {rest > 0 && (
                <span className="text-ink-3">+{rest}</span>
              )}
            </span>
          );
        },
      },
      {
        id: 'created',
        header: 'Created',
        size: 80,
        meta: { align: 'right' },
        accessorKey: 'createdAt',
        cell: ({ row }) => (
          <span
            title={new Date(row.original.createdAt).toLocaleString('en-GB')}
            className="font-mono text-[10.5px] tabular-nums text-ink-2"
          >
            {relativeTime(row.original.createdAt)}
          </span>
        ),
      },
    ],
    [unitMap],
  );

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line-soft px-[18px] py-[10px]">
        {SCOPE_CHIPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScopeFilter(s.id)}
            className={
              scopeFilter === s.id
                ? 'rounded-md border border-ink-1 bg-ink-1 px-2.5 py-[5px] text-[11px] font-medium text-white'
                : 'rounded-md border border-line bg-panel px-2.5 py-[5px] text-[11px] font-medium text-ink-2 hover:border-ink-5 hover:text-ink-1'
            }
          >
            {s.label}
          </button>
        ))}
        <input
          type="search"
          value={search}
          placeholder="Search activity, category, source…"
          onChange={(e) => setSearch(e.target.value)}
          className="ml-2 w-[200px] rounded-md border border-line bg-panel px-2 py-[5px] font-mono text-[11px] text-ink-1 placeholder:text-ink-4 focus:border-ink-3 focus:outline-none"
        />
        <div className="ml-auto font-mono text-[10.5px] tracking-wide text-ink-3">
          <span className="text-ink-1">
            {filtered.length.toLocaleString('en-US')}
          </span>
          {' entries · '}
          <strong className="font-medium text-ink-1 tabular-nums">
            {fmtT(totalTco2e)} tCO₂e
          </strong>{' '}
          total
        </div>
      </div>
      <div className="h-[calc(100vh-440px)] min-h-[300px]">
        {filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 px-8 text-center">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
              No entries match
            </div>
            <p className="max-w-[320px] text-[12px] leading-relaxed text-ink-3">
              {entries.length === 0
                ? 'No emission entries captured yet. Use the "+ New entry" button at the top right.'
                : 'Adjust the scope filter or clear the search to see more.'}
            </p>
          </div>
        ) : (
          <DataTable
            data={filtered}
            columns={columns}
            rowHeight={44}
            getRowId={(e) => e.id}
            initialSorting={[{ id: 'created', desc: true }]}
          />
        )}
      </div>
    </div>
  );
}
