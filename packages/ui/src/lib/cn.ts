import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Class name combiner.
 * Combines clsx for conditional classes with tailwind-merge for
 * Tailwind class deduplication. Standard helper across shadcn-based codebases.
 *
 * Example:
 *   cn('px-4 py-2', isLarge && 'px-6 py-3')
 *   // → 'py-2 px-6 py-3' if isLarge, else 'px-4 py-2'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
