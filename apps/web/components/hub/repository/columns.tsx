'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type {
  Datapoint,
  DatapointStatus,
  DatapointWorkflowStatus,
  EsrsTopic,
  LineageSource,
  RegulatoryCrosswalk,
  UserRef,
} from '@e60/domain';
import { FrameworkChip, Tag, type TagVariant } from '@e60/ui';

const STATUS_LABEL: Record<DatapointStatus, string> = {
  live: 'Live',
  partial: 'Partial',
  blocked: 'Blocked',
  pending: 'Pending',
  not_material: 'Not material',
  custom: 'Custom',
};

const STATUS_VARIANT: Record<DatapointStatus, TagVariant> = {
  live: 'green',
  partial: 'orange',
  blocked: 'red',
  pending: 'gray',
  not_material: 'gray',
  custom: 'purple',
};

export const CROSSWALK_LABEL: Record<RegulatoryCrosswalk, string> = {
  SFDR: 'SFDR',
  PILLAR_3: 'EBA Pillar III',
  BENCHMARK: 'EU Benchmarks',
  CLIMATE_LAW: 'EU Climate Law',
};

const TOPIC_LABEL: Record<EsrsTopic, string> = {
  E1: 'Climate change',
  E2: 'Pollution',
  E3: 'Water',
  E4: 'Biodiversity',
  E5: 'Resource use',
  S1: 'Own workforce',
  S2: 'Value chain',
  S3: 'Communities',
  S4: 'Consumers',
  G1: 'Business conduct',
  GENERAL: 'ESRS 1+2',
};

function sourceLabel(dp: Datapoint): string {
  if (!dp.source) return 'Not assigned';
  if (dp.source.type === 'engine') {
    return dp.source.identifier === 'carbon_intelligence'
      ? 'Carbon Intelligence'
      : dp.source.identifier === 'alquid_nz'
        ? 'ALQUID NZ'
        : dp.source.identifier;
  }
  if (dp.source.type === 'manual') return 'Manual';
  if (dp.source.type === 'connector') return dp.source.identifier;
  return 'Derived';
}

// ── New: lineage source classification ─────────────────────────────────

