'use client';

import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import { MONTHLY_TREND, type MonthlyScopePoint } from './data';

const COLORS = {
  scope1: '#f04e3e',
  scope2: '#ff8c2d',
  scope3: '#3b6cf3',
};

function CustomTooltip(props: TooltipProps<number, string>) {
  const { active, payload, label } = props;
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]!.payload as MonthlyScopePoint;
  const total = point.scope1 + point.scope2 + point.scope3;
  return (
    <div className="rounded-md border border-line bg-panel px-2.5 py-2 shadow-e60-md">
      <div className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-3">
        {label} · {total.toLocaleString('en-US')} tCO₂e
      </div>
      <Row color={COLORS.scope3} label="Scope 3" value={point.scope3} />
      <Row color={COLORS.scope2} label="Scope 2 (MB)" value={point.scope2} />
      <Row color={COLORS.scope1} label="Scope 1" value={point.scope1} />
    </div>
  );
}

function Row({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[11px] text-ink-1">
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-2 rounded-sm"
          style={{ background: color }}
        />
        {label}
      </span>
      <span className="font-mono tabular-nums">
        {value.toLocaleString('en-US')} t
      </span>
    </div>
  );
}

/**
 * Stacked area chart of monthly tCO₂e split by scope (1, 2, 3). Reads from
 * `MONTHLY_TREND` in data.tsx — replace with a TanStack Query hook against
 * the future Carbon Intelligence API.
 */
export function EmissionsTrendChart() {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={MONTHLY_TREND}
          margin={{ top: 10, right: 16, left: 0, bottom: 6 }}
        >
          <defs>
            <linearGradient id="ci-scope3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.scope3} stopOpacity={0.5} />
              <stop offset="100%" stopColor={COLORS.scope3} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="ci-scope2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.scope2} stopOpacity={0.55} />
              <stop offset="100%" stopColor={COLORS.scope2} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="ci-scope1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.scope1} stopOpacity={0.6} />
              <stop offset="100%" stopColor={COLORS.scope1} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#f0f0f3" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: '#9b9ea7', fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={{ stroke: '#e7e7eb' }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9b9ea7', fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v) => `${v}t`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#c2c4cb', strokeDasharray: '3 3' }} />
          <Area
            type="monotone"
            dataKey="scope3"
            stackId="1"
            stroke={COLORS.scope3}
            strokeWidth={1.5}
            fill="url(#ci-scope3)"
          />
          <Area
            type="monotone"
            dataKey="scope2"
            stackId="1"
            stroke={COLORS.scope2}
            strokeWidth={1.5}
            fill="url(#ci-scope2)"
          />
          <Area
            type="monotone"
            dataKey="scope1"
            stackId="1"
            stroke={COLORS.scope1}
            strokeWidth={1.5}
            fill="url(#ci-scope1)"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center gap-4 px-2 font-mono text-[10px] uppercase tracking-wide text-ink-3">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: COLORS.scope1 }} />
          Scope 1
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: COLORS.scope2 }} />
          Scope 2 (market-based)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: COLORS.scope3 }} />
          Scope 3 (non-financed)
        </span>
        <span className="ml-auto text-ink-1">
          Renewable PPA signed May 2025 · Scope 2 (MB) → 0
        </span>
      </div>
    </div>
  );
}
