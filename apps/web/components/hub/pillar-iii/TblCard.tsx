'use client';

import type { PillarTblSummary } from '@e60/api-client';
import { Tag, type TagVariant } from '@e60/ui';
import { FAMILY_LABEL, STATUS_LABEL, type TblStatus } from './data';

interface TblCardProps {
  tbl: PillarTblSummary;
  onOpen: (num: number) => void;
}

const STATUS_VARIANT: Record<TblStatus, TagVariant> = {
  live: 'green',
  in_prep: 'orange',
  methodology_gap: 'red',
  scheduled: 'gray',
};

const FAMILY_ACCENT: Record<PillarTblSummary['family'], string> = {
  transition: 'border-l-nfq-red',
  physical: 'border-l-nfq-orange',
  taxonomy: 'border-l-nfq-green',
  mitigation: 'border-l-nfq-blue',
};

const FAMILY_TEXT: Record<PillarTblSummary['family'], string> = {
  transition: 'text-nfq-red',
  physical: 'text-nfq-orange',
  taxonomy: 'text-nfq-green',
  mitigation: 'text-nfq-blue',
};

function signoffSummary(s: PillarTblSummary['signoff']): string {
  const states = [s.cro, s.cso, s.auditor];
  const signed = states.filter((x) => x === 'signed').length;
  const total = states.filter((x) => x !== 'na').length;
  return total === 0 ? 'No sign-off required' : `${signed}/${total} signed`;
}

export function TblCard({ tbl, onOpen }: TblCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(tbl.num)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(tbl.num);
        }
      }}
      className={
        'group flex cursor-pointer flex-col gap-2 rounded-lg border border-line border-l-[3px] bg-panel p-4 shadow-e60-sm transition-all hover:-translate-y-[1px] hover:border-ink-5 hover:shadow-e60-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-1 ' +
        FAMILY_ACCENT[tbl.family]
      }
      data-tbl={tbl.code}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className={`font-mono text-[10px] font-semibold uppercase tracking-[0.14em] ${FAMILY_TEXT[tbl.family]}`}>
            {tbl.code} · {FAMILY_LABEL[tbl.family]}
          </div>
          <h3 className="mt-1 line-clamp-2 text-[13.5px] font-semibold leading-snug tracking-tight text-ink-1">
            {tbl.title}
          </h3>
        </div>
        <Tag variant={STATUS_VARIANT[tbl.status]}>{STATUS_LABEL[tbl.status]}</Tag>
      </header>
      <p className="line-clamp-2 text-[12px] leading-relaxed text-ink-3">{tbl.summary}</p>
      <footer className="mt-2 flex items-center justify-between border-t border-line-soft pt-2 font-mono text-[10px] tracking-wide text-ink-3">
        <span>
          <span className="text-ink-1">{tbl.datapointCount}</span> datapoints · {tbl.rowCount} rows
        </span>
        <span className="line-clamp-1">{signoffSummary(tbl.signoff)} · {tbl.deadline}</span>
      </footer>
    </article>
  );
}
