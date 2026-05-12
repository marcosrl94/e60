import { Panel, Tag } from '@e60/ui';
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  CONNECTORS,
  computeConnectorMetrics,
  type Connector,
  type ConnectorCategory,
  type ConnectorStatus,
} from './connectors';

/**
 * Data Layer view · connector catalogue stub.
 *
 * Frontend-only for now: seed in `connectors.ts`. The shape mirrors
 * what a future `connectors` Supabase table will return per org, so
 * swapping to a live query is a one-line change inside this file.
 *
 * What it shows: metric header (counts + records + freshness), then
 * a Panel per category with connector cards (avatar mark · status
 * chip · last-sync · records · optional note).
 */
export function DataLayerView() {
  const m = computeConnectorMetrics(CONNECTORS);

  return (
    <>
      {/* Greeting */}
      <div className="mb-5 flex items-start justify-between gap-6">
        <div>
          <h1 className="mb-1 flex flex-wrap items-center gap-2 text-[24px] font-semibold leading-tight tracking-tight text-ink-1">
            Data Layer
            <span className="rounded-md bg-ink-1 px-2 py-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white">
              Source systems
            </span>
          </h1>
          <div className="font-mono text-[11.5px] tracking-wide text-ink-3">
            The plumbing · {m.total} connectors across 6 categories ·{' '}
            <strong className="font-medium text-ink-1">
              {m.recordsTotal.toLocaleString('en-US')}
            </strong>{' '}
            records ingested
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tag variant="orange">Demo data</Tag>
          <span className="font-mono text-[10px] tracking-wide text-ink-2">
            Backend wiring Q3 2026
          </span>
        </div>
      </div>

      {/* Metric row */}
      <div className="mb-5 grid grid-cols-4 gap-3 standard:grid-cols-2 cramped:grid-cols-1">
        <MetricTile
          label="Connected"
          value={`${m.connected}`}
          sub={`of ${m.total}`}
          tone="green"
        />
        <MetricTile
          label="Partial / error"
          value={`${m.partial + m.error}`}
          sub={
            m.error > 0
              ? `${m.error} broken · ${m.partial} lagging`
              : `${m.partial} lagging`
          }
          tone={m.error > 0 ? 'red' : 'orange'}
        />
        <MetricTile
          label="Not connected"
          value={`${m.notConnected}`}
          sub="planned / awaiting onboarding"
          tone="gray"
        />
        <MetricTile
          label="Freshest sync"
          value={
            m.freshestSyncMin != null ? compactDuration(m.freshestSyncMin) : '—'
          }
          sub={
            m.stalestSyncMin != null
              ? `stalest ${compactDuration(m.stalestSyncMin)}`
              : ''
          }
          tone="blue"
        />
      </div>

      {/* Catalogue */}
      <div className="flex flex-col gap-4">
        {CATEGORY_ORDER.map((cat) => (
          <CategoryPanel key={cat} category={cat} />
        ))}
      </div>
    </>
  );
}

// ── Pieces ────────────────────────────────────────────────────────────

interface MetricTileProps {
  label: string;
  value: string;
  sub?: string;
  tone: 'green' | 'orange' | 'red' | 'gray' | 'blue';
}

const TONE_TEXT: Record<MetricTileProps['tone'], string> = {
  green: 'text-nfq-green',
  orange: 'text-nfq-orange',
  red: 'text-nfq-red',
  gray: 'text-ink-2',
  blue: 'text-nfq-blue',
};

function MetricTile({ label, value, sub, tone }: MetricTileProps) {
  return (
    <div className="flex flex-col rounded-lg border border-line bg-panel px-4 py-3 shadow-e60-sm">
      <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
        {label}
      </div>
      <div
        className={`mt-0.5 text-[22px] font-semibold leading-tight tracking-tight tabular-nums ${TONE_TEXT[tone]}`}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-0.5 font-mono text-[10px] tracking-wide text-ink-3">
          {sub}
        </div>
      )}
    </div>
  );
}

function CategoryPanel({ category }: { category: ConnectorCategory }) {
  const rows = CONNECTORS.filter((c) => c.category === category);
  const live = rows.filter((c) => c.status === 'connected').length;
  return (
    <Panel>
      <Panel.Head
        title={CATEGORY_LABEL[category]}
        count={`${live}/${rows.length} live`}
      />
      <Panel.Body flush>
        <div className="grid grid-cols-3 gap-px bg-line-soft standard:grid-cols-2 cramped:grid-cols-1">
          {rows.map((c) => (
            <ConnectorCard key={c.id} connector={c} />
          ))}
        </div>
      </Panel.Body>
    </Panel>
  );
}

const STATUS_LABEL: Record<ConnectorStatus, string> = {
  connected: 'Connected',
  partial: 'Partial',
  error: 'Error',
  not_connected: 'Off',
};

const STATUS_VARIANT: Record<ConnectorStatus, 'green' | 'orange' | 'red' | 'gray'> = {
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

function ConnectorCard({ connector: c }: { connector: Connector }) {
  const inactive = c.status === 'not_connected';
  const errored = c.status === 'error';
  return (
    <article
      className={
        'flex flex-col gap-2 bg-panel p-4 ' +
        (inactive ? 'opacity-75' : '')
      }
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
          {c.lastSyncOffsetMin != null ? compactDuration(c.lastSyncOffsetMin) : '—'}
        </Metric>
        <Metric label="Records">
          {c.recordsIngested != null
            ? compactCount(c.recordsIngested)
            : '—'}
        </Metric>
        <button
          type="button"
          className={
            'ml-auto rounded border border-line px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide transition-colors ' +
            (inactive
              ? 'text-ink-2 hover:bg-canvas hover:text-ink-1'
              : 'text-ink-3 hover:bg-canvas hover:text-ink-1')
          }
          disabled
          title="Configuration UI coming with the connector engine"
        >
          {inactive ? 'Connect →' : 'Configure'}
        </button>
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

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-ink-3">{label}</span>
      <span className="text-ink-1">{children}</span>
    </span>
  );
}

// ── Format helpers ────────────────────────────────────────────────────

function compactDuration(min: number): string {
  if (min < 60) return `${min}m`;
  if (min < 24 * 60) return `${Math.round(min / 60)}h`;
  return `${Math.round(min / (24 * 60))}d`;
}

function compactCount(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 10_000) return (n / 1000).toFixed(1) + 'k';
  if (n < 1_000_000) return Math.round(n / 1000) + 'k';
  return (n / 1_000_000).toFixed(1) + 'M';
}
