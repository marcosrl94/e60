/**
 * Display formatters
 *
 * Single source of truth for number / date formatting across the app. Use
 * these instead of inline `toLocaleString` calls so units, decimal places
 * and locale stay consistent.
 *
 * Locale defaults to en-GB for numbers (space-grouped is harder to scan in
 * dense tables; using en-US-style commas) and a short en-GB date for dates.
 */

const NUMBER_LOCALE = 'en-US';
const DATE_LOCALE = 'en-GB';

interface NumberOpts {
  /** Maximum decimals shown. Default: 2. */
  decimals?: number;
  /** Force a sign prefix (+/-) for non-zero values. */
  showSign?: boolean;
}

export function formatNumber(value: number | null | undefined, opts: NumberOpts = {}): string {
  if (value == null || Number.isNaN(value)) return '—';
  const { decimals = 2, showSign = false } = opts;
  const formatted = value.toLocaleString(NUMBER_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  if (showSign && value > 0) return `+${formatted}`;
  return formatted;
}

/**
 * tCO₂e formatter with automatic unit downgrade: < 0.01 t → render in kg.
 * Returns the value + a separate `unit` string so callers can style them
 * differently (mono small for the unit).
 */
export function formatTco2e(
  value: number | null | undefined,
): { value: string; unit: 'tCO₂e' | 'kgCO₂e' } {
  if (value == null || Number.isNaN(value)) return { value: '—', unit: 'tCO₂e' };
  const abs = Math.abs(value);
  if (abs > 0 && abs < 0.01) {
    return {
      value: formatNumber(value * 1000, { decimals: 1 }),
      unit: 'kgCO₂e',
    };
  }
  if (abs >= 1000) {
    return { value: formatNumber(value, { decimals: 0 }), unit: 'tCO₂e' };
  }
  return { value: formatNumber(value, { decimals: abs >= 10 ? 1 : 3 }), unit: 'tCO₂e' };
}

/**
 * Percentage with a fixed decimal scheme: 0 decimals when integer-ish,
 * 1 decimal otherwise. Accepts the value either as 0-1 or 0-100 via the
 * `from` option (default: percent).
 */
export function formatPct(
  value: number | null | undefined,
  from: 'percent' | 'fraction' = 'percent',
): string {
  if (value == null || Number.isNaN(value)) return '—';
  const v = from === 'fraction' ? value * 100 : value;
  const rounded = Math.round(v * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
}

/**
 * Compact date shown in tables and timeline rows: `dd MMM yyyy` in en-GB
 * (so months read 02 Oct 2025 instead of 10/2/2025). Accepts ISO strings,
 * Date instances or numeric timestamps.
 */
export function formatDate(input: string | number | Date | null | undefined): string {
  if (input == null) return '—';
  const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(DATE_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Date + time in `dd MMM HH:mm` for log-style timestamps (audit trails,
 * "last sync today 14:23"). Year intentionally omitted for compactness.
 */
export function formatDateTime(input: string | number | Date | null | undefined): string {
  if (input == null) return '—';
  const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(DATE_LOCALE, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Money formatter for €. Defaults to no decimals; auto-scale to MEUR / BEUR
 * for large values when `compact: true`.
 */
export function formatEuro(
  value: number | null | undefined,
  opts: { compact?: boolean; decimals?: number } = {},
): string {
  if (value == null || Number.isNaN(value)) return '—';
  const { compact = false, decimals = 0 } = opts;
  if (compact) {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `€${formatNumber(value / 1_000_000_000, { decimals: 1 })}B`;
    if (abs >= 1_000_000) return `€${formatNumber(value / 1_000_000, { decimals: 1 })}M`;
    if (abs >= 1_000) return `€${formatNumber(value / 1_000, { decimals: 0 })}k`;
  }
  return `€${formatNumber(value, { decimals })}`;
}