const LINEAGE_SOURCE_LABEL: Record<LineageSource, string> = {
  manual: 'Manual',
  computed: 'Computed',
  'carbon-intel': 'Carbon Intel',
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

/**
 * Derive a lineage classification for a datapoint. When the explicit
 * `lineage.source` is set, use it. Otherwise infer from the legacy
 * `source.type` field so the column has meaningful coverage across the
 * 1184 datapoints without forcing a full lineage backfill.
 */
export function lineageSourceOf(dp: Datapoint): LineageSource | null {
  if (dp.lineage?.source) return dp.lineage.source;
  if (!dp.source) return null;
  if (dp.source.type === 'manual') return 'manual';
  if (dp.source.type === 'derived') return 'computed';
  if (dp.source.type === 'connector') return 'data-layer';
  if (dp.source.type === 'engine') {
    return dp.source.identifier === 'carbon_intelligence' ? 'carbon-intel' : 'external';
  }
  return null;
}

// ── Workflow lookups (kept here so columns + filters share them) ───────

export const WORKFLOW_LABEL: Record<DatapointWorkflowStatus, string> = {
  empty: 'Empty',
  draft: 'Draft',
  review: 'In review',
  approved: 'Approved',
  locked: 'Locked',
};

export const WORKFLOW_VARIANT: Record<DatapointWorkflowStatus, TagVariant> = {
  empty: 'gray',
  draft: 'orange',
  review: 'blue',
  approved: 'green',
  locked: 'purple',
};

// ── Last-updated helper ───────────────────────────────────────────────

function lastUpdatedAtOf(dp: Datapoint): string | null {
  return dp.lineage?.lastUpdatedAt ?? dp.source?.lastSync ?? null;
}

function relativeTime(iso: string, now: number = Date.now()): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return iso;
  const diffMs = now - d;
  const min = Math.round(diffMs / 60000);
  if (min < 60) return `${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d`;
  const mo = Math.round(day / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.round(mo / 12)}y`;
}

function OwnerCell({ owner, lastUpdatedBy }: { owner?: string; lastUpdatedBy?: UserRef }) {
  if (lastUpdatedBy) {
    return (
      <span className="flex min-w-0 items-center gap-1.5">
        <span
          title={lastUpdatedBy.email ?? lastUpdatedBy.name}
          aria-hidden
          className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-nfq-purpleBg font-mono text-[8.5px] font-semibold tracking-wide text-nfq-purple"
        >
          {lastUpdatedBy.initials ?? lastUpdatedBy.name.slice(0, 2).toUpperCase()}
        </span>
        <span className="truncate text-[11.5px] text-ink-1">{lastUpdatedBy.name}</span>
      </span>
    );
  }
  if (owner) {
    return <span className="truncate text-[11.5px] text-ink-2">{owner}</span>;
  }
  return <span className="text-ink-4">—</span>;
}

export const datapointColumns: ColumnDef<Datapoint>[] = [
  {
    id: 'id',
    accessorKey: 'id',
    header: 'ID',
    size: 140,
    cell: ({ row }) => (
      <span className="font-mono text-[10.5px] tracking-wide text-ink-2">{row.original.id}</span>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Datapoint',
    cell: ({ row }) => {
      const dp = row.original;
      return (
        <div className="flex min-w-0 flex-col gap-[1px]">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="line-clamp-1 text-[12px] text-ink-1">{dp.name}</span>
            {dp.phaseInYears && (
              <span
                title={`Subject to ${dp.phaseInYears}y phase-in (EFRAG IG3 Appendix C)`}
                className="shrink-0 rounded-[3px] bg-nfq-orangeBg px-1 font-mono text-[9px] font-medium text-nfq-orange"
              >
                +{dp.phaseInYears}y
              </span>
            )}
            {dp.voluntary && (
              <span
                title="Voluntary disclosure (EFRAG IG3 Appendix C voluntary)"
                className="shrink-0 rounded-[3px] bg-nfq-purpleBg px-1 font-mono text-[9px] font-medium text-nfq-purple"
              >
                vol.
              </span>
            )}
            {dp.conditional && (
              <span
                title="Conditional / alternative datapoint"
                className="shrink-0 rounded-[3px] bg-canvas-edge px-1 font-mono text-[9px] font-medium text-ink-3"
              >
                cond.
              </span>
            )}
          </div>
          <span className="line-clamp-1 font-mono text-[9.5px] text-ink-3 tracking-wide">
            {TOPIC_LABEL[dp.topic]} · {dp.esrsDisclosure ?? '—'}
            {dp.paragraph && <> · § {dp.paragraph}</>}
          </span>
        </div>
      );
    },
  },
  {
    id: 'frameworks',
    header: 'Crosswalk',
    size: 240,
    enableSorting: false,
    cell: ({ row }) => {
      const dp = row.original;
      const mappings = dp.mappings.slice(0, 2);
      const extraMappings = dp.mappings.length - mappings.length;
      return (
        <div className="flex flex-wrap items-center">
          {mappings.map((m, i) => (
            <FrameworkChip key={`m-${m.framework}-${i}`} framework={m.framework} />
          ))}
          {dp.crosswalk.map((c) => (
            <FrameworkChip
              key={`c-${c}`}
              framework={CROSSWALK_LABEL[c]}
              className="border-line bg-nfq-blueBg/40 text-nfq-blue"
            />
          ))}
          {extraMappings > 0 && (
            <span className="font-mono text-[9.5px] text-ink-3">+{extraMappings}</span>
          )}
        </div>
      );
    },
  },
  {
    id: 'source',
    header: 'Source',
    size: 130,
    enableSorting: false,
    cell: ({ row }) => {
      const dp = row.original;
      const ls = lineageSourceOf(dp);
      if (ls) {
        return (
          <Tag variant={LINEAGE_SOURCE_VARIANT[ls]}>{LINEAGE_SOURCE_LABEL[ls]}</Tag>
        );
      }
      const label = sourceLabel(dp);
      return label === 'Not assigned' ? (
        <span className="text-ink-4">—</span>
      ) : (
        <span className="font-mono text-[10.5px] text-ink-3">{label}</span>
      );
    },
  },
  {
    id: 'value',
    header: 'Last value',
    size: 120,
    enableSorting: false,
    meta: { align: 'right' },
    cell: ({ row }) => {
      const dp = row.original;
      if (!dp.latestValue) return <span className="text-ink-4">—</span>;
      return (
        <span className="text-[12px] text-ink-1">
          {dp.latestValue}
          {dp.unit && (
            <span className="ml-1 font-mono text-[9.5px] text-ink-3">{dp.unit}</span>
          )}
        </span>
      );
    },
  },
  {
    id: 'owner',
    header: 'Owner',
    size: 160,
    enableSorting: false,
    cell: ({ row }) => (
      <OwnerCell
        owner={row.original.owner}
        lastUpdatedBy={row.original.lineage?.lastUpdatedBy}
      />
    ),
  },
  {
    id: 'evidence',
    header: 'Ev.',
    size: 60,
    enableSorting: true,
    accessorFn: (dp) => dp.evidenceCount ?? 0,
    meta: { align: 'center' },
    cell: ({ row }) => {
      const n = row.original.evidenceCount ?? 0;
      if (n === 0) return <span className="text-ink-4">—</span>;
      return (
        <span
          title={`${n} evidence attachment${n === 1 ? '' : 's'}`}
          className="inline-flex items-center gap-0.5 font-mono text-[10.5px] tabular-nums text-ink-2"
        >
          <svg
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            className="h-3 w-3"
            aria-hidden
          >
            <path d="M3.5 1.5h4l2 2v7h-6v-9zM5 1.5v2h2.5" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          {n}
        </span>
      );
    },
  },
  {
    id: 'updated',
    header: 'Updated',
    size: 90,
    enableSorting: true,
    accessorFn: (dp) => lastUpdatedAtOf(dp) ?? '',
    meta: { align: 'right' },
    cell: ({ row }) => {
      const iso = lastUpdatedAtOf(row.original);
      if (!iso) return <span className="text-ink-4">—</span>;
      return (
        <span
          title={new Date(iso).toLocaleString('en-GB')}
          className="font-mono text-[10.5px] tabular-nums text-ink-2"
        >
          {relativeTime(iso)} ago
        </span>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    size: 110,
    meta: { align: 'center' },
    cell: ({ row }) => (
      <Tag variant={STATUS_VARIANT[row.original.status]}>
        {STATUS_LABEL[row.original.status]}
      </Tag>
    ),
  },
];

export { TOPIC_LABEL, STATUS_LABEL, STATUS_VARIANT };
