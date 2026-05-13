'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Datapoint } from '@e60/domain';
import { Tag, type TagVariant } from '@e60/ui';
import type { DisclosureCardData } from './data';
import { NARRATIVES } from './narratives';

const TOKEN_RE = /\{\{([A-Za-z0-9_.-]+)\}\}/g;

const STATUS_LABEL: Record<string, string> = {
  live: 'Live',
  partial: 'Partial',
  blocked: 'Blocked',
  pending: 'Pending',
  not_material: 'N/M',
  custom: 'Custom',
};
const STATUS_VARIANT: Record<string, TagVariant> = {
  live: 'green',
  partial: 'orange',
  blocked: 'red',
  pending: 'gray',
  not_material: 'gray',
  custom: 'purple',
};

/**
 * Disclosure Preview · two-column view.
 *
 * Left:  scrollable list of every datapoint declared by this disclosure
 *        (id, name, status chip, value+unit). Clicking a row scrolls the
 *        narrative to highlight its token; vice-versa from the right.
 *
 * Right: narrative prose with `{{<id>}}` placeholders resolved to the
 *        captured value. Empty datapoints render as a red `[id]` chip so
 *        the auditor sees the gaps immediately.
 *
 * The auditor flow: scan the left column for any non-green status →
 * click → see the surrounding narrative → assess whether the gap blocks
 * the disclosure or is acceptable phase-in / N/M.
 */
