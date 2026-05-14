import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatTco2e,
  formatPct,
  formatDate,
  formatDateTime,
  formatEuro,
} from '../index';

describe('formatNumber', () => {
  it('returns em-dash for null / undefined / NaN', () => {
    expect(formatNumber(null)).toBe('—');
    expect(formatNumber(undefined)).toBe('—');
    expect(formatNumber(Number.NaN)).toBe('—');
  });

  it('applies en-US comma grouping by default', () => {
    expect(formatNumber(1_234_567)).toBe('1,234,567');
  });

  it('respects decimals option', () => {
    expect(formatNumber(3.14159, { decimals: 2 })).toBe('3.14');
    expect(formatNumber(3.14159, { decimals: 4 })).toBe('3.1416');
  });

  it('prefixes positive sign when showSign=true', () => {
    expect(formatNumber(5, { showSign: true })).toBe('+5');
    expect(formatNumber(-5, { showSign: true })).toBe('-5');
    expect(formatNumber(0, { showSign: true })).toBe('0');
  });
});

describe('formatTco2e', () => {
  it('returns em-dash for null / NaN', () => {
    expect(formatTco2e(null)).toEqual({ value: '—', unit: 'tCO₂e' });
    expect(formatTco2e(Number.NaN)).toEqual({ value: '—', unit: 'tCO₂e' });
  });

  it('downgrades to kgCO₂e for very small values (< 0.01 t)', () => {
    const out = formatTco2e(0.005);
    expect(out.unit).toBe('kgCO₂e');
    expect(out.value).toBe('5'); // 0.005 t × 1000 = 5 kg
  });

  it('uses 0 decimals for large values (≥ 1000 t)', () => {
    const out = formatTco2e(23_447);
    expect(out).toEqual({ value: '23,447', unit: 'tCO₂e' });
  });

  it('uses 1 decimal for mid-range values (≥ 10)', () => {
    const out = formatTco2e(142.5);
    expect(out.unit).toBe('tCO₂e');
    expect(out.value).toBe('142.5');
  });

  it('uses 3 decimals for small values (< 10 t but ≥ 0.01)', () => {
    const out = formatTco2e(1.23456);
    expect(out.unit).toBe('tCO₂e');
    expect(out.value).toBe('1.235');
  });
});

describe('formatPct', () => {
  it('accepts percent (0-100) by default', () => {
    expect(formatPct(50)).toBe('50%');
    expect(formatPct(33.33)).toBe('33.3%');
  });

  it('accepts fraction (0-1) when explicitly set', () => {
    expect(formatPct(0.5, 'fraction')).toBe('50%');
    expect(formatPct(0.123, 'fraction')).toBe('12.3%');
  });

  it('drops decimals for integer-ish values', () => {
    expect(formatPct(25.04)).toBe('25%');
  });

  it('renders em-dash for null / NaN', () => {
    expect(formatPct(null)).toBe('—');
    expect(formatPct(Number.NaN)).toBe('—');
  });
});

describe('formatDate', () => {
  it('formats ISO string as dd MMM yyyy', () => {
    expect(formatDate('2026-05-14T09:00:00Z')).toMatch(/^14 May 2026$/);
  });

  it('returns em-dash for null / invalid', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate('not-a-date')).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('formats ISO string as dd MMM HH:mm', () => {
    // Use UTC noon to keep the test deterministic across timezones (the
    // formatter uses the runner's local TZ, so we just assert the shape).
    const out = formatDateTime('2026-05-14T12:00:00Z');
    expect(out).toMatch(/^\d{2} May, \d{2}:\d{2}$/);
  });

  it('returns em-dash for invalid', () => {
    expect(formatDateTime(null)).toBe('—');
  });
});

describe('formatEuro', () => {
  it('formats integer with € prefix', () => {
    expect(formatEuro(1_234)).toBe('€1,234');
  });

  it('compact-scales to B / M / k', () => {
    // formatNumber drops trailing zero (minFractionDigits=0), so integers
    // come out without ".0" — that's intentional, asserts the contract.
    expect(formatEuro(50_000_000_000, { compact: true })).toBe('€50B');
    expect(formatEuro(2_500_000, { compact: true })).toBe('€2.5M');
    expect(formatEuro(12_500, { compact: true })).toBe('€13k');
  });

  it('respects decimals option in non-compact mode', () => {
    expect(formatEuro(1234.567, { decimals: 2 })).toBe('€1,234.57');
  });

  it('returns em-dash for null', () => {
    expect(formatEuro(null)).toBe('—');
  });
});
