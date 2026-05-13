'use client';

import type {
  Datapoint,
  DatapointLineage,
  DatapointWorkflowStatus,
  LineageSource,
  LineageValueHistoryEntry,
  RegulatoryCrosswalk,
  UserRef,
} from '@e60/domain';
import { formatReportingPeriod } from '@e60/domain';
import { Drawer, FrameworkChip, Tag, type TagVariant } from '@e60/ui';
import {
  CROSSWALK_LABEL,
  STATUS_LABEL,
  STATUS_VARIANT,
  TOPIC_LABEL,
} from './columns';

// ── Lookup tables for the new domain fields ─────────────────────────────

const WORKFLOW_LABEL: Record<DatapointWorkflowStatus, string> = {
  empty: 'Empty',
  draft: 'Draft',
  review: 'In review',
  approved: 'Approved',
  locked: 'Locked',
};

const WORKFLOW_VARIANT: Record<DatapointWorkflowStatus, TagVariant> = {
  empty: 'gray',
  draft: 'orange',
  review: 'blue',
  approved: 'green',
  locked: 'purple',
};

const LINEAGE_SOURCE_LABEL: Record<LineageSource, string> = {
  manual: 'Manual entry',
  computed: 'Computed',
  'carbon-intel': 'Carbon Intelligence',
  'data-layer': 'Data Layer',
  external: 'External',
};

const LINEAGE_SOURCE_VARIANT: Record<LineageSource, TagVariant> = {
  manual: 'gray',
  computed: 'blue',
  'carbon-intel': 'orange',
  'data-layer': 'purple',
  external: 'red',
};

interface DatapointDrawerProps {
  datapoint: Datapoint | null;
  /** Number of the user's CI entries feeding this datapoint (C2). */
  bindingCount?: number;
  onClose: () => void;
}

const CATEGORY_TAG: Record<
  string,
  { label: string; variant: 'red' | 'orange' | 'blue' | 'purple' }
> = {
  E1: { label: 'Environmental', variant: 'red' },
  E2: { label: 'Environmental', variant: 'red' },
  E3: { label: 'Environmental', variant: 'red' },
  E4: { label: 'Environmental', variant: 'red' },
  E5: { label: 'Environmental', variant: 'red' },
  S1: { label: 'Social', variant: 'orange' },
  S2: { label: 'Social', variant: 'orange' },
  S3: { label: 'Social', variant: 'orange' },
  S4: { label: 'Social', variant: 'orange' },
  G1: { label: 'Governance', variant: 'blue' },
  GENERAL: { label: 'Cross-cutting', variant: 'purple' },
};

