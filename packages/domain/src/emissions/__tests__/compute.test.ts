import { describe, it, expect } from 'vitest';
import { computeTco2e } from '../index';

describe('computeTco2e', () => {
  it('converts quantity × efValue / 1000 to tonnes', () => {
    // 100 kWh × 0.25 kgCO2e/kWh = 25 kgCO2e = 0.025 tCO2e
    expect(computeTco2e(100, 0.25)).toBe(0.025);
  });

  it('returns null when quantity is missing', () => {
    expect(computeTco2e(null, 0.25)).toBeNull();
    expect(computeTco2e(undefined, 0.25)).toBeNull();
  });

  it('returns null when efValue is missing', () => {
    expect(computeTco2e(100, null)).toBeNull();
    expect(computeTco2e(100, undefined)).toBeNull();
  });

  it('returns null when either input is NaN', () => {
    expect(computeTco2e(Number.NaN, 0.25)).toBeNull();
    expect(computeTco2e(100, Number.NaN)).toBeNull();
  });

  it('handles zero quantity cleanly', () => {
    expect(computeTco2e(0, 0.25)).toBe(0);
  });

  it('preserves precision for realistic inputs', () => {
    // 50_000 m3 gas natural × 11.7 kWh/m3 = 585_000 kWh
    // × 0.18 kgCO2e/kWh ÷ 1000 = 105.3 tCO2e
    const quantity = 585_000;
    const ef = 0.18;
    expect(computeTco2e(quantity, ef)).toBeCloseTo(105.3, 6);
  });
});
