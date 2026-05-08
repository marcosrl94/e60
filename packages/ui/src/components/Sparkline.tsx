import { cn } from '../lib/cn';

export type SparklineColor =
  | 'red'
  | 'orange'
  | 'blue'
  | 'purple'
  | 'green'
  | 'dark';

const COLOR_HEX: Record<SparklineColor, string> = {
  red: '#f04e3e',
  orange: '#ff8c2d',
  blue: '#3b6cf3',
  purple: '#7a4cf0',
  green: '#1aa56a',
  dark: '#0b0d12',
};

export interface SparklineProps {
  /** Numeric series. Will be auto-scaled to fit. */
  data: number[];
  /** Stroke color, mapped to NFQ palette */
  color?: SparklineColor;
  /** Whether to fill the area below the line with a gradient */
  filled?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Sparkline
 *
 * Tiny inline chart used inside KpiCards and lists. Pure SVG, no library.
 * Auto-scales data to fit width × height. Optional gradient fill.
 *
 * For richer charts (axes, tooltips, multi-series), use Recharts components.
 */
export function Sparkline({
  data,
  color = 'blue',
  filled = false,
  width = 60,
  height = 22,
  className,
}: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - 2 - ((value - min) / range) * (height - 4);
    return [x, y] as const;
  });

  const linePath = points.reduce(
    (acc, [x, y], i) => acc + (i === 0 ? `M${x} ${y}` : ` L${x} ${y}`),
    ''
  );

  const areaPath = filled ? `${linePath} L${width} ${height} L0 ${height} Z` : '';

  const stroke = COLOR_HEX[color];
  const gradientId = `sparkGrad-${color}`;

  return (
    <svg
      className={cn('block', className)}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      role="img"
      aria-hidden="true"
    >
      {filled && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={stroke} stopOpacity="0.18" />
              <stop offset="1" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradientId})`} />
        </>
      )}
      <path d={linePath} stroke={stroke} strokeWidth="1.5" fill="none" />
    </svg>
  );
}
