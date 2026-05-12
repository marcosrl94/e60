'use client';

import { useMemo } from 'react';
import { Panel, Tag } from '@e60/ui';
import type { Datapoint, RegulatoryCrosswalk } from '@e60/domain';
import { useDatapoints } from '@e60/api-client/hooks';
import { DataTable } from '@/components/datatable/DataTable';
import { datapointColumns } from './columns';
import { DatapointDrawer } from './DatapointDrawer';
import {
  topicCategory,
  useRepositoryFilters,
  type CategoryFilter,
  type ScopeFilter,
} from './store';

interface RepositoryViewProps {
  /**
   * Seed datapoints with the demo overlay applied. Passed as TanStack
   * Query initialData so SSR HTML is populated immediately and the
   * client refetches the catalogue from Supabase in the background.
   */
  initialDatapoints: Datapoint[];
  capturedTotal: number;
  pendingTotal: number;
  /**
   * Set of EFRAG datapoint ids feeding an IRO whose parent matter is
   * declared material in the user's active DMA. Used by the
   * "Material IROs" filter chip; computed server-side via
   * lib/dma-derived.ts.
   */
  materialDatapointIds: string[];
}

const CATEGORY_CHIPS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'environmental', label: 'Environmental' },
  { id: 'social', label: 'Social' },
  { id: 'governance', label: 'Governance' },
  { id: 'cross', label: 'Cross-cutting' },
];

const STATUS_CHIPS: { id: 'all' | 'live' | 'partial' | 'pending' | 'blocked'; label: string }[] = [
  { id: 'all', label: 'Any status' },
  { id: 'live', label: 'Live' },
  { id: 'partial', label: 'Partial' },
  { id: 'pending', label: 'Pending' },
  { id: 'blocked', label: 'Blocked' },
];

const SCOPE_CHIPS: { id: ScopeFilter; label: string }[] = [
  { id: 'all', label: 'Any scope' },
  { id: 'mandatory', label: 'Mandatory only' },
  { id: 'phased_in', label: 'Phased-in' },
  { id: 'voluntary', label: 'Voluntary' },
  { id: 'conditional', label: 'Conditional' },
];

const CROSSWALK_CHIPS: { id: RegulatoryCrosswalk | 'all'; label: string }[] = [
  { id: 'all', label: 'Any crosswalk' },
  { id: 'SFDR', label: 'SFDR' },
  { id: 'PILLAR_3', label: 'EBA Pillar III' },
  { id: 'BENCHMARK', label: 'EU Benchmarks' },
  { id: 'CLIMATE_LAW', label: 'Climate Law' },
];

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
      role="switch"
      aria-checked={active}
      onClick={onClick}
      className={
        'rounded-md px-2.5 py-[5px] text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-1 focus-visible:ring-offset-1 ' +
        (active
          ? 'border border-ink-1 bg-ink-1 text-white'
          : 'border border-line bg-panel text-ink-2 hover:border-ink-5 hover:text-ink-1')
      }
    >
      {children}
    </button>
  );
}

