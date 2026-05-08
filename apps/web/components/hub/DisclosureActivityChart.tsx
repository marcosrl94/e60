'use client';

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';

/**
 * DisclosureActivityChart
 *
 * Migrated from `_mockups/disclosure-hub.html` (section: "Disclosure Activity").
 * The mockup shows a 5-series multi-line area chart against an X-axis of months
 * (sept→ago). The mockup's Y-axis labels read in € millions, but every series
 * is a count — that mismatch is fixed here:
 *   - Left axis (visible): datapoint counts, 0–1200
 *   - Right axis (hidden): monthly disclosures published, 0–60
 *
 * End values self-consistent with the KPI row already on the page:
 *   captured 847, pending 23, disclosures-Q4 12.
 */

const ACTIVITY_DATA = [
  { month: 'sept', captured: 50, active: 80, confirmed: 40, pending: 250, published: 1 },
  { month: 'oct', captured: 120, active: 130, confirmed: 100, pending: 240, published: 2 },
  { month: 'nov', captured: 220, active: 180, confirmed: 170, pending: 220, published: 3 },
  { month: 'dic', captured: 320, active: 240, confirmed: 240, pending: 195, published: 4 },
  { month: 'ene', captured: 430, active: 300, confirmed: 320, pending: 175, published: 6 },
  { month: 'feb', captured: 530, active: 360, confirmed: 400, pending: 155, published: 28 },
  { month: 'mar', captured: 620, active: 410, confirmed: 470, pending: 130, published: 14 },
  { month: 'abr', captured: 700, active: 460, confirmed: 540, pending: 100, published: 22 },
  { month: 'may', captured: 770, active: 510, confirmed: 600, pending: 70, published: 55 },
  { month: 'jun', captured: 810, active: 560, confirmed: 640, pending: 50, published: 32 },
  { month: 'jul', captured: 830, active: 620, confirmed: 680, pending: 35, published: 18 },
  { month: 'ago', captured: 847, active: 680, confirmed: 720, pending: 23, published: 12 },
];

const SERIES = [
  { key: 'captured', label: 'Datapoints captured', color: '#7a4cf0', dotted: false, soft: false },
  { key: 'published', label: 'Disclosures published', color: '#1aa56a', dotted: false, soft: false },
  { key: 'active', label: 'Active reporting', color: '#3b6cf3', dotted: false, soft: false },
  { key: 'pending', label: 'Pending review', color: '#ff8c2d', dotted: true, soft: false },
  { key: 'confirmed', label: 'Confirmed', color: '#7a4cf0', dotted: true, soft: true },
] as const;

const TICK_STYLE = {
  fontFamily: 'JetBrains Mono, SF Mono, monospace',
  fontSize: 10,
  fill: '#9b9ea7',
} as const;

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line bg-panel px-2.5 py-2 shadow-e60-md">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
        {label}
      </div>
      <div className="space-y-0.5">
        {payload.map((entry) => (
          <div key={String(entry.dataKey)} className="flex items-center gap-2 text-[11px] text-ink-1">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="text-ink-2">
              {SERIES.find((s) => s.key === entry.dataKey)?.label ?? String(entry.dataKey)}
            </span>
            <span className="ml-auto font-mono tabular-nums">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DisclosureActivityChart() {
  return (
    <div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer>
          <ComposedChart data={ACTIVITY_DATA} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            <defs>
              <linearGradient id="dpaPurple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7a4cf0" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#7a4cf0" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dpaBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b6cf3" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#3b6cf3" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dpaGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1aa56a" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#1aa56a" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#f0f0f3" vertical={false} />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={TICK_STYLE}
              padding={{ left: 8, right: 8 }}
              dy={6}
            />
            <YAxis
              yAxisId="dp"
              orientation="left"
              domain={[0, 1200]}
              ticks={[0, 300, 600, 900, 1200]}
              axisLine={false}
              tickLine={false}
              tick={TICK_STYLE}
              width={44}
            />
            <YAxis yAxisId="disc" orientation="right" domain={[0, 60]} hide />

            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: '#e7e7eb', strokeWidth: 1 }}
            />

            <Area
              yAxisId="dp"
              type="monotone"
              dataKey="captured"
              stroke="#7a4cf0"
              strokeWidth={2}
              fill="url(#dpaPurple)"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
            <Area
              yAxisId="dp"
              type="monotone"
              dataKey="active"
              stroke="#3b6cf3"
              strokeWidth={2}
              fill="url(#dpaBlue)"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
            <Area
              yAxisId="disc"
              type="linear"
              dataKey="published"
              stroke="#1aa56a"
              strokeWidth={2}
              fill="url(#dpaGreen)"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
            <Line
              yAxisId="dp"
              type="monotone"
              dataKey="pending"
              stroke="#ff8c2d"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
            <Line
              yAxisId="dp"
              type="linear"
              dataKey="confirmed"
              stroke="#7a4cf0"
              strokeOpacity={0.6}
              strokeWidth={1.2}
              strokeDasharray="2 2"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 pt-1 font-mono text-[10.5px] text-ink-3">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: s.color, opacity: s.soft ? 0.55 : 1 }}
            />
            <span className={s.dotted ? 'text-ink-3' : 'text-ink-2'}>{s.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
