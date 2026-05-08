'use client';

import { useMemo } from 'react';
import type { Datapoint, EsrsTopic } from '@e60/domain';
import { Drawer, FrameworkChip, Tag, type TagVariant } from '@e60/ui';
import seed from '@/data/seed/datapoints.json';
import {
  applyDemoOverlay,
} from '@/components/hub/repository/demo-overlay';
import {
  type DisclosureCardData,
  type DisclosureStatus,
} from './data';
import { DISCLOSURE_DATAPOINTS } from './disclosure-datapoint-mapping';

const datapoints = applyDemoOverlay(seed as unknown as Datapoint[]);
const datapointById = new Map(datapoints.map((d) => [d.id, d]));

interface DisclosureDrawerProps {
  disclosure: DisclosureCardData | null;
  onClose: () => void;
}

const STATUS_LABEL: Record<DisclosureStatus, string> = {
  published: 'Published',
  submitted: 'Submitted',
  in_prep: 'In prep',
  scheduled: 'Scheduled',
};

const STATUS_VARIANT: Record<DisclosureStatus, TagVariant> = {
  published: 'green',
  submitted: 'green',
  in_prep: 'orange',
  scheduled: 'gray',
};

const TOPIC_LABEL: Record<EsrsTopic, string> = {
  E1: 'E1 · Climate change',
  E2: 'E2 · Pollution',
  E3: 'E3 · Water',
  E4: 'E4 · Biodiversity',
  E5: 'E5 · Resource use',
  S1: 'S1 · Own workforce',
  S2: 'S2 · Value chain workers',
  S3: 'S3 · Communities',
  S4: 'S4 · Consumers',
  G1: 'G1 · Business conduct',
  GENERAL: 'ESRS 1 + 2 · Cross-cutting',
};

const DP_STATUS_VARIANT: Record<Datapoint['status'], TagVariant> = {
  live: 'green',
  partial: 'orange',
  blocked: 'red',
  pending: 'gray',
  not_material: 'gray',
  custom: 'purple',
};

const DP_STATUS_LABEL: Record<Datapoint['status'], string> = {
  live: 'Live',
  partial: 'Partial',
  blocked: 'Blocked',
  pending: 'Pending',
  not_material: 'N/A',
  custom: 'Custom',
};

