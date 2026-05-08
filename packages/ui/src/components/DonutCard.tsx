import { cn } from '../lib/cn';

export interface DonutSegment {
  /** HEX color */
  color: string;
  /** Display label (legend) */
  label: string;
  /** Display value (legend, right-aligned) */
  value: string | number;
  /** Percentage of the donut (0–100). Sum across segments should be ≤ 100. */
  pct: number;
}

export interface DonutLegendItem {
  /** Display label */
  label: string;
  /** Display value, right-aligned mono */
  value: string | number;
  /** Optional emphasis (first/featured row) */
  emphasis?: boolean;
}

export interface DonutCardProps {
  /** Center text — when present, renders the donut SVG to the left of the legend */
  center?: { value: string; label: string };
  /** Segments of the donut. Required if `center` is set. */
  segments?: DonutSegment[];
  /** Legend rows. If omitted, the legend is derived from `segments`. */
  legend?: DonutLegendItem[];
  className?: string;
}

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * DonutCard
 *
 * Body for one of the 3 cards in the bottom-row of Hub Overview.
 * Two modes:
 *   - With donut: pass `center` + `segments`, renders a 110×110 donut + legend with dots
 *   - List-only:  pass just `legend`, renders a label/value table (no dots, no donut)
 *
 * Always meant to be placed inside a `<Panel>` with its own `<Panel.Head>`.
 */
export function DonutCard({ center, segments, legend, className }: DonutCardProps) {
  const showDonut = !!center && !!segments;
  const rows: DonutLegendItem[] =
    legend ??
    (segments?.map((s) => ({ label: s.label, value: `${s.value}` })) ?? []);

  return (
    <div className={cn('p-[18px]', className)}>
      <div className={cn('flex items-center', showDonut ? 'gap-[18px]' : 'gap-0')}>
        {showDonut && (
          <svg
            viewBox="0 0 100 100"
            className="h-[110px] w-[110px] flex-shrink-0"
            aria-hidden="true"
          >
            {/* Track */}
            <circle
              cx={50}
              cy={50}
              r={RADIUS}
              fill="none"
              stroke="#f0f0f3"
              strokeWidth={14}
            />
            {/* Segments */}
            {(() => {
              let acc = 0;
              return segments!.map((seg, i) => {
                const length = (seg.pct / 100) * CIRCUMFERENCE;
                const offset = -acc;
                acc += length;
                return (
                  <circle
                    key={i}
                    cx={50}
                    cy={50}
                    r={RADIUS}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={14}
                    strokeDasharray={`${length.toFixed(2)} ${CIRCUMFERENCE.toFixed(2)}`}
                    strokeDashoffset={offset.toFixed(2)}
                    transform="rotate(-90 50 50)"
                  />
                );
              });
            })()}
            {/* Center text */}
            <text
              x={50}
              y={48}
              textAnchor="middle"
              fontFamily="Inter, system-ui, sans-serif"
              fontSize={14}
              fontWeight={600}
              fill="#0b0d12"
            >
              {center!.value}
            </text>
            <text
              x={50}
              y={60}
              textAnchor="middle"
              fontFamily="JetBrains Mono, SF Mono, monospace"
              fontSize={7}
              fill="#6e7280"
              letterSpacing={0.5}
            >
              {center!.label}
            </text>
          </svg>
        )}

        <ul className={cn('flex flex-1 flex-col', showDonut ? 'gap-1.5' : 'gap-[9px]')}>
          {rows.map((row, i) => {
            const dotColor = showDonut ? segments![i]?.color : undefined;
            return (
              <li
                key={i}
                className="flex items-center gap-2 text-[11.5px]"
              >
                {dotColor && (
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: dotColor }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={cn(
                    'flex-1 text-ink-2',
                    row.emphasis && 'font-medium text-ink-1'
                  )}
                >
                  {row.label}
                </span>
                <span className="font-mono text-[11px] font-semibold text-ink-1">
                  {row.value}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
