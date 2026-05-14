import { describe, it, expect } from 'vitest';
import { convertQuantity, listCompatibleInputUnits } from '../unit-conversion';

describe('convertQuantity', () => {
  it('returns null when no conversion path exists', () => {
    expect(convertQuantity(1, 'pkm', 'kWh')).toBeNull();
  });

  it('applies a generic mass conversion (t → kg)', () => {
    const out = convertQuantity(1.5, 't', 'kg');
    expect(out?.value).toBe(1500);
    expect(out?.conversion.factor).toBe(1000);
  });

  it('applies a generic energy conversion (MWh → kWh)', () => {
    const out = convertQuantity(2, 'MWh', 'kWh');
    expect(out?.value).toBe(2000);
  });

  it('applies the reverse of a generic conversion (kg → t)', () => {
    const out = convertQuantity(2500, 'kg', 't');
    expect(out?.value).toBe(2.5);
  });

  it('prefers an activity-specific conversion over the generic one', () => {
    // m3 of natural gas → kWh PCS via IDAE 2023 factor 11.7
    const out = convertQuantity(50_000, 'm3', 'kWh PCS', 'fuel_natural_gas_es');
    expect(out?.value).toBe(50_000 * 11.7);
    expect(out?.conversion.source).toBe('IDAE 2023');
  });

  it('returns the identity when from === to', () => {
    const out = convertQuantity(42, 'kWh', 'kWh');
    expect(out?.value).toBe(42);
    expect(out?.conversion.factor).toBe(1);
  });
});

describe('listCompatibleInputUnits', () => {
  it('always includes the target unit itself', () => {
    expect(listCompatibleInputUnits('kWh')).toContain('kWh');
  });

  it('lists generic siblings for an energy target (kWh)', () => {
    const units = listCompatibleInputUnits('kWh');
    expect(units).toEqual(expect.arrayContaining(['kWh', 'MWh', 'GWh']));
  });

  it('adds activity-specific inputs when activityKey is provided', () => {
    const units = listCompatibleInputUnits('kWh PCS', 'fuel_natural_gas_es');
    expect(units).toContain('m3');
    expect(units).toContain('MWh PCS');
  });

  it('does not bleed activity-specific units across activities', () => {
    // m3 → kWh is only valid for natural gas. Without activityKey, kWh should
    // not list m3 as a compatible input.
    const units = listCompatibleInputUnits('kWh');
    expect(units).not.toContain('m3');
  });
});
