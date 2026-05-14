import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn', () => {
  it('joins simple classnames', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('drops falsy values (conditional helpers)', () => {
    const isLarge = false;
    expect(cn('a', isLarge && 'b', null, undefined, 'c')).toBe('a c');
  });

  it('deduplicates conflicting Tailwind utilities (twMerge)', () => {
    // The last px-* wins.
    expect(cn('px-4 py-2', 'px-6')).toBe('py-2 px-6');
  });

  it('respects ordering when classes are not in the same property family', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
  });

  it('flattens array and object inputs through clsx', () => {
    expect(cn(['a', 'b'], { c: true, d: false })).toBe('a b c');
  });

  it('returns empty string when called with nothing', () => {
    expect(cn()).toBe('');
  });
});