export function DisclosureDrawer({ disclosure, onClose }: DisclosureDrawerProps) {
  const open = !!disclosure;

  // Resolve the disclosure's datapoints from seed; group by topic with
  // canonical ordering.
  const groupedDps = useMemo(() => {
    if (!disclosure) return [] as { topic: EsrsTopic; items: Datapoint[] }[];
    const codes = DISCLOSURE_DATAPOINTS[disclosure.id] ?? [];
    const resolved = codes
      .map((c) => datapointById.get(c))
      .filter((d): d is Datapoint => !!d);
    const order: EsrsTopic[] = [
      'GENERAL',
      'E1',
      'E2',
      'E3',
      'E4',
      'E5',
      'S1',
      'S2',
      'S3',
      'S4',
      'G1',
    ];
    const byTopic = new Map<EsrsTopic, Datapoint[]>();
    for (const dp of resolved) {
      if (!byTopic.has(dp.topic)) byTopic.set(dp.topic, []);
      byTopic.get(dp.topic)!.push(dp);
    }
    return order
      .filter((t) => byTopic.has(t))
      .map((topic) => ({ topic, items: byTopic.get(topic)! }));
  }, [disclosure]);

  const totalDps = groupedDps.reduce((acc, g) => acc + g.items.length, 0);
  const liveCount = groupedDps.reduce(
    (acc, g) => acc + g.items.filter((d) => d.status === 'live').length,
    0,
  );

  if (!disclosure) {
    return (
      <Drawer open={false} onClose={onClose} title="">
        <div />
      </Drawer>
    );
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow={disclosure.framework}
      title={disclosure.title}
      meta={
        <Tag variant={STATUS_VARIANT[disclosure.status]}>
          {STATUS_LABEL[disclosure.status]}
        </Tag>
      }
    >
      <Drawer.Tabs
        sections={[
          {
            id: 'datapoints',
            label: 'Datapoints',
            count: totalDps > 0 ? totalDps : undefined,
            content: (
              <DatapointsTab grouped={groupedDps} liveCount={liveCount} totalDps={totalDps} />
            ),
          },
          {
            id: 'narrative',
            label: 'Narrative',
            content: <NarrativeTab disclosure={disclosure} />,
          },
          {
            id: 'mapping',
            label: 'Mapping',
            content: <MappingTab disclosure={disclosure} />,
          },
          {
            id: 'history',
            label: 'History',
            content: <HistoryTab disclosure={disclosure} />,
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

function DatapointsTab({
  grouped,
  liveCount,
  totalDps,
}: {
  grouped: { topic: EsrsTopic; items: Datapoint[] }[];
  liveCount: number;
  totalDps: number;
}) {
  if (totalDps === 0) {
    return (
      <div className="px-5 py-12 text-center text-[12px] text-ink-3">
        No datapoint mapping defined for this disclosure yet.
      </div>
    );
  }
  const pct = totalDps > 0 ? Math.round((liveCount / totalDps) * 100) : 0;

  return (
    <div className="px-5 py-4">
      <div className="mb-4 flex items-center justify-between gap-4 rounded-md border border-line-soft bg-panel-soft px-3 py-2.5">
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            Datapoint coverage
          </div>
          <div className="mt-0.5 text-[14px] font-semibold text-ink-1">
            {liveCount} live · {totalDps - liveCount} pending · {totalDps} total
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-[18px] font-semibold tracking-tight text-ink-1">
            {pct}%
          </div>
          <div className="h-1.5 w-[120px] overflow-hidden rounded-full bg-canvas-edge">
            <div
              className="h-full rounded-full bg-nfq-green"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {grouped.map(({ topic, items }) => (
        <section key={topic} className="mb-5">
          <header className="mb-2 flex items-center justify-between">
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-2">
              {TOPIC_LABEL[topic]}
            </h3>
            <span className="font-mono text-[10px] text-ink-3 tracking-wide">
              {items.length} datapoints
            </span>
          </header>
          <ul className="divide-y divide-line-soft rounded-md border border-line-soft">
            {items.map((dp) => (
              <li
                key={dp.id}
                className="flex items-start gap-2.5 px-3 py-2 text-[12px] text-ink-1"
              >
                <span className="mt-px font-mono text-[10px] text-ink-3 tracking-wide flex-shrink-0 w-[110px]">
                  {dp.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2">{dp.name}</span>
                  {dp.esrsDisclosure && (
                    <span className="mt-0.5 block font-mono text-[9.5px] text-ink-3 tracking-wide">
                      {dp.esrsDisclosure}
                      {dp.paragraph && ` · § ${dp.paragraph}`}
                    </span>
                  )}
                </span>
                {dp.latestValue && (
                  <span className="flex-shrink-0 font-mono text-[11px] tabular-nums text-ink-1">
                    {dp.latestValue}
                    {dp.unit && (
                      <span className="ml-1 text-[9.5px] text-ink-3">{dp.unit}</span>
                    )}
                  </span>
                )}
                <Tag variant={DP_STATUS_VARIANT[dp.status]}>
                  {DP_STATUS_LABEL[dp.status]}
                </Tag>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function NarrativeTab({ disclosure }: { disclosure: DisclosureCardData }) {
  return (
    <div className="px-5 py-4">
      <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
        Cover narrative · executive summary
      </div>
      <div className="prose prose-sm max-w-none rounded-md border border-line-soft bg-panel-soft px-4 py-4 text-[12.5px] leading-relaxed text-ink-1">
        <p className="m-0">
          <strong>{disclosure.title}.</strong> {disclosure.subtitle}
        </p>
        <p className="mt-3">
          During FY 2025, Pilot Bank Iberia advanced its decarbonisation plan
          aligned with the SBTi 1.5°C pathway. Total operational footprint
          stood at 23,447 tCO₂e (Scope 1+2 market-based, own operations),
          down 18% YoY thanks to the renewable PPA signed in May. The
          banking-book financed emissions (Scope 3.15) reached 14.7 MtCO₂e
          across 487 corporate counterparties, with PCAF v3 data quality
          improving to 2.84/5.
        </p>
        <p className="mt-3">
          Key deliverables this period include the validated Net Zero
          trajectory (cf. ALQUID NZ module), the closure of the materiality
          assessment with KPMG sign-off, and the rollout of the
          counterparty engagement programme covering the top 80% of EAD by
          sector.
        </p>
        <p className="mt-3 text-ink-3">
          [Demo content · in production this is editable rich text bound to
          the disclosure record, with version diffs in the History tab.]
        </p>
      </div>
    </div>
  );
}

function MappingTab({ disclosure }: { disclosure: DisclosureCardData }) {
  return (
    <div className="px-5 py-4">
      <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
        Framework mapping
      </div>
      <div className="rounded-md border border-line-soft bg-panel-soft px-4 py-3">
        <div className="text-[14px] font-semibold text-ink-1">
          {disclosure.framework}
        </div>
        <div className="mt-1 text-[12px] text-ink-2">
          This disclosure is built from the canonical Datapoint Repository.
          Each datapoint listed in the Datapoints tab is mapped 1-to-1
          against this framework's official taxonomy code; inputs without
          a mapping are flagged in the Repository view and don't ship until
          they're either mapped or marked not-material.
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          <FrameworkChip framework="CSRD" />
          <FrameworkChip framework="GRI" />
          <FrameworkChip framework="CDP" />
          <FrameworkChip framework="TCFD" />
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-ink-3">
          [Demo content · the production mapping table will be sortable and
          link to the underlying mapping authority spec where available.]
        </p>
      </div>
    </div>
  );
}

function HistoryTab({ disclosure }: { disclosure: DisclosureCardData }) {
  const events = [
    {
      label: 'Status set to ' + disclosure.status,
      who: 'Marta Cabrera · CSO',
      when: disclosure.date,
    },
    { label: 'Datapoint coverage refresh', who: 'auto · scheduler', when: '07 may 2026' },
    { label: 'Cover narrative v3 saved', who: 'Marta Cabrera · CSO', when: '02 may 2026' },
    { label: 'Disclosure created', who: 'Pilot Bank ESG Team', when: '14 mar 2026' },
  ];
  return (
    <div className="px-5 py-4">
      <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
        Change history
      </div>
      <ol className="space-y-2.5">
        {events.map((e, i) => (
          <li
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
            <div className="font-mono text-[10.5px] text-ink-2 tracking-wide">
              {e.when}
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[11px] leading-relaxed text-ink-3">
        [Demo content · production renders an immutable audit trail with
        diffs and the option to revert to any prior version.]
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
            Use comments to coordinate sign-off, flag methodology decisions
            and keep an auditable conversation per disclosure.
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
