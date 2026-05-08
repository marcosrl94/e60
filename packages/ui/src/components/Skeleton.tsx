import { cn } from '../lib/cn';

export interface SkeletonProps {
  /** Width applied via Tailwind class or inline style. */
  className?: string;
  /** Inline width override (px or %). */
  width?: number | string;
  /** Inline height override (px or %). */
  height?: number | string;
  /** Square circular spinner shape (avatar, dot, etc.). */
  rounded?: 'sm' | 'md' | 'full';
}

/**
 * Skeleton
 *
 * Animated placeholder block for loading states. Uses Tailwind's `animate-pulse`
 * + a soft canvas-edge tint that matches the design tokens.
 */
export function Skeleton({ className, width, height, rounded = 'sm' }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-pulse bg-canvas-edge',
        rounded === 'full' ? 'rounded-full' : rounded === 'md' ? 'rounded-md' : 'rounded-sm',
        className,
      )}
      style={{ width, height }}
    />
  );
}
