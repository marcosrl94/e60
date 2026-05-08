import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface PanelProps {
  children: ReactNode;
  className?: string;
}

export interface PanelHeadProps {
  /** Optional icon shown left of the title */
  icon?: ReactNode;
  /** Title text — rendered in monospace small caps style */
  title: string;
  /** Optional ALL CAPS count or status, right-aligned */
  count?: string;
  /** Action buttons rendered far-right */
  actions?: ReactNode;
  className?: string;
}

export interface PanelBodyProps {
  children: ReactNode;
  /** When true, removes default padding (e.g. for tables that handle their own spacing) */
  flush?: boolean;
  className?: string;
}

/**
 * Panel
 *
 * The primary surface component used to wrap charts, tables, lists, etc.
 * Composed of three subcomponents: Panel.Head, Panel.Body, optionally Panel.Filters.
 *
 * Usage:
 *   <Panel>
 *     <Panel.Head icon={<ChartIcon />} title="Disclosure activity" count="7 frameworks" />
 *     <Panel.Body>{chart}</Panel.Body>
 *   </Panel>
 */
export function Panel({ children, className }: PanelProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-line bg-panel shadow-e60-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

function PanelHead({ icon, title, count, actions, className }: PanelHeadProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b border-line-soft px-[18px] py-[13px]',
        className
      )}
    >
      {icon && (
        <span className="h-4 w-4 text-nfq-orange" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-2">
        {title}
      </span>
      {(count || actions) && (
        <div className="ml-auto flex items-center gap-1.5">
          {count && (
            <span className="font-mono text-[11px] text-ink-3 tracking-wide">
              {count}
            </span>
          )}
          {actions}
        </div>
      )}
    </div>
  );
}

function PanelBody({ children, flush = false, className }: PanelBodyProps) {
  return <div className={cn(!flush && 'p-[18px]', className)}>{children}</div>;
}

Panel.Head = PanelHead;
Panel.Body = PanelBody;
