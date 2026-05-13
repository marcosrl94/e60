import { cookies } from 'next/headers';
import type { EmissionFactor } from '@e60/domain';
import { DISCLOSURE_BINDING_LABELS } from '@e60/domain';
import {
  ActivityColumn,
  KpiCard,
  Panel,
  Sparkline,
  Tag,
} from '@e60/ui';
import emissionFactors from '@/data/seed/emission-factors.json';
import { DatapointLink } from '@/components/hub/repository/DatapointLink';
import { createClient } from '@/utils/supabase/server';
import { ensureUserOrgTree } from '@/lib/operational-units';
import {
  flattenTreeForSelect,
  subtreeIds,
  type OperationalUnit,
} from '@/lib/operational-units-shared';
import { EmissionsTrendChart } from './EmissionsTrendChart';
import { FactorCatalog } from './FactorCatalog';
import { NewEntryButton } from './NewEntryButton';
import {
  RecentEntriesColumn,
  type PersistedEmissionEntry,
} from './RecentEntriesColumn';
import { SubTabs, type SubTabSection } from './SubTabs';
import {
  ACTIVE_TARGETS,
  FEED_DATAPOINTS,
  RECENT_ENTRIES,
  TOTALS,
  VALIDATION_QUEUE,
} from './data';

const factors = emissionFactors as unknown as EmissionFactor[];

async function fetchUserEntries(): Promise<PersistedEmissionEntry[]> {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from('emission_entries')
    .select(
      'id, scope, scope2_method, activity_label, category, factor_source, ef_unit, quantity, quantity_input, quantity_input_unit, conversion_factor, tco2e, data_quality_tier, created_at, disclosure_bindings, operational_unit_id',
    )
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    scope: r.scope,
    scope2Method: r.scope2_method,
    activityLabel: r.activity_label,
    category: r.category,
    factorSource: r.factor_source,
    efUnit: r.ef_unit,
    quantity: Number(r.quantity),
    quantityInput: Number(r.quantity_input),
    quantityInputUnit: r.quantity_input_unit,
    conversionFactor: Number(r.conversion_factor),
    tco2e: Number(r.tco2e),
    dataQualityTier: r.data_quality_tier,
    createdAt: r.created_at,
    disclosureBindings: (r.disclosure_bindings ?? []) as string[],
    operationalUnitId: (r.operational_unit_id ?? null) as string | null,
  }));
}

/**
 * Carbon Intelligence · operational footprint view.
 *
 * Native E6.0 module (not embedded). Owns the GHG inventory of own operations:
 * Scope 1 (combustion + fleet), Scope 2 market-based + location-based, and
 * Scope 3 categories 1-14 (the value chain — financed emissions Scope 3.15
 * lives in ALQUID NZ).
 *
 * Layout: greeting + meta + "+ New entry" stay visible at the top; the rest
 * of the surface is split across 4 sub-tabs to keep the page browseable
 * without scroll fatigue.
 */
