import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type TagVariant = 'green' | 'red' | 'orange' | 'blue' | 'purple' | 'gray';

export interface TagProps {
  variant: TagVariant;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<TagVariant, string> = {
  green: 'bg-nfq-greenBg text-nfq-green',
  red: 'bg-nfq-redBg text-nfq-red',
  orange: 'bg-nfq-orangeBg text-nfq-orange',
  blue: 'bg-nfq-blueBg text-nfq-blue',
  purple: 'bg-nfq-purpleBg text-nfq-purple',
  gray: 'bg-canvas-edge text-ink-3',
};

/**
 * Tag
 *
 * Small colored pill used for status, category, framework, etc.
 * Variants map to NFQ palette + neutral gray.
 */
export function Tag({ variant, children, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-[3px] px-[7px] py-px',
        'font-mono text-[9.5px] font-medium uppercase tracking-wide',
        'leading-relaxed',
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
