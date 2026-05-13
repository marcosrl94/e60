import { Panel, Tag } from '@e60/ui';
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  CONNECTORS,
  computeConnectorMetrics,
  type Connector,
  type ConnectorCategory,
} from './connectors';
import { ConnectorCard, compactDuration } from './ConnectorCard';
import { ConnectCsvCard } from './ConnectCsvCard';
import type { ConnectorRealState } from '@/lib/connector-state';

/**
 * Data Layer view · connector catalogue.
 *
 * Static seed for 17 demo connectors + 1 real one (Portfolio CSV
 * upload) whose state is hydrated from `connector_syncs` for the
 * signed-in user. The metric row uses the merged catalogue so the
 * counts reflect both demo decoration and real syncs.
 */
export function DataLayerView({
  realStates,
}: {
  realStates: Map<string, ConnectorRealState>;
}) {
  const now = new Date();
  const resolved = CONNECTORS.map((c) =>
    applyRealState(c, realStates.get(c.id), now),
  );
  const m = computeConnectorMetrics(resolved);

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
            The plumbing · {m.total} connectors across {CATEGORY_ORDER.length}{' '}
            categories ·{' '}
            <strong className="font-medium text-ink-1">
              {m.recordsTotal.toLocaleString('en-US')}
            </strong>{' '}
            records ingested
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tag variant="orange">Demo data</Tag>
          <Tag variant="purple">1 connector live</Tag>
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
          <CategoryPanel key={cat} category={cat} rows={resolved} />
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

function CategoryPanel({
  category,
  rows,
}: {
  category: ConnectorCategory;
  rows: Connector[];
}) {
  const inCat = rows.filter((c) => c.category === category);
  const live = inCat.filter((c) => c.status === 'connected').length;
  return (
    <Panel>
      <Panel.Head
        title={CATEGORY_LABEL[category]}
        count={`${live}/${inCat.length} live`}
      />
      <Panel.Body flush>
        <div className="grid grid-cols-3 gap-px bg-line-soft standard:grid-cols-2 cramped:grid-cols-1">
          {inCat.map((c) =>
            c.realState ? (
              <ConnectCsvCard key={c.id} connector={c} />
            ) : (
              <ConnectorCard key={c.id} connector={c} />
            ),
          )}
        </div>
      </Panel.Body>
    </Panel>
  );
}

// ── State merge ────────────────────────────────────────────────────────

function applyRealState(
  c: Connector,
  real: ConnectorRealState | undefined,
  now: Date,
): Connector {
  if (!c.realState || !real) return c;
  const lastSyncOffsetMin = real.lastSyncAt
    ? Math.max(
        0,
        Math.round(
          (now.getTime() - new Date(real.lastSyncAt).getTime()) / 60000,
        ),
      )
    : null;
  return {
    ...c,
    status: real.status,
    lastSyncOffsetMin,
    recordsIngested: real.recordsIngested > 0 ? real.recordsIngested : null,
  };
}
