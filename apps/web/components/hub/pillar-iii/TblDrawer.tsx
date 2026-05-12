'use client';

import { useMemo, useState, useTransition } from 'react';
import type { Datapoint } from '@e60/domain';
import { useDatapoints } from '@e60/api-client/hooks';
import { Drawer, Tag, type TagVariant } from '@e60/ui';
import seed from '@/data/seed/datapoints.json';
import {
  applyDemoOverlay,
} from '@/components/hub/repository/demo-overlay';
import { DatapointLink } from '@/components/hub/repository/DatapointLink';
import {
  clearTblSignoff,
  upsertTblSignoff,
  type SignoffDecision,
  type SignoffRole,
} from '@/app/actions/pillar';
import {
  FAMILY_LABEL,
  STATUS_LABEL,
  type TblStatus,
  type TblTemplate,
} from './data';
import type { UserSignoff } from './PillarIIIView';

const SEED_DATAPOINTS = applyDemoOverlay(seed as unknown as Datapoint[]);
const SEED_RESPONSE = {
  items: SEED_DATAPOINTS,
  total: SEED_DATAPOINTS.length,
};

interface TblDrawerProps {
  tbl: TblTemplate | null;
  userSignoffs: UserSignoff[];
  onClose: () => void;
}

const STATUS_VARIANT: Record<TblStatus, TagVariant> = {
  live: 'green',
  in_prep: 'orange',
  methodology_gap: 'red',
  scheduled: 'gray',
};

const FAMILY_VARIANT: Record<TblTemplate['family'], TagVariant> = {
  transition: 'red',
  physical: 'orange',
  taxonomy: 'green',
  mitigation: 'blue',
};

const SIGNOFF_LABEL: Record<'signed' | 'pending' | 'na', string> = {
  signed: 'Signed',
  pending: 'Pending',
  na: 'N/A',
};

const SIGNOFF_VARIANT: Record<'signed' | 'pending' | 'na', TagVariant> = {
  signed: 'green',
  pending: 'orange',
  na: 'gray',
};

