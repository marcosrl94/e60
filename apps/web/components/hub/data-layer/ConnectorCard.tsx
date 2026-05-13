import type { ReactNode } from 'react';
import { Tag } from '@e60/ui';
import type { Connector, ConnectorStatus } from './connectors';

/**
 * Visual shell for a connector. Universal component (no client-only
 * features) so it can be rendered from both server and client trees.
 * The right-side action defaults to a disabled "Configure"/"Connect →"
 * button; pass `actionSlot` to override it with a real interactive
 * control (see `ConnectCsvCard` for the realState path).
 */
export function ConnectorCard({
  connector: c,
  actionSlot,
}: {
  connector: Connector;
  actionSlot?: ReactNode;
}) {
  const inactive = c.status === 'not_connected';
  const errored = c.status === 'error';
  return (
    <article
      className={'flex flex-col gap-2 bg-panel p-4 ' + (inactive ? 'opacity-75' : '')}
    >
      <div className="flex items-start gap-3">
        <div
          className={
            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-semibold tracking-wider ' +
            AVATAR_TONE[c.tone]
          }
          aria-hidden
        >
          {c.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold tracking-tight text-ink-1">
              {c.name}
            </span>
            <Tag variant={STATUS_VARIANT[c.status]}>{STATUS_LABEL[c.status]}</Tag>
          </div>
          <div className="font-mono text-[10px] tracking-wide text-ink-3">
            {c.vendor}
          </div>
        </div>
      </div>
      <p className="line-clamp-2 text-[11.5px] leading-relaxed text-ink-3">
        {c.blurb}
      </p>
      <div className="mt-auto flex items-center gap-3 border-t border-line-soft pt-2 font-mono text-[10px] tabular-nums tracking-wide">
        <Metric label="Last sync">
          {c.lastSyncOffsetMin != null
            ? compactDuration(c.lastSyncOffsetMin)
            : '—'}
        </Metric>
        <Metric label="Records">
          {c.recordsIngested != null ? compactCount(c.recordsIngested) : '—'}
        </Metric>
        <div className="ml-auto">
          {actionSlot ?? (
            <button
              type="button"
              className={
                'rounded border border-line px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide transition-colors ' +
                (inactive
                  ? 'text-ink-2 hover:bg-canvas hover:text-ink-1'
                  : 'text-ink-3 hover:bg-canvas hover:text-ink-1')
              }
              disabled
              title="Configuration UI coming with the connector engine"
            >
              {inactive ? 'Connect →' : 'Configure'}
            </button>
          )}
        </div>
      </div>
      {c.note && (
        <div
          className={
            'rounded-sm px-2 py-1 font-mono text-[10px] leading-snug ' +
            (errored
              ? 'bg-nfq-redBg text-nfq-red'
              : 'bg-nfq-orangeBg text-nfq-orange')
          }
        >
          {c.note}
        </div>
      )}
    </article>
  );
}

function Metric({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-ink-3">{label}</span>
      <span className="text-ink-1">{children}</span>
    </span>
  );
}

// ── Shared maps + formatters ───────────────────────────────────────────

const STATUS_LABEL: Record<ConnectorStatus, string> = {
  connected: 'Connected',
  partial: 'Partial',
  error: 'Error',
  not_connected: 'Off',
};

const STATUS_VARIANT: Record<
  ConnectorStatus,
  'green' | 'orange' | 'red' | 'gray'
> = {
  connected: 'green',
  partial: 'orange',
  error: 'red',
  not_connected: 'gray',
};

const AVATAR_TONE: Record<Connector['tone'], string> = {
  blue: 'bg-nfq-blueBg text-nfq-blue',
  orange: 'bg-nfq-orangeBg text-nfq-orange',
  green: 'bg-nfq-greenBg text-nfq-green',
  purple: 'bg-nfq-purpleBg text-nfq-purple',
  red: 'bg-nfq-redBg text-nfq-red',
};

export function compactDuration(min: number): string {
  if (min < 60) return `${min}m`;
  if (min < 24 * 60) return `${Math.round(min / 60)}h`;
  return `${Math.round(min / (24 * 60))}d`;
}

export function compactCount(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 10_000) return (n / 1000).toFixed(1) + 'k';
  if (n < 1_000_000) return Math.round(n / 1000) + 'k';
  return (n / 1_000_000).toFixed(1) + 'M';
}
