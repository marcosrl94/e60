import { cn } from '../lib/cn';

export interface FrameworkChipProps {
  /** Short framework code, e.g. "CSRD", "GRI 305", "CDP C6.1" */
  framework: string;
  className?: string;
}

/**
 * FrameworkChip
 *
 * Inline chip used to indicate which reporting framework a datapoint
 * is mapped to. Multiple chips can be stacked next to each other.
 */
export function FrameworkChip({ framework, className }: FrameworkChipProps) {
  return (
    <span
      className={cn(
        'mr-1 inline-flex items-center gap-1',
        'rounded-[3px] border border-line-soft bg-canvas px-1.5 py-px',
        'font-mono text-[9px] font-normal text-ink-2 tracking-wide',
        className
      )}
    >
      {framework}
    </span>
  );
}
