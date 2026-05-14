import { describe, it, expect } from 'vitest';
import {
  computeImpactRating,
  computeFinancialRating,
  isMaterial,
  type ImpactScore,
  type FinancialScore,
} from '../dma';

const impact = (s: Partial<ImpactScore> = {}): ImpactScore => ({
  scale: 3,
  scope: 3,
  irremediable: 0,
  likelihood: 5,
  ...s,
});

const financial = (s: Partial<FinancialScore> = {}): FinancialScore => ({
  magnitude: 3,
  likelihood: 5,
  ...s,
});

describe('computeImpactRating', () => {
  it('returns 0 for null / undefined', () => {
    expect(computeImpactRating(null)).toBe(0);
    expect(computeImpactRating(undefined)).toBe(0);
  });

  it('averages scale + scope at max likelihood with irremediable=0', () => {
    // scale=4, scope=2, irremediable=0 (excluded), likelihood=5
    // base = (4+2)/2 = 3 · weighted = 3 × (5/5) = 3
    expect(computeImpactRating(impact({ scale: 4, scope: 2 }))).toBe(3);
  });

  it('includes irremediable dimension when > 0', () => {
    // scale=4, scope=2, irremediable=3 (included), likelihood=5
    // base = (4+2+3)/3 = 3 · weighted = 3
    expect(
      computeImpactRating(impact({ scale: 4, scope: 2, irremediable: 3 })),
    ).toBe(3);
  });

  it('scales by likelihood / 5', () => {
    // scale=5, scope=5 at likelihood=2.5 → 5 × (2.5/5) = 2.5
    expect(computeImpactRating(impact({ scale: 5, scope: 5, likelihood: 2.5 as 1 | 2 | 3 | 4 | 5 })))
      .toBe(2.5);
  });

  it('rounds to 2 decimals', () => {
    // scale=4, scope=3 → mean=3.5, ×(4/5)=2.8 → rounds to 2.8
    expect(computeImpactRating(impact({ scale: 4, scope: 3, likelihood: 4 })))
      .toBe(2.8);
  });
});

describe('computeFinancialRating', () => {
  it('returns 0 for null / undefined', () => {
    expect(computeFinancialRating(null)).toBe(0);
    expect(computeFinancialRating(undefined)).toBe(0);
  });

  it('multiplies magnitude × (likelihood / 5)', () => {
    expect(computeFinancialRating(financial({ magnitude: 4, likelihood: 5 }))).toBe(4);
    expect(computeFinancialRating(financial({ magnitude: 4, likelihood: 2.5 as 1 | 2 | 3 | 4 | 5 })))
      .toBe(2);
  });

  it('rounds to 2 decimals', () => {
    expect(computeFinancialRating(financial({ magnitude: 3, likelihood: 4 }))).toBe(2.4);
  });
});

describe('isMaterial (ESRS 1 §28 — inclusive OR)', () => {
  const threshold = 3;

  it('is material when impact axis crosses', () => {
    expect(
      isMaterial(
        impact({ scale: 5, scope: 5, likelihood: 5 }),
        financial({ magnitude: 1, likelihood: 1 }),
        threshold,
      ),
    ).toBe(true);
  });

  it('is material when financial axis crosses', () => {
    expect(
      isMaterial(
        impact({ scale: 1, scope: 1, likelihood: 1 }),
        financial({ magnitude: 5, likelihood: 5 }),
        threshold,
      ),
    ).toBe(true);
  });

  it('is not material when both axes are below threshold', () => {
    expect(
      isMaterial(
        impact({ scale: 2, scope: 2, likelihood: 2 }),
        financial({ magnitude: 2, likelihood: 2 }),
        threshold,
      ),
    ).toBe(false);
  });

  it('handles null scores by treating them as 0', () => {
    expect(isMaterial(null, null, threshold)).toBe(false);
    expect(
      isMaterial(null, financial({ magnitude: 5, likelihood: 5 }), threshold),
    ).toBe(true);
  });
});
