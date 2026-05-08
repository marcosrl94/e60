import { Panel, Tag } from '@e60/ui';
import { PillarIIIGallery } from './PillarIIIGallery';
import { TBLS } from './data';

/**
 * Pillar III ESG · ITS · home view inside the Disclosure Hub.
 *
 * Per the new layout, Pillar III is no longer a top-level shell module —
 * it lives as a sub-route of the Disclosure Hub because its 10 TBLs are
 * disclosure outputs that consume the same datapoint repository, the
 * same Carbon Intelligence inventory and the same ALQUID NZ alignment
 * metrics as the rest of the Hub.
 */
export function PillarIIIView() {
  const total = TBLS.length;
  const live = TBLS.filter((t) => t.status === 'live').length;
  const inPrep = TBLS.filter((t) => t.status === 'in_prep').length;
  const blocked = TBLS.filter((t) => t.status === 'methodology_gap').length;
  const scheduled = TBLS.filter((t) => t.status === 'scheduled').length;

  return (
    <>
      {/* Greeting */}
      <div className="mb-5 flex items-start justify-between gap-6">
        <div>
          <h1 className="mb-1 flex flex-wrap items-center gap-2 text-[24px] font-semibold leading-tight tracking-tight text-ink-1">
            Pillar III ESG
            <span className="rounded-md bg-nfq-red px-2 py-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white">
              EBA · ITS
            </span>
          </h1>
          <div className="font-mono text-[11.5px] tracking-wide text-ink-3">
            Banking-book climate disclosures ·{' '}
            <strong className="font-medium text-ink-1">10 templates · {total} TBLs</strong>{' '}
            · CRO sign-off · KPMG audit
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tag variant="green">Live</Tag>
          <span className="font-mono text-[10px] tracking-wide text-ink-2">
            Q4 2025 · deadline 28 ene 2026
          </span>
        </div>
      </div>

      {/* Status row */}
      <div className="mb-[18px] grid grid-cols-4 gap-3 standard:grid-cols-2">
        <StatusCard label="Live · audited" value={live} variant="green" />
        <StatusCard label="In preparation" value={inPrep} variant="orange" />
        <StatusCard label="Methodology gap" value={blocked} variant="red" />
        <StatusCard label="Scheduled" value={scheduled} variant="gray" />
      </div>

      {/* Gallery + Drawer */}
      <Panel>
        <Panel.Head
          title="ITS template catalogue"
          count={`${total} templates · click to inspect`}
          icon={
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="2" y="2" width="12" height="12" rx="1" />
              <path d="M2 5.5h12M2 9h12M5.5 5.5v8" strokeLinecap="round" />
            </svg>
          }
        />
        <Panel.Body>
          <PillarIIIGallery />
        </Panel.Body>
      </Panel>

      {/* Feeds attribution */}
      <Panel className="mt-[18px]">
        <Panel.Head
          title="Where the values come from"
          count="Engines · connectors"
          icon={
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <Panel.Body>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-2 text-[12px] text-ink-2 md:grid-cols-2">
            <li className="flex items-baseline gap-2">
              <span className="font-mono text-[10.5px] font-semibold tracking-wide text-ink-1">
                ALQUID NZ
              </span>
              <span className="text-ink-3">·</span>
              <span>PCAF v3 financed emissions, ITR, sectoral alignment (TBLs 1, 3, 4)</span>
            </li>
            <li className="flex items-baseline gap-2">
              <span className="font-mono text-[10.5px] font-semibold tracking-wide text-ink-1">
                Carbon Intelligence
              </span>
              <span className="text-ink-3">·</span>
              <span>Own-ops Scope 1+2+3 inventory feeding context columns</span>
            </li>
            <li className="flex items-baseline gap-2">
              <span className="font-mono text-[10.5px] font-semibold tracking-wide text-ink-1">
                Climate X
              </span>
              <span className="text-ink-3">·</span>
              <span>Hazard mapping per RCP scenario (TBL 5 physical risk)</span>
            </li>
            <li className="flex items-baseline gap-2">
              <span className="font-mono text-[10.5px] font-semibold tracking-wide text-ink-1">
                Internal corporate book
              </span>
              <span className="text-ink-3">·</span>
              <span>NACE sector tagging, residual maturity, EAD, IFRS 9 stage</span>
            </li>
            <li className="flex items-baseline gap-2">
              <span className="font-mono text-[10.5px] font-semibold tracking-wide text-ink-1">
                EU Taxonomy registry
              </span>
              <span className="text-ink-3">·</span>
              <span>Alignment / eligibility per environmental objective (TBLs 6-8)</span>
            </li>
            <li className="flex items-baseline gap-2">
              <span className="font-mono text-[10.5px] font-semibold tracking-wide text-ink-1">
                EPC public registries
              </span>
              <span className="text-ink-3">·</span>
              <span>Energy efficiency labels for collateral (TBL 2)</span>
            </li>
          </ul>
        </Panel.Body>
      </Panel>
    </>
  );
}

function StatusCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: 'green' | 'orange' | 'red' | 'gray';
}) {
  const bg: Record<typeof variant, string> = {
    green: 'bg-nfq-greenBg',
    orange: 'bg-nfq-orangeBg',
    red: 'bg-nfq-redBg',
    gray: 'bg-canvas-edge',
  };
  const text: Record<typeof variant, string> = {
    green: 'text-nfq-green',
    orange: 'text-nfq-orange',
    red: 'text-nfq-red',
    gray: 'text-ink-3',
  };
  return (
    <div className="rounded-lg border border-line bg-panel p-3 shadow-e60-sm">
      <div className={`font-mono text-[10px] font-semibold uppercase tracking-[0.14em] ${text[variant]}`}>
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-[24px] font-semibold tracking-tight text-ink-1">{value}</span>
        <span className={`rounded-[3px] px-1.5 py-px font-mono text-[9.5px] font-medium ${bg[variant]} ${text[variant]}`}>
          / 10
        </span>
      </div>
    </div>
  );
}
