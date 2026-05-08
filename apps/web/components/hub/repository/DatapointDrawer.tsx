'use client';

import type { Datapoint, RegulatoryCrosswalk } from '@e60/domain';
import { Drawer, FrameworkChip, Tag, type TagVariant } from '@e60/ui';
import {
  CROSSWALK_LABEL,
  STATUS_LABEL,
  STATUS_VARIANT,
  TOPIC_LABEL,
} from './columns';

interface DatapointDrawerProps {
  datapoint: Datapoint | null;
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

export function DatapointDrawer({ datapoint, onClose }: DatapointDrawerProps) {
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
            content: <SourceTab datapoint={datapoint} />,
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

function DetailTab({ datapoint }: { datapoint: Datapoint }) {
  return (
    <div className="px-5 py-4 space-y-5">
      {datapoint.latestValue && (
        <section>
          <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            Latest value
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-[28px] font-semibold tracking-tight text-ink-1">
              {datapoint.latestValue}
            </div>
            {datapoint.unit && (
              <div className="font-mono text-[12px] text-ink-3">{datapoint.unit}</div>
            )}
          </div>
          <MiniSparkline />
          <div className="mt-1 flex justify-between font-mono text-[9.5px] text-ink-3 tracking-wide">
            <span>2018</span>
            <span>2025</span>
          </div>
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

function SourceTab({ datapoint }: { datapoint: Datapoint }) {
  if (!datapoint.source) {
    return (
      <div className="px-5 py-12 text-center text-[12px] text-ink-3">
        No source assigned yet · this datapoint is not connected to an engine, connector or manual entry.
      </div>
    );
  }
  const s = datapoint.source;
  const sourceLabel =
    s.identifier === 'carbon_intelligence'
      ? 'Carbon Intelligence'
      : s.identifier === 'alquid_nz'
        ? 'ALQUID NZ'
        : s.identifier;

  return (
    <div className="px-5 py-4 space-y-5">
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

      {s.dataQualityScore && (
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

      <section>
        <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Lineage
        </div>
        <p className="text-[12.5px] leading-relaxed text-ink-2">
          {datapoint.id === 'E1-6_01'
            ? 'Aggregated from 3 input datapoints (Scope 1 + Scope 2 + Scope 3.15). Auto-recalc on every Carbon Intelligence sync. Audit trail available in Trust Center.'
            : 'No upstream lineage recorded for this datapoint yet. When a value is captured, the engine and timestamp are logged here.'}
        </p>
      </section>
    </div>
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

function HistoryTab({ datapoint }: { datapoint: Datapoint }) {
  const events =
    datapoint.status === 'live' && datapoint.latestValue
      ? [
          { label: `Value captured: ${datapoint.latestValue} ${datapoint.unit ?? ''}`, who: 'Carbon Intelligence · auto', when: 'today 14:23' },
          { label: 'Status set to live', who: 'Marta Cabrera · CSO', when: '06 may 2026' },
          { label: 'Mapping to GRI 305 added', who: 'Pilot Bank ESG Team', when: '12 abr 2026' },
          { label: 'Datapoint imported from EFRAG IG3', who: 'system', when: '14 mar 2026' },
        ]
      : [
          { label: 'Datapoint imported from EFRAG IG3', who: 'system', when: '14 mar 2026' },
        ];

  return (
    <div className="px-5 py-4 space-y-2.5">
      {events.map((e, i) => (
        <div
          key={i}
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
            {e.when}
          </div>
        </div>
      ))}
      <p className="mt-3 text-[11px] leading-relaxed text-ink-3">
        [Demo content · production renders the immutable audit trail with full diffs and the option to revert.]
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