export function TblDrawer({ tbl, userSignoffs, onClose }: TblDrawerProps) {
  const open = !!tbl;

  // Datapoints flow through useDatapoints; deduped against the rest of
  // the app's calls.
  const { data } = useDatapoints(undefined, { initialData: SEED_RESPONSE });
  const datapointById = useMemo(
    () => new Map((data?.items ?? SEED_DATAPOINTS).map((d) => [d.id, d])),
    [data],
  );

  const feedingDps = useMemo(() => {
    if (!tbl) return [] as Datapoint[];
    return tbl.feedingDatapointIds
      .map((id) => datapointById.get(id))
      .filter((d): d is Datapoint => !!d);
  }, [tbl, datapointById]);

  if (!tbl) {
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
      eyebrow={`EBA Pillar III ESG · ${tbl.code}`}
      title={tbl.title}
      meta={
        <>
          <Tag variant={FAMILY_VARIANT[tbl.family]}>{FAMILY_LABEL[tbl.family]}</Tag>
          <Tag variant={STATUS_VARIANT[tbl.status]}>{STATUS_LABEL[tbl.status]}</Tag>
        </>
      }
    >
      <Drawer.Tabs
        sections={[
          {
            id: 'datapoints',
            label: 'Datapoints',
            count: feedingDps.length || undefined,
            content: <DatapointsTab tbl={tbl} datapoints={feedingDps} />,
          },
          {
            id: 'narrative',
            label: 'Narrative',
            content: <NarrativeTab tbl={tbl} />,
          },
          {
            id: 'signoff',
            label: 'Sign-off',
            content: <SignoffTab tbl={tbl} userSignoffs={userSignoffs} />,
          },
          {
            id: 'history',
            label: 'History',
            content: <HistoryTab tbl={tbl} />,
          },
        ]}
      />
    </Drawer>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────

function DatapointsTab({
  tbl,
  datapoints,
}: {
  tbl: TblTemplate;
  datapoints: Datapoint[];
}) {
  return (
    <div className="px-5 py-4">
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Stat label="Datapoints" value={String(tbl.datapointCount)} />
        <Stat label="Rows in template" value={String(tbl.rowCount)} />
      </div>

      {datapoints.length === 0 ? (
        <p className="rounded-md border border-dashed border-line bg-panel-soft px-4 py-8 text-center text-[12px] text-ink-3">
          No EFRAG datapoint mapping defined yet · this template draws from
          domain-specific connectors (Taxonomy registries, Climate X hazards,
          internal corporate book) rather than the ESRS catalogue.
        </p>
      ) : (
        <ul className="divide-y divide-line-soft rounded-md border border-line-soft">
          {datapoints.map((dp) => (
            <li
              key={dp.id}
              className="flex items-start gap-2.5 px-3 py-2 text-[12px] text-ink-1"
            >
              <DatapointLink
                id={dp.id}
                className="mt-px flex-shrink-0 w-[110px] text-left text-[10px] text-ink-3"
              />
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
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-ink-3">
        Pillar III templates are built from the canonical Datapoint Repository
        plus regulator-specific lookups (NACE sector, residual maturity buckets,
        hazard zone). Click a row to jump to the datapoint detail.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line-soft bg-panel-soft px-3 py-2">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
        {label}
      </div>
      <div className="mt-0.5 text-[18px] font-semibold tracking-tight text-ink-1">
        {value}
      </div>
    </div>
  );
}

function NarrativeTab({ tbl }: { tbl: TblTemplate }) {
  return (
    <div className="px-5 py-4">
      <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
        Methodology + assumptions
      </div>
      <div className="rounded-md border border-line-soft bg-panel-soft px-4 py-4 text-[12.5px] leading-relaxed text-ink-1">
        <p className="m-0 whitespace-pre-line">{tbl.narrative}</p>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-ink-3">
        [Demo content · production renders editable rich text with version
        diffs in the History tab and methodology changes flagged for CRO
        review.]
      </p>
    </div>
  );
}

interface SignoffRow {
  role: SignoffRole;
  label: string;
  catalogue: SignoffDecision;
  person: string;
  user: UserSignoff | undefined;
}

function SignoffTab({
  tbl,
  userSignoffs,
}: {
  tbl: TblTemplate;
  userSignoffs: UserSignoff[];
}) {
  const byRole = useMemo(
    () => new Map(userSignoffs.map((u) => [u.role, u])),
    [userSignoffs],
  );

  const rows: SignoffRow[] = [
    {
      role: 'cro',
      label: 'CRO sign-off',
      catalogue: tbl.signoff.cro,
      person: 'Marta Cabrera · Chief Risk Officer',
      user: byRole.get('cro'),
    },
    {
      role: 'cso',
      label: 'CSO sign-off',
      catalogue: tbl.signoff.cso,
      person: 'Carlos Vidal · Chief Sustainability Officer',
      user: byRole.get('cso'),
    },
    {
      role: 'auditor',
      label: 'External auditor',
      catalogue: tbl.signoff.auditor,
      person: 'KPMG España',
      user: byRole.get('auditor'),
    },
  ];

  return (
    <div className="px-5 py-4 space-y-3">
      <div>
        <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Approval state
        </div>
        <ul className="divide-y divide-line-soft rounded-md border border-line-soft">
          {rows.map((r) => (
            <SignoffRowCard key={r.role} tblNum={tbl.num} row={r} />
          ))}
        </ul>
      </div>

      <div className="rounded-md border border-line-soft bg-panel-soft px-3 py-2.5">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Deadline
        </div>
        <div className="mt-0.5 text-[14px] font-semibold text-ink-1">
          {tbl.deadline}
        </div>
        <div className="font-mono text-[10.5px] text-ink-3 tracking-wide">
          EBA Pillar III ESG · ITS reporting cycle
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-ink-3">
        Your signatures persist to <code className="font-mono">
        public.pillar_tbl_signoffs</code> · RLS-scoped to your account ·
        catalogue defaults shown when you haven&apos;t acted yet.
      </p>
    </div>
  );
}

function SignoffRowCard({
  tblNum,
  row,
}: {
  tblNum: number;
  row: SignoffRow;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const effective: SignoffDecision = row.user?.decision ?? row.catalogue;
  const fromUser = !!row.user;

  function handleSet(decision: SignoffDecision) {
    setError(null);
    startTransition(async () => {
      const result = await upsertTblSignoff({
        tblNum,
        role: row.role,
        decision,
      });
      if ('error' in result) setError(result.error);
    });
  }

  function handleClear() {
    setError(null);
    startTransition(async () => {
      const result = await clearTblSignoff(tblNum, row.role);
      if ('error' in result) setError(result.error);
    });
  }

  return (
    <li className="flex flex-col gap-2 px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12.5px] font-medium text-ink-1">
            {row.label}
          </div>
          <div className="font-mono text-[10.5px] text-ink-3 tracking-wide line-clamp-1">
            {row.person}
          </div>
        </div>
        <Tag variant={SIGNOFF_VARIANT[effective]}>
          {SIGNOFF_LABEL[effective]}
        </Tag>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {(['signed', 'pending', 'na'] as const).map((d) => {
          const active = effective === d;
          return (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => handleSet(d)}
              disabled={isPending}
              className={
                'rounded-md border px-2 py-[3px] text-[10.5px] font-medium transition-colors disabled:opacity-60 ' +
                (active
                  ? 'border-ink-1 bg-ink-1 text-white'
                  : 'border-line bg-panel text-ink-2 hover:border-ink-5 hover:text-ink-1')
              }
            >
              {SIGNOFF_LABEL[d]}
            </button>
          );
        })}
        {fromUser && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isPending}
            className="rounded-md border border-line bg-panel px-2 py-[3px] text-[10.5px] font-medium text-ink-3 transition-colors hover:border-nfq-red hover:text-nfq-red disabled:opacity-60"
          >
            Reset
          </button>
        )}
        {row.user && (
          <span className="ml-1 font-mono text-[9.5px] text-ink-3">
            signed {new Date(row.user.signedAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        )}
        {error && (
          <span className="text-[10.5px] text-nfq-red" role="alert">
            {error}
          </span>
        )}
      </div>
    </li>
  );
}

function HistoryTab({ tbl }: { tbl: TblTemplate }) {
  const events = [
    { label: `Status set to ${STATUS_LABEL[tbl.status]}`, who: 'Pilot Bank ESG Team', when: '07 may 2026' },
    { label: 'Datapoint coverage refreshed', who: 'auto · scheduler', when: '06 may 2026' },
    { label: 'Methodology v2 saved', who: 'Carlos Vidal · CSO', when: '23 abr 2026' },
    { label: 'Template instantiated for Q4 2025', who: 'system', when: '02 oct 2025' },
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
    </div>
  );
}
