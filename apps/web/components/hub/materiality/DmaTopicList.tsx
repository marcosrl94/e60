'use client';

import { useMemo, useState } from 'react';
import {
  computeFinancialRating,
  computeImpactRating,
  isMaterial,
  type MaterialityCategory,
} from '@e60/domain';
import type { DmaContext } from './dma-types';

const CATEGORY_DOT: Record<MaterialityCategory, string> = {
  env: 'bg-nfq-green',
  soc: 'bg-nfq-orange',
  gov: 'bg-nfq-purple',
};

type FilterValue = 'all' | 'material' | 'unscored';

interface DmaTopicListProps {
  ctx: DmaContext;
  onSelect: (matterId: string) => void;
}

export function DmaTopicList({ ctx, onSelect }: DmaTopicListProps) {
  const [filter, setFilter] = useState<FilterValue>('all');

  const rows = useMemo(() => {
    return ctx.matters
      .map((m) => {
        const s = ctx.scoresByMatter[m.id];
        const impact = computeImpactRating(s?.impact);
        const financial = computeFinancialRating(s?.financial);
        const scored = !!s?.impact || !!s?.financial;
        const material = scored && isMaterial(s?.impact, s?.financial, ctx.threshold);
        return { ...m, impact, financial, scored, material };
      })
      .filter((r) => {
        if (filter === 'material') return r.material;
        if (filter === 'unscored') return !r.scored;
        return true;
      })
      .sort((a, b) => {
        // Sort: material first by max(impact, financial) desc, then scored
        // matters by max desc, then unscored alphabetically.
        const am = Math.max(a.impact, a.financial);
        const bm = Math.max(b.impact, b.financial);
        if (a.material !== b.material) return a.material ? -1 : 1;
        if (a.scored !== b.scored) return a.scored ? -1 : 1;
        if (bm !== am) return bm - am;
        return a.label.localeCompare(b.label);
      });
  }, [ctx, filter]);

  const counts = useMemo(() => {
    let material = 0;
    let unscored = 0;
    for (const m of ctx.matters) {
      const s = ctx.scoresByMatter[m.id];
      const scored = !!s?.impact || !!s?.financial;
      if (!scored) unscored++;
      else if (isMaterial(s?.impact, s?.financial, ctx.threshold)) material++;
    }
    return { all: ctx.matters.length, material, unscored };
  }, [ctx]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center gap-1">
        {(
          [
            ['all', 'All', counts.all],
            ['material', 'Material', counts.material],
            ['unscored', 'Unscored', counts.unscored],
          ] as const
        ).map(([id, label, count]) => {
          const active = filter === id;
          return (
            <button
              key={id}
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => setFilter(id)}
              className={
                'inline-flex items-center gap-1 rounded-md border px-2 py-[3px] text-[10.5px] font-medium transition-colors ' +
                (active
                  ? 'border-ink-1 bg-ink-1 text-white'
                  : 'border-line bg-panel text-ink-2 hover:border-ink-5 hover:text-ink-1')
              }
            >
              {label}
              <span
                className={
                  'rounded-[3px] px-1 py-px font-mono text-[9px] font-semibold ' +
                  (active ? 'bg-white/20 text-white' : 'bg-canvas text-ink-3')
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto rounded-md border border-line bg-panel">
        {rows.length === 0 ? (
          <div className="px-3 py-6 text-center text-[12px] text-ink-3">
            No matters match this filter.
          </div>
        ) : (
          <ul role="list">
            {rows.map((r) => (
              <li
                key={r.id}
                className="border-b border-line-soft last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => onSelect(r.id)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-canvas"
                >
                  <span
                    className={
                      'mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ' +
                      CATEGORY_DOT[r.category]
                    }
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[9.5px] tracking-wide text-ink-3">
                        {r.topic}
                      </span>
                      {r.material && (
                        <span className="rounded-[3px] bg-nfq-redBg px-1 py-px font-mono text-[8.5px] font-semibold uppercase tracking-wider text-nfq-red">
                          Material
                        </span>
                      )}
                      {!r.scored && (
                        <span className="rounded-[3px] bg-canvas px-1 py-px font-mono text-[8.5px] uppercase tracking-wider text-ink-4">
                          Unscored
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-[12px] text-ink-1">
                      {r.label}
                    </div>
                    {r.scored && (
                      <div className="mt-1 font-mono text-[10px] tabular-nums text-ink-2">
                        I {r.impact.toFixed(2)} · F {r.financial.toFixed(2)}
                      </div>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
