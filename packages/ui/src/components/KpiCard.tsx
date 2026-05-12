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
  /**
   * Optional attribution chip rendered top-right (opposite the icon).
   * Tells the user which module owns the data behind the KPI.
   * Examples: "Repository", "Carbon Intelligence", "Materiality".
   */
  attribution?: {
    label: string;
    tone?: KpiCardIconColor;
  };
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

// Tinted backgrounds for the attribution chip — same hue as the icon
// but at low saturation so the chip recedes visually behind the value.
const CHIP_TONE_BG: Record<KpiCardIconColor, string> = {
  red: 'bg-nfq-redBg text-nfq-red',
  orange: 'bg-nfq-orangeBg text-nfq-orange',
  blue: 'bg-nfq-blueBg text-nfq-blue',
  purple: 'bg-nfq-purpleBg text-nfq-purple',
  green: 'bg-nfq-greenBg text-nfq-green',
  dark: 'bg-canvas text-ink-2',
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
  attribution,
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
      {/* Icon row · optional attribution chip on the right */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-sm text-white',
            ICON_COLOR_BG[iconColor]
          )}
          aria-hidden="true"
        >
          <span className="h-3.5 w-3.5">{icon}</span>
        </div>
        {attribution && (
          <span
            className={cn(
              'mt-0.5 rounded-sm px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-[0.12em]',
              CHIP_TONE_BG[attribution.tone ?? iconColor]
            )}
            title={`Owned by ${attribution.label}`}
          >
            {attribution.label}
          </span>
        )}
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