export function RepositoryView({
  initialDatapoints,
  capturedTotal,
  pendingTotal,
  materialDatapointIds,
}: RepositoryViewProps) {
  const materialSet = useMemo(
    () => new Set(materialDatapointIds),
    [materialDatapointIds],
  );
  const initial = useMemo(
    () => ({ items: initialDatapoints, total: initialDatapoints.length }),
    [initialDatapoints],
  );
  const { data } = useDatapoints(undefined, { initialData: initial });
  const datapoints = data?.items ?? initialDatapoints;

  const category = useRepositoryFilters((s) => s.category);
  const status = useRepositoryFilters((s) => s.status);
  const scope = useRepositoryFilters((s) => s.scope);
  const crosswalk = useRepositoryFilters((s) => s.crosswalk);
  const materialOnly = useRepositoryFilters((s) => s.materialOnly);
  const search = useRepositoryFilters((s) => s.search);
  const selectedId = useRepositoryFilters((s) => s.selectedId);
  const setCategory = useRepositoryFilters((s) => s.setCategory);
  const setStatus = useRepositoryFilters((s) => s.setStatus);
  const setScope = useRepositoryFilters((s) => s.setScope);
  const setCrosswalk = useRepositoryFilters((s) => s.setCrosswalk);
  const setMaterialOnly = useRepositoryFilters((s) => s.setMaterialOnly);
  const setSearch = useRepositoryFilters((s) => s.setSearch);
  const selectDatapoint = useRepositoryFilters((s) => s.selectDatapoint);
  const reset = useRepositoryFilters((s) => s.reset);

  const hasActiveFilters =
    category !== 'all' ||
    status !== 'all' ||
    scope !== 'all' ||
    crosswalk !== 'all' ||
    materialOnly ||
    search.trim().length > 0;

  const filterSignature = `${category}|${status}|${scope}|${crosswalk}|${materialOnly}|${search.toLowerCase()}`;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return datapoints.filter((dp) => {
      if (category !== 'all' && topicCategory(dp.topic) !== category) return false;
      if (status !== 'all' && dp.status !== status) return false;
      if (scope === 'phased_in' && !dp.phaseInYears) return false;
      if (scope === 'voluntary' && !dp.voluntary) return false;
      if (scope === 'conditional' && !dp.conditional) return false;
      if (
        scope === 'mandatory' &&
        (dp.phaseInYears || dp.voluntary || dp.conditional || dp.mayDisclose)
      )
        return false;
      if (crosswalk !== 'all' && !dp.crosswalk.includes(crosswalk)) return false;
      if (materialOnly && !materialSet.has(dp.id)) return false;
      if (q) {
        const hay = `${dp.id} ${dp.name} ${dp.esrsDisclosure ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [datapoints, category, status, scope, crosswalk, materialOnly, materialSet, search]);

  const selected = useMemo(
    () => datapoints.find((dp) => dp.id === selectedId) ?? null,
    [datapoints, selectedId],
  );

  return (
    <>
      {/* Greeting */}
      <div className="mb-5 flex items-start justify-between gap-6">
        <div>
          <h1 className="mb-1 text-[24px] font-semibold leading-tight tracking-tight text-ink-1">
            Datapoint Repository
          </h1>
          <div className="font-mono text-[11.5px] tracking-wide text-ink-3">
            <strong className="font-medium text-ink-1">
              {datapoints.length.toLocaleString('en-US')} datapoints
            </strong>
            {' · ESRS dictionary · multi-framework mappings'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tag variant="green">Live</Tag>
          <span className="font-mono text-[10px] tracking-wide text-ink-2">
            EFRAG IG3 v2025-06
          </span>
        </div>
      </div>

      <Panel>
          <Panel.Head
            title="Catalogue"
            count={`${datapoints.length.toLocaleString('en-US')} datapoints`}
            icon={
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 4h10M3 8h10M3 12h6" strokeLinecap="round" />
              </svg>
            }
          />
          <Panel.Body flush>
            <div className="flex flex-col gap-2 border-b border-line-soft px-[18px] py-[10px]">
              <div className="flex flex-wrap items-center gap-1.5">
                {CATEGORY_CHIPS.map((c) => (
                  <FilterChip
                    key={c.id}
                    active={category === c.id}
                    onClick={() => setCategory(c.id)}
                  >
                    {c.label}
                  </FilterChip>
                ))}
                <span className="mx-1 h-4 w-px bg-line" aria-hidden />
                {STATUS_CHIPS.map((s) => (
                  <FilterChip
                    key={s.id}
                    active={status === s.id}
                    onClick={() => setStatus(s.id)}
                  >
                    {s.label}
                  </FilterChip>
                ))}
                <input
                  type="search"
                  value={search}
                  placeholder="Search id, name, DR…"
                  onChange={(e) => setSearch(e.target.value)}
                  className="ml-2 w-[180px] rounded-md border border-line bg-panel px-2 py-[5px] font-mono text-[11px] text-ink-1 placeholder:text-ink-4 focus:border-ink-3 focus:outline-none"
                />
                <div className="ml-auto font-mono text-[10.5px] tracking-wide text-ink-3">
                  <span className="text-ink-1">
                    {filtered.length.toLocaleString('en-US')}
                  </span>
                  {' shown · '}
                  {capturedTotal.toLocaleString('en-US')} captured ·{' '}
                  {pendingTotal.toLocaleString('en-US')} pending
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {SCOPE_CHIPS.map((s) => (
                  <FilterChip
                    key={s.id}
                    active={scope === s.id}
                    onClick={() => setScope(s.id)}
                  >
                    {s.label}
                  </FilterChip>
                ))}
                <span className="mx-1 h-4 w-px bg-line" aria-hidden />
                {CROSSWALK_CHIPS.map((c) => (
                  <FilterChip
                    key={c.id}
                    active={crosswalk === c.id}
                    onClick={() => setCrosswalk(c.id)}
                  >
                    {c.label}
                  </FilterChip>
                ))}
                {materialSet.size > 0 && (
                  <>
                    <span className="mx-1 h-4 w-px bg-line" aria-hidden />
                    <FilterChip
                      active={materialOnly}
                      onClick={() => setMaterialOnly(!materialOnly)}
                    >
                      <span className="inline-flex items-center gap-1">
                        <span
                          aria-hidden
                          className={
                            'inline-block h-1.5 w-1.5 rounded-full ' +
                            (materialOnly ? 'bg-white' : 'bg-nfq-purple')
                          }
                        />
                        Material IROs
                        <span
                          className={
                            'rounded-[3px] px-1 py-px font-mono text-[9px] font-semibold ' +
                            (materialOnly
                              ? 'bg-white/20 text-white'
                              : 'bg-nfq-purpleBg text-nfq-purple')
                          }
                        >
                          {materialSet.size}
                        </span>
                      </span>
                    </FilterChip>
                  </>
                )}
              </div>
            </div>
            <div className="h-[calc(100vh-300px)]">
              {filtered.length === 0 && hasActiveFilters ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                    No matching datapoints
                  </div>
                  <p className="max-w-[360px] text-[12px] leading-relaxed text-ink-3">
                    None of the {datapoints.length.toLocaleString('en-US')} EFRAG datapoints match the current filter combination. Clear them to start over.
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    className="mt-2 rounded-md border border-line bg-panel px-3 py-1.5 text-[12px] font-medium text-ink-1 hover:border-ink-5"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <DataTable
                  key={filterSignature}
                  data={filtered}
                  columns={datapointColumns}
                  rowHeight={48}
                  getRowId={(dp) => dp.id}
                  selectedRowId={selectedId}
                  onRowClick={(dp) => selectDatapoint(dp.id)}
                />
              )}
            </div>
          </Panel.Body>
        </Panel>

        <DatapointDrawer
          datapoint={selected}
          onClose={() => selectDatapoint(null)}
        />
    </>
  );
}