export async function CarbonIntelligenceView({
  disclosureFilter = null,
  locationFilter = null,
}: {
  disclosureFilter?: string | null;
  locationFilter?: string | null;
} = {}) {
  const [allEntries, units] = await Promise.all([
    fetchUserEntries(),
    ensureUserOrgTree(),
  ]);

  const locationUnit = locationFilter
    ? (units.find((u) => u.id === locationFilter) ?? null)
    : null;
  const allowedUnits = locationUnit
    ? subtreeIds(units, locationUnit.id)
    : null;

  const filteredEntries = allEntries.filter((e) => {
    if (disclosureFilter && !e.disclosureBindings.includes(disclosureFilter)) {
      return false;
    }
    if (allowedUnits) {
      if (!e.operationalUnitId) return false;
      if (!allowedUnits.has(e.operationalUnitId)) return false;
    }
    return true;
  });
  const filterLabel = disclosureFilter
    ? DISCLOSURE_BINDING_LABELS[disclosureFilter]
    : undefined;

  const sections: SubTabSection[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: <OverviewSection />,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      count:
        filteredEntries.length +
        RECENT_ENTRIES.length +
        ACTIVE_TARGETS.length +
        VALIDATION_QUEUE.length,
      content: (
        <InventorySection
          liveEntries={filteredEntries}
          filter={disclosureFilter}
          filterLabel={filterLabel}
          locationUnit={locationUnit}
          units={units}
        />
      ),
    },
    {
      id: 'factors',
      label: 'Factor catalogue',
      count: factors.length,
      content: <FactorsSection />,
    },
    {
      id: 'disclosures',
      label: 'Disclosure feed',
      count: FEED_DATAPOINTS.length,
      content: <DisclosureFeedSection />,
    },
  ];

  return (
    <>
      {/* Greeting */}
      <div className="mb-5 flex items-start justify-between gap-6">
        <div>
          <h1 className="mb-1 flex flex-wrap items-center gap-2 text-[24px] font-semibold leading-tight tracking-tight text-ink-1">
            Carbon Intelligence
            <span className="rounded-md bg-nfq-purple px-2 py-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white">
              Operational footprint
            </span>
          </h1>
          <div className="font-mono text-[11.5px] tracking-wide text-ink-3">
            Scope 1 + 2 (LB / MB) + Scope 3 non-financed ·{' '}
            <strong className="font-medium text-ink-1">
              GHG Protocol Corporate · ISO 14064-1
            </strong>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tag variant="green">Live</Tag>
          <span className="font-mono text-[10px] tracking-wide text-ink-2">
            Q2 2025 · last sync today 14:23
          </span>
          <NewEntryButton factors={factors} units={units} />
        </div>
      </div>

      <SubTabs sections={sections} />
    </>
  );
}