function formatLastSync(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function DatapointDrawer({
  datapoint,
  bindingCount = 0,
  onClose,
}: DatapointDrawerProps) {
  const open = !!datapoint;
  if (!datapoint) {
    return (
      <Drawer open={false} onClose={onClose} title="">
        <div />
      </Drawer>
    );
  }

  const category = CATEGORY_TAG[datapoint.topic];
  const status: TagVariant = STATUS_VARIANT[datapoint.status];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow={
        <>
          {datapoint.id}
          {datapoint.efragId && datapoint.efragId !== datapoint.id && (
            <> · EFRAG {datapoint.efragId}</>
          )}
        </>
      }
      title={datapoint.name}
      meta={
        <>
          <Tag variant={category.variant}>{category.label}</Tag>
          <Tag variant={status}>{STATUS_LABEL[datapoint.status]}</Tag>
          {datapoint.workflowStatus && (
            <Tag variant={WORKFLOW_VARIANT[datapoint.workflowStatus]}>
              {WORKFLOW_LABEL[datapoint.workflowStatus]}
            </Tag>
          )}
          {datapoint.period && (
            <Tag variant="gray">{formatReportingPeriod(datapoint.period)}</Tag>
          )}
        </>
      }
    >
      <Drawer.Tabs
        sections={[
          {
            id: 'detail',
            label: 'Detail',
            content: <DetailTab datapoint={datapoint} />,
          },
          {
            id: 'source',
            label: 'Source & lineage',
            content: <SourceTab datapoint={datapoint} bindingCount={bindingCount} />,
          },
          {
            id: 'mapping',
            label: 'Mapping',
            count: datapoint.mappings.length + datapoint.crosswalk.length || undefined,
            content: <MappingTab datapoint={datapoint} />,
          },
          {
            id: 'history',
            label: 'History',
            content: <HistoryTab datapoint={datapoint} />,
          },
          {
            id: 'comments',
            label: 'Comments',
            content: <CommentsTab />,
          },
        ]}
      />
    </Drawer>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────

function MiniSparkline() {
  return (
    <svg className="mt-2 h-[60px] w-full" viewBox="0 0 280 60" preserveAspectRatio="none">
      <path
        d="M0 28 L40 24 L80 18 L120 22 L160 14 L200 10 L240 12 L280 6"
        stroke="#7a4cf0"
        strokeWidth={1.8}
        fill="none"
      />
      <path
        d="M0 28 L40 24 L80 18 L120 22 L160 14 L200 10 L240 12 L280 6 L280 60 L0 60 Z"
        fill="#7a4cf0"
        opacity={0.12}
      />
    </svg>
  );
}

/**
 * Comparatives panel · N / N-1 / N-2 · ESRS/CSRD comparative reporting.
 *
 * Quantitative ESRS disclosures require at least N-1; by the third
 * reporting cycle the full N / N-1 / N-2 chain is mandatory. Renders
 * a row per period with value, unit, and delta % vs the prior period,
 * plus a tiny bar chart sized to the current-period value.
 */
function ComparativesPanel({ datapoint }: { datapoint: Datapoint }) {
  const current = datapoint.numericValue;
  const items: Array<{
    label: string;
    valueLabel: string;
    valueNumeric?: number;
    delta?: number;
  }> = [];

  items.push({
    label: datapoint.period ? formatReportingPeriod(datapoint.period) : 'Current',
    valueLabel: datapoint.latestValue ?? '—',
    valueNumeric: current,
  });

  let prev = current;
  for (const c of datapoint.comparatives) {
    const delta =
      prev != null && c.valueNumeric != null && c.valueNumeric !== 0
        ? ((prev - c.valueNumeric) / c.valueNumeric) * 100
        : undefined;
    items.push({
      label: formatReportingPeriod(c.period),
      valueLabel: c.value,
      valueNumeric: c.valueNumeric,
      delta,
    });
    prev = c.valueNumeric ?? prev;
  }

  const maxNum =
    items.reduce(
      (acc, it) => (it.valueNumeric != null && it.valueNumeric > acc ? it.valueNumeric : acc),
      0,
    ) || 1;

  return (
    <div className="rounded-md border border-line-soft bg-panel-soft p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Comparatives
        </div>
        <div className="font-mono text-[9.5px] text-ink-3 tracking-wide">
          ESRS · N · N-1 · N-2
        </div>
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => {
          const pct = it.valueNumeric != null ? (it.valueNumeric / maxNum) * 100 : 0;
          const isCurrent = i === 0;
          return (
            <li key={it.label} className="flex items-center gap-3">
              <span
                className={
                  'w-14 flex-shrink-0 font-mono text-[10.5px] tracking-wide ' +
                  (isCurrent ? 'text-ink-1 font-semibold' : 'text-ink-3')
                }
              >
                {it.label}
              </span>
              <div className="flex-1">
                <div className="h-1.5 w-full rounded-full bg-canvas">
                  <div
                    className={
                      'h-full rounded-full ' +
                      (isCurrent ? 'bg-nfq-purple' : 'bg-ink-3/40')
                    }
                    style={{ width: `${Math.max(2, pct)}%` }}
                  />
                </div>
              </div>
              <div className="flex w-28 flex-shrink-0 items-baseline justify-end gap-1 tabular-nums">
                <span className="text-[12.5px] font-medium text-ink-1">{it.valueLabel}</span>
                {datapoint.unit && (
                  <span className="font-mono text-[9.5px] text-ink-3">{datapoint.unit}</span>
                )}
              </div>
              <div className="w-14 flex-shrink-0 text-right font-mono text-[10px] tabular-nums">
                {it.delta != null ? (
                  <span
                    className={
                      it.delta > 0
                        ? 'text-nfq-green'
                        : it.delta < 0
                          ? 'text-nfq-red'
                          : 'text-ink-3'
                    }
                  >
                    {it.delta > 0 ? '+' : ''}
                    {it.delta.toFixed(1)}%
                  </span>
                ) : isCurrent ? (
                  <span className="text-ink-3">latest</span>
                ) : (
                  <span className="text-ink-3">—</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {datapoint.comparatives.length === 0 && (
        <p className="mt-1 text-[10.5px] text-ink-3">
          No prior-period values captured yet. ESRS requires at least N-1 for
          quantitative datapoints.
        </p>
      )}
    </div>
  );
}

function isQuantitative(dp: Datapoint): boolean {
  return dp.type === 'numeric' || dp.type === 'percentage' || dp.type === 'monetary';
}

function DetailTab({ datapoint }: { datapoint: Datapoint }) {
  return (
    <div className="px-5 py-4 space-y-5">
      {datapoint.latestValue && (
        <section className="space-y-3">
          <div>
            <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
              Latest value
              {datapoint.period && (
                <span className="ml-1.5 text-ink-2 normal-case tracking-normal">
                  · {formatReportingPeriod(datapoint.period)}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-[28px] font-semibold tracking-tight text-ink-1">
                {datapoint.latestValue}
              </div>
              {datapoint.unit && (
                <div className="font-mono text-[12px] text-ink-3">{datapoint.unit}</div>
              )}
              {datapoint.evidenceCount != null && datapoint.evidenceCount > 0 && (
                <span className="ml-auto rounded-md border border-line-soft bg-panel px-2 py-0.5 font-mono text-[10px] text-ink-2">
                  {datapoint.evidenceCount} evidence{datapoint.evidenceCount === 1 ? '' : 's'}
                </span>
              )}
            </div>
          </div>
          {isQuantitative(datapoint) ? (
            <ComparativesPanel datapoint={datapoint} />
          ) : (
            <>
              <MiniSparkline />
              <div className="mt-1 flex justify-between font-mono text-[9.5px] text-ink-3 tracking-wide">
                <span>2018</span>
                <span>2025</span>
              </div>
            </>
          )}
        </section>
      )}

      {(datapoint.esrsDisclosure || datapoint.paragraph || datapoint.relatedAr) && (
        <section>
          <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            ESRS reference
          </div>
          <div className="rounded-md border border-line-soft bg-panel-soft px-3 py-2 font-mono text-[11.5px] text-ink-1">
            {datapoint.esrsDisclosure ?? '—'}
            {datapoint.paragraph && (
              <span className="text-ink-3"> · § {datapoint.paragraph}</span>
            )}
            {datapoint.relatedAr && (
              <span className="text-ink-3">
                {' · '}
                {/^AR/i.test(datapoint.relatedAr)
                  ? datapoint.relatedAr
                  : `AR ${datapoint.relatedAr}`}
              </span>
            )}
          </div>
        </section>
      )}

      {datapoint.definition && datapoint.definition !== `${datapoint.esrsDisclosure} · § ${datapoint.paragraph}` && (
        <section>
          <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            Definition
          </div>
          <p className="text-[12.5px] leading-relaxed text-ink-2">
            {datapoint.definition}
          </p>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3">
        <KeyValue label="Topic">{TOPIC_LABEL[datapoint.topic]}</KeyValue>
        <KeyValue label="Type">{datapoint.type}</KeyValue>
        {datapoint.unit && <KeyValue label="Unit">{datapoint.unit}</KeyValue>}
        <KeyValue label="Status">
          <Tag variant={STATUS_VARIANT[datapoint.status]}>
            {STATUS_LABEL[datapoint.status]}
          </Tag>
        </KeyValue>
        {datapoint.owner && <KeyValue label="Owner">{datapoint.owner}</KeyValue>}
        {datapoint.isCustom && <KeyValue label="Custom">bank-specific</KeyValue>}
      </section>

      {datapoint.tags.length > 0 && (
        <section>
          <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            Tags
          </div>
          <div className="flex flex-wrap gap-1">
            {datapoint.tags.map((t) => (
              <span
                key={t}
                className="rounded-[3px] border border-line-soft bg-canvas px-1.5 py-px font-mono text-[9.5px] text-ink-2 tracking-wide"
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function KeyValue({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
        {label}
      </div>
      <div className="mt-0.5 text-[12.5px] text-ink-1">{children}</div>
    </div>
  );
}

function SourceTab({
  datapoint,
  bindingCount,
}: {
  datapoint: Datapoint;
  bindingCount: number;
}) {
  if (!datapoint.source && bindingCount === 0) {
    return (
      <div className="px-5 py-12 text-center text-[12px] text-ink-3">
        No source assigned yet · this datapoint is not connected to an engine,
        connector or manual entry.
      </div>
    );
  }
  const s = datapoint.source;
  const sourceLabel = s
    ? s.identifier === 'carbon_intelligence'
      ? 'Carbon Intelligence'
      : s.identifier === 'alquid_nz'
        ? 'ALQUID NZ'
        : s.identifier
    : null;

  return (
    <div className="px-5 py-4 space-y-5">
      {s && (
        <section>
          <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            Provenance
          </div>
          <div className="rounded-md border border-line-soft bg-panel-soft px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[14px] font-semibold text-ink-1">{sourceLabel}</div>
                <div className="font-mono text-[10.5px] text-ink-3 tracking-wide">
                  {s.type === 'engine' && 'Calculation engine'}
                  {s.type === 'connector' && 'External connector'}
                  {s.type === 'manual' && 'Manual entry'}
                  {s.type === 'derived' && 'Derived from other datapoints'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] text-ink-3 tracking-wide">
                  Last sync
                </div>
                <div className="font-mono text-[11px] text-ink-1 tabular-nums">
                  {formatLastSync(s.lastSync)}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {bindingCount > 0 && (
        <section>
          <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            Used in disclosures
          </div>
          <a
            href={`/disclosure-hub/carbon-intelligence?disclosure=${encodeURIComponent(datapoint.id)}`}
            className="group flex items-center justify-between gap-3 rounded-md border border-nfq-purple/30 bg-nfq-purpleBg/40 px-3 py-2.5 text-[12px] text-ink-1 hover:border-nfq-purple"
          >
            <span>
              Powered by{' '}
              <strong className="font-semibold text-nfq-purple tabular-nums">
                {bindingCount}
              </strong>{' '}
              Carbon Intelligence{' '}
              {bindingCount === 1 ? 'entry' : 'entries'}
            </span>
            <span
              aria-hidden
              className="font-mono text-[10.5px] tracking-wide text-nfq-purple group-hover:translate-x-0.5 transition-transform"
            >
              View in CI →
            </span>
          </a>
          <p className="mt-1 font-mono text-[10px] tracking-wide text-ink-3">
            Sum of `emission_entries` whose `disclosure_bindings` array
            contains <code>{datapoint.id}</code>.
          </p>
        </section>
      )}

      {s?.dataQualityScore && (
        <section>
          <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            PCAF Data Quality Score
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[28px] font-semibold tracking-tight text-ink-1">
              {s.dataQualityScore}
            </div>
            <div className="font-mono text-[10px] text-ink-3">/ 5</div>
            <div className="ml-2 flex flex-1 gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={
                    'h-3 flex-1 rounded-sm ' +
                    (n <= (s.dataQualityScore ?? 0)
                      ? n <= 2
                        ? 'bg-nfq-green'
                        : n <= 3
                          ? 'bg-nfq-orange'
                          : 'bg-nfq-red'
                      : 'bg-canvas-edge')
                  }
                />
              ))}
            </div>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-3">
            PCAF score 1 = primary measured · 5 = proxy. Lower is better.
          </p>
        </section>
      )}

      {datapoint.lineage ? (
        <LineagePanel lineage={datapoint.lineage} />
      ) : (
        <section>
          <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            Lineage
          </div>
          <p className="text-[12.5px] leading-relaxed text-ink-2">
            No upstream lineage recorded for this datapoint yet. When a value is
            captured, the engine and timestamp are logged here.
          </p>
        </section>
      )}
    </div>
  );
}

function UserAvatar({ user, size = 22 }: { user: UserRef; size?: number }) {
  return (
    <span
      title={user.email ?? user.name}
      style={{ width: size, height: size }}
      className="inline-flex items-center justify-center rounded-full bg-nfq-purpleBg font-mono text-[9.5px] font-semibold tracking-wide text-nfq-purple"
      aria-hidden
    >
      {user.initials ?? user.name.slice(0, 2).toUpperCase()}
    </span>
  );
}

function LineagePanel({ lineage }: { lineage: DatapointLineage }) {
  return (
    <section>
      <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
        Lineage
      </div>
      <div className="rounded-md border border-line-soft bg-panel-soft px-3 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Tag variant={LINEAGE_SOURCE_VARIANT[lineage.source]}>
            {LINEAGE_SOURCE_LABEL[lineage.source]}
          </Tag>
          <UserAvatar user={lineage.lastUpdatedBy} />
          <span className="text-[11.5px] text-ink-1">
            {lineage.lastUpdatedBy.name}
          </span>
          <span className="ml-auto font-mono text-[10px] text-ink-3 tabular-nums">
            {formatLastSync(lineage.lastUpdatedAt)}
          </span>
        </div>
        {lineage.sourceRef && (
          <p className="mt-2 break-words rounded-sm bg-canvas px-2 py-1 font-mono text-[10px] leading-relaxed text-ink-2">
            {lineage.sourceRef}
          </p>
        )}
      </div>
    </section>
  );
}

function MappingTab({ datapoint }: { datapoint: Datapoint }) {
  return (
    <div className="px-5 py-4 space-y-5">
      <section>
        <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Framework mappings ({datapoint.mappings.length})
        </div>
        {datapoint.mappings.length === 0 ? (
          <p className="text-[12px] text-ink-3">No mappings yet.</p>
        ) : (
          <ul className="divide-y divide-line-soft rounded-md border border-line-soft">
            {datapoint.mappings.map((m, i) => (
              <li
                key={`${m.framework}-${i}`}
                className="flex items-center justify-between gap-3 px-3 py-2 text-[12px]"
              >
                <FrameworkChip framework={m.framework} />
                <span className="font-mono text-[10.5px] text-ink-2 tracking-wide">
                  {m.externalCode}
                </span>
                <Tag variant={m.authoritative ? 'green' : 'gray'}>
                  {m.authoritative ? 'Authoritative' : 'Mapping draft'}
                </Tag>
              </li>
            ))}
          </ul>
        )}
      </section>

      {datapoint.crosswalk.length > 0 && (
        <section>
          <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            Regulatory crosswalk ({datapoint.crosswalk.length})
          </div>
          <div className="flex flex-wrap gap-1">
            {datapoint.crosswalk.map((c: RegulatoryCrosswalk) => (
              <FrameworkChip
                key={c}
                framework={CROSSWALK_LABEL[c]}
                className="bg-nfq-blueBg/40 text-nfq-blue"
              />
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-3">
            Per EFRAG IG3 Appendix B — this datapoint also feeds disclosures required by the indicated regulation(s).
          </p>
        </section>
      )}

      {(datapoint.phaseInYears ||
        datapoint.voluntary ||
        datapoint.conditional ||
        datapoint.mayDisclose) && (
        <section>
          <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            Reporting flags
          </div>
          <div className="flex flex-wrap gap-1.5">
            {datapoint.phaseInYears && (
              <Tag variant="orange">Phase-in +{datapoint.phaseInYears}y</Tag>
            )}
            {datapoint.voluntary && <Tag variant="purple">Voluntary</Tag>}
            {datapoint.conditional && <Tag variant="gray">Conditional</Tag>}
            {datapoint.mayDisclose && !datapoint.voluntary && (
              <Tag variant="gray">May [V]</Tag>
            )}
          </div>
          {datapoint.phaseInYears && (
            <p className="mt-2 text-[11px] leading-relaxed text-ink-3">
              Eligible for omission until year{' '}
              <strong className="text-ink-1">{datapoint.phaseInYears}</strong>{' '}
              after the first ESRS reporting cycle (EFRAG IG3 Appendix C).
            </p>
          )}
        </section>
      )}
    </div>
  );
}

/**
 * Build a plausible history timeline derived from the datapoint's demo
 * overlay (latestValue, source, status, owner, mappings). Each event is
 * keyed off real fields so the same DP renders the same story, and the
 * dates step back from source.lastSync (or import baseline when no
 * sync exists yet).
 */
interface HistoryEvent {
  label: string;
  who: string;
  iso: string;
}

const SOURCE_LABEL: Record<string, string> = {
  carbon_intelligence: 'Carbon Intelligence · auto-sync',
  alquid_nz: 'ALQUID NZ · auto-sync',
  cso_office: 'CSO Office · manual entry',
  cro_office: 'CRO Office · manual entry',
  esg_team: 'ESG team · manual entry',
};

const SOURCE_TYPE_LABEL: Record<NonNullable<Datapoint['source']>['type'], string> = {
  engine: 'engine pipeline',
  connector: 'data connector',
  manual: 'manual entry',
  derived: 'derived calculation',
};

function fmtRelDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function shiftDate(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

function buildHistory(datapoint: Datapoint): HistoryEvent[] {
  const events: HistoryEvent[] = [];
  // Baseline: when this DP was imported from the EFRAG IG3 spec. The
  // E6.0 demo pretends this happened on the EFRAG IG3 v2025-06 release.
  const importedIso = '2026-03-14T09:00:00Z';
  const ownerLabel = datapoint.owner ?? 'Pilot Bank ESG Team';

  const lastSync = datapoint.source?.lastSync ?? null;

  // Latest value captured
  if (datapoint.latestValue && lastSync) {
    const srcKey = datapoint.source?.identifier ?? '';
    const who =
      SOURCE_LABEL[srcKey] ??
      (datapoint.source
        ? `${srcKey} · ${SOURCE_TYPE_LABEL[datapoint.source.type]}`
        : 'system');
    events.push({
      label: `Value captured: ${datapoint.latestValue}${datapoint.unit ? ` ${datapoint.unit}` : ''}`,
      who,
      iso: lastSync,
    });
  }

  // Status transition
  if (datapoint.status === 'live' && lastSync) {
    events.push({
      label: 'Status set to live · ready for disclosure',
      who: ownerLabel,
      iso: shiftDate(lastSync, 9),
    });
  } else if (datapoint.status === 'partial' && lastSync) {
    events.push({
      label: 'Status set to partial · pending boundary expansion',
      who: ownerLabel,
      iso: shiftDate(lastSync, 7),
    });
  } else if (datapoint.status === 'blocked') {
    events.push({
      label: 'Marked as blocked · methodology gap or missing data',
      who: ownerLabel,
      iso: shiftDate(lastSync ?? importedIso, 5),
    });
  }

  // Authoritative mapping additions
  const authoritativeMappings = datapoint.mappings.filter((m) => m.authoritative);
  authoritativeMappings.forEach((m, i) => {
    events.push({
      label: `Mapping added · ${m.framework} ${m.externalCode}`,
      who: 'Pilot Bank ESG Team',
      iso: shiftDate(lastSync ?? importedIso, 20 + i * 6),
    });
  });

  // Owner assignment (only meaningful before status changes — push to
  // before the status event with a small offset)
  if (datapoint.owner) {
    events.push({
      label: `Owner assigned · ${datapoint.owner}`,
      who: 'system',
      iso: shiftDate(lastSync ?? importedIso, 50),
    });
  }

  // EFRAG import — always last
  events.push({
    label: 'Datapoint imported from EFRAG IG3 · v2025-06',
    who: 'system',
    iso: importedIso,
  });

  // Newest first
  return events.sort((a, b) => (a.iso < b.iso ? 1 : -1));
}

function HistoryTab({ datapoint }: { datapoint: Datapoint }) {
  const history = datapoint.lineage?.valueHistory ?? [];
  if (history.length > 0) {
    return <ValueHistoryList history={history} unit={datapoint.unit} />;
  }
  const events = buildHistory(datapoint);

  return (
    <div className="px-5 py-4 space-y-2.5">
      {events.map((e, i) => (
        <div
          key={`${e.iso}-${i}`}
          className="flex items-start gap-3 rounded-md border border-line-soft bg-panel px-3 py-2.5"
        >
          <span className="mt-1 inline-block h-2 w-2 rounded-full bg-nfq-blue" />
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-medium text-ink-1">{e.label}</div>
            <div className="font-mono text-[10.5px] text-ink-3 tracking-wide">
              {e.who}
            </div>
          </div>
          <div className="font-mono text-[10.5px] text-ink-2 tracking-wide whitespace-nowrap">
            {fmtRelDate(e.iso)}
          </div>
        </div>
      ))}
      <p className="mt-3 text-[11px] leading-relaxed text-ink-3">
        Audit trail derived from current provenance fields (source · status ·
        mappings · owner). Production renders the immutable Postgres trigger
        log with full diffs and revert option.
      </p>
    </div>
  );
}

function ValueHistoryList({
  history,
  unit,
}: {
  history: LineageValueHistoryEntry[];
  unit?: string;
}) {
  return (
    <div className="px-5 py-4 space-y-2.5">
      {history.map((h, i) => (
        <div
          key={`${h.at}-${i}`}
          className="flex items-start gap-3 rounded-md border border-line-soft bg-panel px-3 py-2.5"
        >
          <UserAvatar user={h.by} size={20} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-1.5 text-[12px]">
              <span className="font-medium text-ink-1">
                Value set to {h.value}
                {unit ? <span className="font-mono text-[10px] text-ink-3"> {unit}</span> : null}
              </span>
              <span className="font-mono text-[10px] text-ink-3">by {h.by.name}</span>
            </div>
            {h.note && (
              <div className="mt-0.5 font-mono text-[10.5px] leading-snug text-ink-3">
                {h.note}
              </div>
            )}
          </div>
          <div className="font-mono text-[10.5px] text-ink-2 tracking-wide whitespace-nowrap">
            {fmtRelDate(h.at)}
          </div>
        </div>
      ))}
      <p className="mt-3 text-[11px] leading-relaxed text-ink-3">
        Rolling value history from `lineage.valueHistory`. Newest first.
        Production augments each entry with diff against the prior value and a
        revert action gated by workflow status.
      </p>
    </div>
  );
}

function CommentsTab() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line bg-panel-soft px-8 text-center">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            No comments yet
          </div>
          <p className="max-w-[280px] text-[11.5px] leading-relaxed text-ink-3">
            Use comments to flag methodology decisions, anomalies and CRO sign-off requests against this specific datapoint.
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 border-t border-line-soft px-5 py-3">
        <textarea
          rows={2}
          placeholder="Write a comment… @-mentions coming soon"
          className="w-full rounded-md border border-line bg-panel px-2.5 py-2 text-[12px] text-ink-1 placeholder:text-ink-4 focus:border-ink-3 focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-end">
          <button
            type="button"
            disabled
            className="rounded-md bg-canvas-edge px-3 py-1.5 text-[12px] font-medium text-ink-4"
          >
            Post comment
          </button>
        </div>
      </div>
    </div>
  );
}