export function DisclosurePreviewView({
  disclosure,
  datapoints,
}: {
  disclosure: DisclosureCardData;
  datapoints: Datapoint[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const byId = useMemo(
    () => new Map(datapoints.map((d) => [d.id, d])),
    [datapoints],
  );
  const narrative = NARRATIVES[disclosure.id] ?? '';
  const filledCount = datapoints.filter((d) => !!d.latestValue).length;

  return (
    <>
      <div className="mb-3 flex items-start justify-between gap-6">
        <div>
          <div className="mb-0.5 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            <a
              href="/disclosure-hub/outputs"
              className="rounded px-1 hover:bg-canvas hover:text-ink-1"
            >
              ← Output Generators
            </a>
            <span>·</span>
            <span>{disclosure.framework}</span>
          </div>
          <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-ink-1">
            {disclosure.title}
          </h1>
          <div className="mt-0.5 font-mono text-[11px] tracking-wide text-ink-3">
            {datapoints.length} datapoints · {filledCount} filled ·{' '}
            {datapoints.length - filledCount} empty · deadline {disclosure.date}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tag variant="orange">Preview · Markdown</Tag>
          <button
            type="button"
            disabled
            title="PDF / DOCX export ships with Phase 7"
            className="rounded-md border border-line bg-canvas px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase tracking-wide text-ink-3"
          >
            Export PDF →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[300px_1fr] gap-4 cramped:grid-cols-1">
        <TreePanel
          datapoints={datapoints}
          activeId={activeId}
          onSelect={setActiveId}
        />
        <NarrativePane
          narrative={narrative}
          byId={byId}
          activeId={activeId}
          onTokenClick={setActiveId}
        />
      </div>
    </>
  );
}

// ── Left tree ──────────────────────────────────────────────────────────

function TreePanel({
  datapoints,
  activeId,
  onSelect,
}: {
  datapoints: Datapoint[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  // Group by EFRAG topic so the auditor walks E1 → E2 → ... → G1 in order.
  const groups = useMemo(() => {
    const byTopic = new Map<string, Datapoint[]>();
    for (const dp of datapoints) {
      const t = dp.topic ?? 'GENERAL';
      const list = byTopic.get(t) ?? [];
      list.push(dp);
      byTopic.set(t, list);
    }
    return Array.from(byTopic.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [datapoints]);

  return (
    <aside className="rounded-lg border border-line bg-panel">
      <div className="border-b border-line-soft px-3 py-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
        Datapoints · {datapoints.length}
      </div>
      <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
        {groups.map(([topic, items]) => (
          <div key={topic}>
            <div className="border-b border-line-soft bg-canvas px-3 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
              {topic}
            </div>
            <ul>
              {items.map((dp) => (
                <li key={dp.id}>
                  <TreeRow
                    dp={dp}
                    active={activeId === dp.id}
                    onSelect={() => onSelect(dp.id)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}

function TreeRow({
  dp,
  active,
  onSelect,
}: {
  dp: Datapoint;
  active: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (active && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [active]);
  const empty = !dp.latestValue;
  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      className={
        'flex w-full flex-col items-stretch gap-0.5 border-b border-line-soft px-3 py-2 text-left transition-colors ' +
        (active
          ? 'bg-nfq-purpleBg/60'
          : 'hover:bg-canvas')
      }
    >
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[10px] tracking-wide text-ink-2">
          {dp.id}
        </span>
        <Tag variant={STATUS_VARIANT[dp.status] ?? 'gray'}>
          {STATUS_LABEL[dp.status] ?? dp.status}
        </Tag>
      </div>
      <div className="line-clamp-2 text-[11.5px] leading-snug text-ink-1">
        {dp.name}
      </div>
      <div className="font-mono text-[10px] tracking-wide tabular-nums">
        {empty ? (
          <span className="text-nfq-red">— no value —</span>
        ) : (
          <span className="text-ink-1">
            {dp.latestValue}
            {dp.unit && <span className="ml-1 text-ink-3">{dp.unit}</span>}
          </span>
        )}
      </div>
    </button>
  );
}

// ── Right narrative ────────────────────────────────────────────────────

function NarrativePane({
  narrative,
  byId,
  activeId,
  onTokenClick,
}: {
  narrative: string;
  byId: Map<string, Datapoint>;
  activeId: string | null;
  onTokenClick: (id: string) => void;
}) {
  if (!narrative.trim()) {
    return (
      <article className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-line bg-panel px-6 text-center text-[12px] text-ink-3">
        <div className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
          No narrative drafted yet
        </div>
        <p className="max-w-[360px] leading-relaxed">
          Add a template in{' '}
          <code className="font-mono">apps/web/components/hub/outputs/narratives.ts</code>{' '}
          keyed by this disclosure id to see prose rendered here with live
          datapoint values.
        </p>
      </article>
    );
  }
  return (
    <article className="rounded-lg border border-line bg-panel px-6 py-5">
      <div className="max-h-[calc(100vh-260px)] overflow-y-auto pr-2">
        {renderNarrative(narrative, byId, activeId, onTokenClick)}
      </div>
    </article>
  );
}

function renderNarrative(
  source: string,
  byId: Map<string, Datapoint>,
  activeId: string | null,
  onTokenClick: (id: string) => void,
): ReactNode {
  const blocks = source.trim().split(/\n{2,}/);
  return blocks.map((block, i) => {
    if (block.startsWith('## ')) {
      return (
        <h2
          key={i}
          className="mt-5 mb-2 first:mt-0 text-[16px] font-semibold tracking-tight text-ink-1"
        >
          {block.slice(3)}
        </h2>
      );
    }
    if (block.startsWith('### ')) {
      return (
        <h3
          key={i}
          className="mt-3 mb-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-2"
        >
          {block.slice(4)}
        </h3>
      );
    }
    return (
      <p
        key={i}
        className="mb-3 text-[13px] leading-relaxed text-ink-1 last:mb-0"
      >
        {renderTokens(block, byId, activeId, onTokenClick)}
      </p>
    );
  });
}

function renderTokens(
  text: string,
  byId: Map<string, Datapoint>,
  activeId: string | null,
  onTokenClick: (id: string) => void,
): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const id = match[1]!;
    const dp = byId.get(id);
    out.push(
      <DatapointToken
        key={`${id}-${match.index}`}
        id={id}
        dp={dp}
        active={activeId === id}
        onClick={() => onTokenClick(id)}
      />,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function DatapointToken({
  id,
  dp,
  active,
  onClick,
}: {
  id: string;
  dp: Datapoint | undefined;
  active: boolean;
  onClick: () => void;
}) {
  const empty = !dp || !dp.latestValue;
  const base = active ? 'ring-2 ring-offset-1 ' : '';
  const tone = empty
    ? 'bg-nfq-redBg text-nfq-red'
    : 'bg-nfq-purpleBg text-nfq-purple';
  return (
    <button
      type="button"
      onClick={onClick}
      title={dp ? `${id} · ${dp.name}` : `${id} · not in this disclosure`}
      className={
        'inline-flex items-baseline gap-1 rounded px-1 py-px font-mono text-[11px] tabular-nums transition-shadow ' +
        base +
        tone
      }
    >
      {empty ? (
        <span>[{id}]</span>
      ) : (
        <>
          <span className="font-semibold">{dp.latestValue}</span>
          {dp.unit && <span className="text-ink-3">{dp.unit}</span>}
        </>
      )}
    </button>
  );
}
