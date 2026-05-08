import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type ActivityColumnTone = 'created' | 'won' | 'lost' | 'warn';

export interface ActivityItem {
  /** Item title — accepts ReactNode so callers can emphasize parts via <strong> */
  title: ReactNode;
  /** Mono small subtitle (source, system, etc.) */
  sub: ReactNode;
  /** Right-aligned mono value */
  value: ReactNode;
  /** Right-aligned mono uppercase date / age */
  date: ReactNode;
  /** Optional click handler */
  onClick?: () => void;
}

export interface ActivityColumnProps {
  /** Tone for the head icon color */
  tone: ActivityColumnTone;
  /** Icon shown left of the title */
  icon: ReactNode;
  /** ALL CAPS short title */
  title: string;
  /** Right-aligned mono count */
  count: string | number;
  items: ActivityItem[];
  className?: string;
}

const TONE_ICON_COLOR: Record<ActivityColumnTone, string> = {
  created: 'text-nfq-blue',
  won: 'text-nfq-green',
  lost: 'text-nfq-red',
  warn: 'text-nfq-orange',
};

/**
 * ActivityColumn
 *
 * One column of the "Recent Disclosure Activity" 3-col panel.
 * White card with mono-typography head + a list of items.
 */
export function ActivityColumn({
  tone,
  icon,
  title,
  count,
  items,
  className,
}: ActivityColumnProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-line bg-panel shadow-e60-sm',
        className
      )}
    >
      {/* Head */}
      <div className="flex items-center gap-2 border-b border-line-soft px-4 py-3">
        <span className={cn('h-3.5 w-3.5 flex-shrink-0', TONE_ICON_COLOR[tone])} aria-hidden="true">
          {icon}
        </span>
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-2">
          {title}
        </span>
        <span className="ml-auto font-mono text-[10.5px] text-ink-3">{count}</span>
      </div>

      {/* List */}
      <ul className="flex flex-col">
        {items.map((item, idx) => (
          <li
            key={idx}
            className={cn(
              'flex items-start justify-between gap-3 border-b border-line-soft px-4 py-[11px] transition-colors',
              'last:border-b-0',
              item.onClick && 'cursor-pointer hover:bg-panel-hover'
            )}
            onClick={item.onClick}
          >
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 truncate text-[12px] font-medium leading-[1.35] text-ink-1">
                {item.title}
              </div>
              <div className="font-mono text-[10px] tracking-[0.02em] text-ink-3">
                {item.sub}
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="font-mono text-[11.5px] font-semibold text-ink-1">
                {item.value}
              </div>
              <div className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.04em] text-ink-3">
                {item.date}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
