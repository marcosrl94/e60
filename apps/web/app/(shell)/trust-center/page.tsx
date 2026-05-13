import { Panel, Tag } from '@e60/ui';
import { fetchAuditLog, type AuditEvent } from '@/lib/audit-log';

/**
 * Trust Center — cross-module audit trail (live) + roadmap for the
 * governance pieces still to build.
 *
 * Live half: aggregates writes from every user-owned table (emission
 * entries, materiality overrides, DMA scores, IROs, Pillar III
 * signoffs) into a single newest-first timeline. The same shape will
 * later feed the exportable audit-trail JSON for KPMG / PwC.
 *
 * Roadmap half: short cards for the things on the backlog (RBAC,
 * cryptographic chaining, multi-stage approval workflow). Kept on
 * the page so the value proposition stays visible even before those
 * features ship.
 */
export default async function TrustCenterPage() {
  const { events, partial } = await fetchAuditLog();

  return (
    <>
      {/* Greeting */}
      <div className="mb-5 flex items-start justify-between gap-6">
        <div>
          <h1 className="mb-1 flex flex-wrap items-center gap-2 text-[24px] font-semibold leading-tight tracking-tight text-ink-1">
            Trust Center
            <span className="rounded-md bg-ink-1 px-2 py-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white">
              Audit · governance
            </span>
          </h1>
          <div className="font-mono text-[11.5px] tracking-wide text-ink-3">
            Cross-module audit trail · everything you write to the
            platform shows up here as evidence for the auditor.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tag variant={partial ? 'orange' : 'green'}>
            {partial ? 'Partial' : 'Live'}
          </Tag>
          <span className="font-mono text-[10px] tracking-wide text-ink-2">
            {events.length.toLocaleString('en-US')} event
            {events.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Audit trail */}
      <Panel>
        <Panel.Head
          title="Recent activity"
          count={`${events.length} most-recent events · RLS-scoped to you`}
          icon={
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <circle cx="8" cy="8" r="6" />
              <path d="M8 4.5v3.5l2 1.5" strokeLinecap="round" />
            </svg>
          }
        />
        <Panel.Body flush>
          {events.length === 0 ? (
            <EmptyState />
          ) : (
            <ul role="list" className="divide-y divide-line-soft">
              {events.map((e) => (
                <AuditRow key={e.id} event={e} />
              ))}
            </ul>
          )}
        </Panel.Body>
      </Panel>

      {/* Roadmap */}
      <div className="mb-2 mt-[18px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-2">
        Coming next
      </div>
      <div className="grid grid-cols-3 gap-4 standard:grid-cols-1">
        <RoadmapCard
          accent="red"
          title="Immutable audit trail"
          body="Cryptographically-chained events with full diffs, tamper-evident hash chain, signed exports."
        />
        <RoadmapCard
          accent="blue"
          title="Roles & RBAC"
          body="Permissions per module, sub-view, datapoint, disclosure. Auditor read-only role for KPMG / PwC."
        />
        <RoadmapCard
          accent="green"
          title="Workflow & sign-offs"
          body="Multi-stage approvals CSO → CRO → CFO → Board, delegation rules, escalation timers."
        />
      </div>
    </>
  );
}

// ── pieces ──────────────────────────────────────────────────────────

const MODULE_LABEL: Record<AuditEvent['module'], string> = {
  carbon_intelligence: 'Carbon Intelligence',
  materiality: 'Materiality',
  pillar_iii: 'Pillar III',
  data_layer: 'Data Layer',
};

const MODULE_CHIP: Record<AuditEvent['module'], string> = {
  carbon_intelligence: 'bg-nfq-orangeBg text-nfq-orange',
  materiality: 'bg-nfq-purpleBg text-nfq-purple',
  pillar_iii: 'bg-nfq-redBg text-nfq-red',
  data_layer: 'bg-nfq-blueBg text-nfq-blue',
};

const KIND_DOT: Record<AuditEvent['kind'], string> = {
  emission_entry_created: 'bg-nfq-orange',
  materiality_override_set: 'bg-nfq-purple',
  matter_score_set: 'bg-nfq-purple',
  iro_created: 'bg-nfq-purple',
  tbl_signoff_set: 'bg-nfq-red',
  connector_sync: 'bg-nfq-blue',
};

function AuditRow({ event }: { event: AuditEvent }) {
  return (
    <li className="flex items-start gap-3 px-4 py-2.5">
      <span
        className={
          'mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ' +
          KIND_DOT[event.kind]
        }
        aria-hidden
      />
      <div className="flex-1 min-w-0">
        <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
          <span
            className={
              'rounded-[3px] px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-wider ' +
              MODULE_CHIP[event.module]
            }
          >
            {MODULE_LABEL[event.module]}
          </span>
          {event.context && (
            <span className="rounded-[3px] bg-canvas px-1.5 py-px font-mono text-[9.5px] text-ink-2">
              {event.context}
            </span>
          )}
        </div>
        <div className="text-[12px] leading-snug text-ink-1">
          {event.summary}
        </div>
      </div>
      <time
        dateTime={event.at}
        className="flex-shrink-0 whitespace-nowrap font-mono text-[10px] tabular-nums text-ink-3"
        title={event.at}
      >
        {relativeTime(event.at)}
      </time>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-8 py-10 text-center">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
        Nothing logged yet
      </div>
      <p className="max-w-[420px] text-[12px] leading-relaxed text-ink-3">
        Score a sustainability matter, add an IRO, sign a Pillar III
        template or log an inventory entry — each action lands here in
        seconds as evidence for the auditor.
      </p>
    </div>
  );
}

interface RoadmapCardProps {
  accent: 'red' | 'blue' | 'green';
  title: string;
  body: string;
}

const ROADMAP_ACCENT: Record<RoadmapCardProps['accent'], string> = {
  red: 'border-l-nfq-red',
  blue: 'border-l-nfq-blue',
  green: 'border-l-nfq-green',
};

function RoadmapCard({ accent, title, body }: RoadmapCardProps) {
  return (
    <article
      className={
        'rounded-lg border border-line border-l-[3px] bg-panel p-4 shadow-e60-sm ' +
        ROADMAP_ACCENT[accent]
      }
    >
      <div className="mb-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
        Backlog
      </div>
      <h3 className="text-[13.5px] font-semibold leading-snug tracking-tight text-ink-1">
        {title}
      </h3>
      <p className="mt-1.5 text-[12px] leading-relaxed text-ink-3">{body}</p>
    </article>
  );
}

// Quick relative-time helper. Server-rendered, so no live updates —
// shown values reflect the moment the page was generated. Good enough
// for an audit trail (the absolute timestamp lives in the title attr).
function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