function OverviewSection() {
  return (
    <>
      <div className="mb-[18px] grid grid-cols-4 gap-3 standard:grid-cols-2">
        <KpiCard
          icon={
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M7 2c2 2 3 4 3 6a3 3 0 11-6 0c0-2 1-4 3-6z" strokeLinejoin="round" />
            </svg>
          }
          iconColor="purple"
          label="Total operational"
          value={TOTALS.total.toLocaleString('en-US')}
          unit=" tCO₂e"
          sparkline={
            <Sparkline data={[24, 23, 22, 21, 19, 18, 17]} color="purple" filled />
          }
        />
        <KpiCard
          icon={
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 11l3-4 3 2 4-6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 3h3v3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          iconColor="red"
          label="Scope 1"
          value={TOTALS.scope1.toLocaleString('en-US')}
          unit=" tCO₂e"
          sparkline={
            <Sparkline data={[12, 11, 10, 11, 10, 9, 9]} color="red" filled />
          }
        />
        <KpiCard
          icon={
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 7l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="7" cy="7" r="5.5" />
            </svg>
          }
          iconColor="green"
          label="Scope 2 (MB)"
          value={TOTALS.scope2MarketBased.toLocaleString('en-US')}
          unit=" tCO₂e"
          sparkline={
            <Sparkline data={[18, 16, 12, 9, 6, 3, 0]} color="green" filled />
          }
        />
        <KpiCard
          icon={
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 11h10M3 9h2M6 7h2M9 5h2" strokeLinecap="round" />
            </svg>
          }
          iconColor="blue"
          label="Scope 3"
          value={TOTALS.scope3.toLocaleString('en-US')}
          unit=" tCO₂e"
          sparkline={
            <Sparkline data={[19, 19, 18, 19, 19, 18, 17]} color="blue" />
          }
        />
      </div>

      <Panel>
        <Panel.Head
          title="Operational emissions · monthly trend"
          count="Last 12 months · stacked by scope"
          icon={
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 9l3-3 2 2 3-4 2 3 2-2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <Panel.Body>
          <EmissionsTrendChart />
        </Panel.Body>
      </Panel>
    </>
  );
}

function InventorySection({
  liveEntries,
  filter,
  filterLabel,
  locationUnit,
  units,
}: {
  liveEntries: PersistedEmissionEntry[];
  filter: string | null;
  filterLabel: string | undefined;
  locationUnit: OperationalUnit | null;
  units: OperationalUnit[];
}) {
  const totalItems =
    liveEntries.length +
    RECENT_ENTRIES.length +
    VALIDATION_QUEUE.length +
    ACTIVE_TARGETS.length;
  return (
    <Panel>
      <Panel.Head
        title="Inventory activity"
        count={`${totalItems} items`}
        icon={
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 4.5v3.5l2 1.5" strokeLinecap="round" />
          </svg>
        }
      />
      <Panel.Body flush>
        {filter && (
          <div className="flex items-center justify-between gap-3 border-b border-nfq-purple/20 bg-nfq-purpleBg/40 px-4 py-2.5 text-[12px] text-ink-1">
            <span>
              Filtered to entries feeding{' '}
              <strong className="font-mono text-nfq-purple">{filter}</strong>
              {filterLabel && (
                <span className="text-ink-2"> · {filterLabel}</span>
              )}{' '}
              · {liveEntries.length}{' '}
              {liveEntries.length === 1 ? 'entry' : 'entries'}
            </span>
            <a
              href={
                locationUnit
                  ? `/disclosure-hub/carbon-intelligence?location=${encodeURIComponent(locationUnit.id)}`
                  : '/disclosure-hub/carbon-intelligence'
              }
              className="font-mono text-[10.5px] tracking-wide text-nfq-purple hover:underline"
            >
              Clear disclosure filter →
            </a>
          </div>
        )}
        {locationUnit && (
          <div className="flex items-center justify-between gap-3 border-b border-nfq-blue/20 bg-nfq-blueBg/40 px-4 py-2.5 text-[12px] text-ink-1">
            <span>
              Scoped to{' '}
              <strong className="font-mono text-nfq-blue">
                {locationUnit.shortCode
                  ? `[${locationUnit.shortCode}] `
                  : ''}
                {locationUnit.name}
              </strong>
              {locationUnit.country && (
                <span className="text-ink-2"> · {locationUnit.country}</span>
              )}{' '}
              and descendants · {liveEntries.length}{' '}
              {liveEntries.length === 1 ? 'entry' : 'entries'}
            </span>
            <a
              href={
                filter
                  ? `/disclosure-hub/carbon-intelligence?disclosure=${encodeURIComponent(filter)}`
                  : '/disclosure-hub/carbon-intelligence'
              }
              className="font-mono text-[10.5px] tracking-wide text-nfq-blue hover:underline"
            >
              Clear location filter →
            </a>
          </div>
        )}
        <ByLocationTable
          units={units}
          entries={liveEntries}
          activeUnitId={locationUnit?.id ?? null}
          disclosureFilter={filter}
        />
        <div className="grid grid-cols-3 gap-3 p-3 standard:grid-cols-1">
          <RecentEntriesColumn
            seedItems={RECENT_ENTRIES}
            liveEntries={liveEntries}
          />
          <ActivityColumn
            tone="won"
            title="Active reduction targets"
            count={ACTIVE_TARGETS.length}
            items={ACTIVE_TARGETS}
            icon={
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 7l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <ActivityColumn
            tone="lost"
            title="Validation queue"
            count={VALIDATION_QUEUE.length}
            items={VALIDATION_QUEUE}
            icon={
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="7" cy="7" r="5.5" />
                <path d="M7 4v3M7 10v.1" strokeLinecap="round" />
              </svg>
            }
          />
        </div>
      </Panel.Body>
    </Panel>
  );
}

function FactorsSection() {
  return (
    <Panel>
      <Panel.Head
        title="Emission factor catalogue"
        count={`${factors.length} factors · MITECO / IDAE / DEFRA`}
        icon={
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3 4h10M3 8h10M3 12h6" strokeLinecap="round" />
          </svg>
        }
      />
      <Panel.Body flush>
        <FactorCatalog initialFactors={factors} />
      </Panel.Body>
    </Panel>
  );
}

function DisclosureFeedSection() {
  return (
    <Panel>
      <Panel.Head
        title="Feeds the disclosure repository"
        count={`${FEED_DATAPOINTS.length} datapoints`}
        icon={
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      />
      <Panel.Body>
        <ul className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
          {FEED_DATAPOINTS.map((f) => (
            <li
              key={f.code}
              className="flex items-baseline gap-2 text-[12px] text-ink-2"
            >
              <DatapointLink id={f.code} className="text-[10.5px]" />
              <span className="text-ink-3">·</span>
              <span>{f.description}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] leading-relaxed text-ink-3">
          Carbon Intelligence is a native E6.0 module. Inventory entries
          captured here roll up into the{' '}
          <a
            className="underline decoration-dotted underline-offset-2"
            href="/disclosure-hub/repository"
          >
            Datapoint Repository
          </a>{' '}
          with full audit trail (verifier, factor source, timestamp) for ESRS
          E1-5/E1-6/E1-7 disclosures.
        </p>
      </Panel.Body>
    </Panel>
  );
}

// ── By-location aggregation (D3) ──────────────────────────────────────

interface UnitTotals {
  direct: { count: number; s1: number; s2lb: number; s2mb: number; s3: number };
  rolled: { count: number; s1: number; s2lb: number; s2mb: number; s3: number };
}

const ZERO_TOTALS = () => ({
  direct: { count: 0, s1: 0, s2lb: 0, s2mb: 0, s3: 0 },
  rolled: { count: 0, s1: 0, s2lb: 0, s2mb: 0, s3: 0 },
});

function computeUnitTotals(
  units: OperationalUnit[],
  entries: PersistedEmissionEntry[],
): Map<string, UnitTotals> {
  const totals = new Map<string, UnitTotals>();
  for (const u of units) totals.set(u.id, ZERO_TOTALS());

  // 1) Direct attribution from each entry
  for (const e of entries) {
    if (!e.operationalUnitId) continue;
    const t = totals.get(e.operationalUnitId);
    if (!t) continue;
    t.direct.count++;
    if (e.scope === 's1') t.direct.s1 += e.tco2e;
    else if (e.scope === 's2' && e.scope2Method === 'location_based') t.direct.s2lb += e.tco2e;
    else if (e.scope === 's2' && e.scope2Method === 'market_based') t.direct.s2mb += e.tco2e;
    else if (e.scope === 's3') t.direct.s3 += e.tco2e;
  }

  // 2) Roll-up direct totals into ancestors via DFS post-order.
  const byParent = new Map<string | null, OperationalUnit[]>();
  for (const u of units) {
    const list = byParent.get(u.parentId) ?? [];
    list.push(u);
    byParent.set(u.parentId, list);
  }
  function walk(unitId: string): UnitTotals['rolled'] {
    const direct = totals.get(unitId)!.direct;
    const rolled = { ...direct };
    const children = byParent.get(unitId) ?? [];
    for (const c of children) {
      const cr = walk(c.id);
      rolled.count += cr.count;
      rolled.s1 += cr.s1;
      rolled.s2lb += cr.s2lb;
      rolled.s2mb += cr.s2mb;
      rolled.s3 += cr.s3;
    }
    totals.get(unitId)!.rolled = rolled;
    return rolled;
  }
  for (const root of byParent.get(null) ?? []) walk(root.id);

  return totals;
}

const KIND_LABEL: Record<OperationalUnit['kind'], string> = {
  reporting_entity: 'Reporting entity',
  subsidiary: 'Subsidiary',
  business_line: 'Business line',
  facility: 'Facility',
  country_aggregate: 'Country aggregate',
};

const KIND_TAG: Record<OperationalUnit['kind'], 'red' | 'orange' | 'blue' | 'green' | 'purple' | 'gray'> = {
  reporting_entity: 'red',
  subsidiary: 'blue',
  business_line: 'purple',
  facility: 'green',
  country_aggregate: 'gray',
};

function fmtT(n: number): string {
  if (n === 0) return '—';
  if (n < 1) return n.toFixed(2);
  if (n < 100) return n.toFixed(1);
  return Math.round(n).toLocaleString('en-US');
}

function ByLocationTable({
  units,
  entries,
  activeUnitId,
  disclosureFilter,
}: {
  units: OperationalUnit[];
  entries: PersistedEmissionEntry[];
  activeUnitId: string | null;
  disclosureFilter: string | null;
}) {
  if (units.length === 0) return null;
  const flat = flattenTreeForSelect(units);
  const totals = computeUnitTotals(units, entries);
  const grandTotal = (() => {
    const root = units.find((u) => u.kind === 'reporting_entity');
    if (!root) return 0;
    const r = totals.get(root.id)!.rolled;
    return r.s1 + r.s2mb + r.s3;
  })();
  const attributed = entries.filter((e) => !!e.operationalUnitId).length;
  const unattributed = entries.length - attributed;

  return (
    <section className="border-b border-line bg-canvas px-4 pt-3 pb-4">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Inventory by operational unit
        </h3>
        <div className="font-mono text-[10px] tracking-wide text-ink-3">
          <strong className="font-medium text-ink-1 tabular-nums">
            {fmtT(grandTotal)} tCO₂e
          </strong>{' '}
          total · {attributed}/{entries.length} entries attributed
          {unattributed > 0 && (
            <span className="text-nfq-orange"> · {unattributed} unattributed</span>
          )}
        </div>
      </div>
      <div className="overflow-x-auto rounded-md border border-line-soft bg-panel">
        <table className="min-w-full text-[11.5px]">
          <thead>
            <tr className="border-b border-line-soft text-left font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
              <th className="px-3 py-1.5">Unit</th>
              <th className="px-3 py-1.5">Kind</th>
              <th className="px-2 py-1.5 text-right">S1</th>
              <th className="px-2 py-1.5 text-right">S2 LB</th>
              <th className="px-2 py-1.5 text-right">S2 MB</th>
              <th className="px-2 py-1.5 text-right">S3</th>
              <th className="px-2 py-1.5 text-right">Total (MB)</th>
              <th className="px-2 py-1.5 text-right">Entries</th>
            </tr>
          </thead>
          <tbody>
            {flat.map(({ unit, depth }) => {
              const t = totals.get(unit.id)!;
              const r = t.rolled;
              const total = r.s1 + r.s2mb + r.s3;
              const isLeaf = unit.kind === 'facility';
              const isActive = activeUnitId === unit.id;
              const href = buildCiHref({
                disclosure: disclosureFilter,
                location: isActive ? null : unit.id,
              });
              const rowTone = isActive
                ? 'bg-nfq-blueBg/60'
                : isLeaf
                  ? 'bg-panel'
                  : 'bg-panel-soft/60';
              return (
                <tr
                  key={unit.id}
                  className={
                    'border-b border-line-soft tabular-nums last:border-0 ' +
                    rowTone
                  }
                >
                  <td className="px-3 py-1.5 text-ink-1">
                    <a
                      href={href}
                      title={
                        isActive ? 'Clear location filter' : 'Filter to this subtree'
                      }
                      className="inline-flex items-center gap-1.5 hover:text-nfq-blue"
                      style={{ paddingLeft: `${depth * 14}px` }}
                    >
                      {!isLeaf && depth > 0 && (
                        <span aria-hidden className="text-ink-3 font-mono text-[10px]">
                          └
                        </span>
                      )}
                      {unit.shortCode && (
                        <span className="font-mono text-[10px] text-ink-3">
                          [{unit.shortCode}]
                        </span>
                      )}
                      <span className={isLeaf ? '' : 'font-semibold'}>
                        {unit.name}
                      </span>
                      {unit.country && (
                        <span className="font-mono text-[9.5px] text-ink-3">
                          · {unit.country}
                        </span>
                      )}
                      {isActive && (
                        <span className="ml-1 font-mono text-[9.5px] text-nfq-blue">
                          · scoped
                        </span>
                      )}
                    </a>
                  </td>
                  <td className="px-3 py-1.5">
                    <Tag variant={KIND_TAG[unit.kind]}>{KIND_LABEL[unit.kind]}</Tag>
                  </td>
                  <td className="px-2 py-1.5 text-right text-ink-1">{fmtT(r.s1)}</td>
                  <td className="px-2 py-1.5 text-right text-ink-1">{fmtT(r.s2lb)}</td>
                  <td className="px-2 py-1.5 text-right text-ink-1">{fmtT(r.s2mb)}</td>
                  <td className="px-2 py-1.5 text-right text-ink-1">{fmtT(r.s3)}</td>
                  <td className="px-2 py-1.5 text-right font-semibold text-ink-1">
                    {fmtT(total)}
                  </td>
                  <td className="px-2 py-1.5 text-right text-ink-2">
                    {r.count > 0 ? r.count : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-3">
        Totals rolled up from descendants (DFS sum). Click a row to scope the
        inventory to that subtree. Total column uses Scope 2 market-based
        (auditor default).
      </p>
    </section>
  );
}

function buildCiHref({
  disclosure,
  location,
}: {
  disclosure: string | null;
  location: string | null;
}): string {
  const params = new URLSearchParams();
  if (disclosure) params.set('disclosure', disclosure);
  if (location) params.set('location', location);
  const qs = params.toString();
  return `/disclosure-hub/carbon-intelligence${qs ? `?${qs}` : ''}`;
}
