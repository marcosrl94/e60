'use client';

import { useMemo } from 'react';
import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  computeFinancialRating,
  computeImpactRating,
  type MaterialityCategory,
} from '@e60/domain';
import type { DmaContext } from './dma-types';

const CATEGORY_FILL: Record<MaterialityCategory, string> = {
  env: '#1aa56a',
  soc: '#fb923c',
  gov: '#a855f7',
};

const CATEGORY_LABEL: Record<MaterialityCategory, string> = {
  env: 'Environmental',
  soc: 'Social',
  gov: 'Governance',
};

interface BubbleDatum {
  matterId: string;
  label: string;
  topic: string;
  category: MaterialityCategory;
  x: number;
  y: number;
  scored: boolean;
}

interface DmaMatrixProps {
  ctx: DmaContext;
  onSelect: (matterId: string) => void;
}

export function DmaMatrix({ ctx, onSelect }: DmaMatrixProps) {
  const series: Record<MaterialityCategory, BubbleDatum[]> = useMemo(() => {
    const buckets: Record<MaterialityCategory, BubbleDatum[]> = {
      env: [],
      soc: [],
      gov: [],
    };
    for (const m of ctx.matters) {
      const s = ctx.scoresByMatter[m.id];
      const x = computeFinancialRating(s?.financial);
      const y = computeImpactRating(s?.impact);
      buckets[m.category].push({
        matterId: m.id,
        label: m.label,
        topic: m.topic,
        category: m.category,
        x,
        y,
        scored: !!s?.impact || !!s?.financial,
      });
    }
    return buckets;
  }, [ctx]);

  return (
    <div className="h-[440px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 12, right: 16, left: 4, bottom: 16 }}
        >
          <CartesianGrid stroke="#e7e9ec" strokeDasharray="3 3" />

          {/* Material-zone quadrants: any cell where x ≥ threshold OR
              y ≥ threshold. We shade the L-shape as two rectangles. */}
          <ReferenceArea
            x1={ctx.threshold}
            x2={5}
            y1={0}
            y2={5}
            fill="#fef0ee"
            fillOpacity={0.35}
            ifOverflow="hidden"
          />
          <ReferenceArea
            x1={0}
            x2={ctx.threshold}
            y1={ctx.threshold}
            y2={5}
            fill="#fef0ee"
            fillOpacity={0.35}
            ifOverflow="hidden"
          />

          <ReferenceLine
            x={ctx.threshold}
            stroke="#f04e3e"
            strokeDasharray="4 4"
            label={{
              position: 'top',
              value: `T=${ctx.threshold.toFixed(1)}`,
              fill: '#f04e3e',
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={ctx.threshold}
            stroke="#f04e3e"
            strokeDasharray="4 4"
          />

          <XAxis
            dataKey="x"
            type="number"
            domain={[0, 5]}
            ticks={[0, 1, 2, 3, 4, 5]}
            tick={{ fontSize: 10, fill: '#8b8f95' }}
            label={{
              value: 'Financial materiality →',
              position: 'insideBottom',
              offset: -6,
              fontSize: 11,
              fill: '#5a5e63',
            }}
          />
          <YAxis
            dataKey="y"
            type="number"
            domain={[0, 5]}
            ticks={[0, 1, 2, 3, 4, 5]}
            tick={{ fontSize: 10, fill: '#8b8f95' }}
            label={{
              value: 'Impact materiality ↑',
              angle: -90,
              position: 'insideLeft',
              offset: 12,
              fontSize: 11,
              fill: '#5a5e63',
            }}
          />

          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={<MatterTooltip threshold={ctx.threshold} />}
          />

          {(Object.keys(series) as MaterialityCategory[]).map((cat) => (
            <Scatter
              key={cat}
              name={CATEGORY_LABEL[cat]}
              data={series[cat]}
              fill={CATEGORY_FILL[cat]}
              onClick={(payload: unknown) => {
                const p = payload as BubbleDatum | undefined;
                if (p?.matterId) onSelect(p.matterId);
              }}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 font-mono text-[10px] tracking-wide text-ink-3">
        {(Object.keys(CATEGORY_LABEL) as MaterialityCategory[]).map((c) => (
          <span key={c} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: CATEGORY_FILL[c] }}
            />
            {CATEGORY_LABEL[c]}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-4 border-t-2 border-dashed"
            style={{ borderColor: '#f04e3e' }}
          />
          Threshold
        </span>
      </div>
    </div>
  );
}

interface MatterTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: BubbleDatum }>;
  threshold: number;
}

function MatterTooltip({ active, payload, threshold }: MatterTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const material = d.x >= threshold || d.y >= threshold;
  return (
    <div className="rounded-md border border-line bg-panel px-3 py-2 shadow-e60-md">
      <div className="mb-0.5 flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: CATEGORY_FILL[d.category] }}
        />
        <span className="font-mono text-[9.5px] uppercase tracking-wider text-ink-3">
          {d.topic} · {CATEGORY_LABEL[d.category]}
        </span>
      </div>
      <div className="mb-1 text-[12px] font-medium text-ink-1">{d.label}</div>
      <div className="font-mono text-[10px] tabular-nums text-ink-2">
        Impact {d.y.toFixed(2)} · Financial {d.x.toFixed(2)}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-wider">
        {!d.scored ? (
          <span className="text-ink-3">Not scored yet · click to rate</span>
        ) : material ? (
          <span className="text-nfq-red">Material</span>
        ) : (
          <span className="text-nfq-green">Not material</span>
        )}
      </div>
    </div>
  );
}
