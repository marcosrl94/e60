'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type {
  Datapoint,
  DatapointStatus,
  EsrsTopic,
  RegulatoryCrosswalk,
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
    size: 160,
    enableSorting: false,
    meta: { muted: true },
    cell: ({ row }) => sourceLabel(row.original),
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
