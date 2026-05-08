import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type KpiCardIconColor =
  | 'red'
  | 'orange'
  | 'blue'
  | 'purple'
  | 'green'
  | 'dark';

export interface KpiCardProps {
  /** Visual icon shown in the colored square */
  icon: ReactNode;
  /** Background color of the icon square (maps to NFQ palette) */
  iconColor: KpiCardIconColor;
  /** ALL CAPS short label above the value */
  label: string;
  /** Main numeric value (string allows formatting like "23,447") */
  value: string;
  /** Optional unit shown smaller next to value (e.g. "/ 1144", "tCO₂e", "%") */
  unit?: string;
  /** Sparkline node (typically a small SVG) shown bottom-right */
  sparkline?: ReactNode;
  /** Right-aligned trend chip instead of sparkline */
  trend?: ReactNode;
  /** Visual click affordance */
  onClick?: () => void;
  className?: string;
}

const ICON_COLOR_BG: Record<KpiCardIconColor, string> = {
  red: 'bg-nfq-red',
  orange: 'bg-nfq-orange',
  blue: 'bg-nfq-blue',
  purple: 'bg-nfq-purple',
  green: 'bg-nfq-green',
  dark: 'bg-ink-1',
};

/**
 * KpiCard
 *
 * The headline metric component used across all module overviews.
 * Composed of: colored icon square (top-left), uppercase label,
 * large value with optional unit, and an optional sparkline.
 *
 * Visual reference: matches the HTML mockups exactly.
 */
export function KpiCard({
  icon,
  iconColor,
  label,
  value,
  unit,
  sparkline,
  trend,
  onClick,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-line bg-panel p-3.5 shadow-e60-sm',
        'transition-shadow transition-colors',
        'hover:shadow-e60-md hover:border-ink-5',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Icon */}
      <div
        className={cn(
          'mb-3 flex h-7 w-7 items-center justify-center rounded-sm text-white',
          ICON_COLOR_BG[iconColor]
        )}
        aria-hidden="true"
      >
        <span className="h-3.5 w-3.5">{icon}</span>
      </div>

      {/* Label */}
      <div className="mb-1 font-mono text-[9.5px] font-medium uppercase tracking-[0.12em] text-ink-3">
        {label}
      </div>

      {/* Value + sparkline/trend row */}
      <div className="flex items-end justify-between gap-2">
        <div className="text-[22px] font-semibold leading-none tracking-tight text-ink-1 tabular-nums">
          {value}
          {unit && (
            <span className="ml-0.5 text-[12px] font-medium text-ink-3 tracking-normal">
              {unit}
            </span>
          )}
        </div>
        {sparkline && <div className="h-[22px] w-14 flex-shrink-0">{sparkline}</div>}
        {trend && <div className="flex-shrink-0">{trend}</div>}
      </div>
    </div>
  );
}
