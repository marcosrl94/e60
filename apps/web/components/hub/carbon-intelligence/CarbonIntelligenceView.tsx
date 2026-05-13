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
      'id, scope, scope2_method, activity_label, category, factor_source, ef_unit, quantity, quantity_input, quantity_input_unit, conversion_factor, tco2e, data_quality_tier, created_at, disclosure_bindings',
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
}: {
  disclosureFilter?: string | null;
} = {}) {
  const allEntries = await fetchUserEntries();
  const filteredEntries = disclosureFilter
    ? allEntries.filter((e) => e.disclosureBindings.includes(disclosureFilter))
    : allEntries;
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
          <NewEntryButton factors={factors} />
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
}: {
  liveEntries: PersistedEmissionEntry[];
  filter: string | null;
  filterLabel: string | undefined;
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
              href="/disclosure-hub/carbon-intelligence"
              className="font-mono text-[10.5px] tracking-wide text-nfq-purple hover:underline"
            >
              Clear filter →
            </a>
          </div>
        )}
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
