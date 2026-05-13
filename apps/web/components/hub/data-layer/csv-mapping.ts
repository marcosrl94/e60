/**
 * Maps CSV header names to the PCAF-min columns of `portfolio_exposures`.
 *
 * Aliases cover English + Spanish vocabulary that recurs in real bank
 * extracts (Temenos, Finastra, SAS exports, hand-rolled Excel). The
 * mapper is greedy + first-match-wins per header to keep behaviour
 * predictable; users see the resolved mapping in the review step before
 * confirming the ingest.
 */

export type PortfolioField =
  | 'counterparty_name'
  | 'counterparty_id'
  | 'nace_code'
  | 'nace_label'
  | 'ead_eur'
  | 'outstanding_eur'
  | 'region'
  | 'as_of_date';

export const PORTFOLIO_FIELD_LABEL: Record<PortfolioField, string> = {
  counterparty_name: 'Counterparty name',
  counterparty_id: 'Counterparty ID / LEI',
  nace_code: 'NACE code',
  nace_label: 'Sector label',
  ead_eur: 'EAD (EUR)',
  outstanding_eur: 'Outstanding (EUR)',
  region: 'Region / country',
  as_of_date: 'As-of date',
};

export const PORTFOLIO_REQUIRED: PortfolioField[] = ['counterparty_name'];

export const PORTFOLIO_FIELD_ALIASES: Record<PortfolioField, string[]> = {
  counterparty_name: [
    'counterparty',
    'counterparty_name',
    'borrower',
    'borrower_name',
    'client',
    'client_name',
    'name',
    'contraparte',
    'cliente',
    'razon_social',
  ],
  counterparty_id: [
    'counterparty_id',
    'lei',
    'borrower_id',
    'client_id',
    'id',
    'cif',
    'nif',
  ],
  nace_code: ['nace', 'nace_code', 'sector_code', 'cnae', 'cnae_code'],
  nace_label: [
    'nace_label',
    'sector',
    'sector_label',
    'industry',
    'sector_name',
    'sector_desc',
  ],
  ead_eur: [
    'ead',
    'ead_eur',
    'exposure',
    'exposure_at_default',
    'exposure_eur',
    'exposicion',
  ],
  outstanding_eur: [
    'outstanding',
    'outstanding_eur',
    'amount',
    'amount_eur',
    'balance',
    'saldo',
    'principal',
  ],
  region: ['region', 'country', 'country_code', 'geography', 'geo', 'pais'],
  as_of_date: ['date', 'as_of_date', 'report_date', 'fecha', 'as_of'],
};

export interface ColumnMapping {
  matched: Partial<Record<PortfolioField, number>>;
  unmatchedHeaders: string[];
  missingRequired: PortfolioField[];
}

export function mapColumns(headers: string[]): ColumnMapping {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[\s_-]+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  const headerNorms = headers.map(norm);
  const matched: Partial<Record<PortfolioField, number>> = {};
  const used = new Set<number>();
  for (const field of Object.keys(PORTFOLIO_FIELD_ALIASES) as PortfolioField[]) {
    for (const alias of PORTFOLIO_FIELD_ALIASES[field]) {
      const idx = headerNorms.findIndex(
        (h, i) => !used.has(i) && h === norm(alias),
      );
      if (idx !== -1) {
        matched[field] = idx;
        used.add(idx);
        break;
      }
    }
  }
  const unmatchedHeaders = headers.filter((_, i) => !used.has(i));
  const missingRequired = PORTFOLIO_REQUIRED.filter((f) => matched[f] == null);
  return { matched, unmatchedHeaders, missingRequired };
}

// ── Coercers ────────────────────────────────────────────────────────────

export function coerceNumber(raw: string | undefined): number | null {
  if (raw == null) return null;
  const s = raw.trim();
  if (s === '') return null;
  // Strip currency symbols and thousands separators; accept both `1.234,56`
  // and `1,234.56` by sniffing the last separator.
  const cleaned = s.replace(/[€$£\s]/g, '');
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  let normalised: string;
  if (lastComma > lastDot) {
    normalised = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    normalised = cleaned.replace(/,/g, '');
  }
  const n = Number(normalised);
  return Number.isFinite(n) ? n : null;
}

export function coerceDate(raw: string | undefined): string | null {
  if (raw == null) return null;
  const s = raw.trim();
  if (s === '') return null;
  // ISO YYYY-MM-DD passes straight through.
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // DD/MM/YYYY or DD-MM-YYYY → YYYY-MM-DD.
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (m) {
    const [, d, mo, yRaw] = m;
    const y = yRaw!.length === 2 ? (Number(yRaw) >= 70 ? `19${yRaw}` : `20${yRaw}`) : yRaw;
    return `${y}-${mo!.padStart(2, '0')}-${d!.padStart(2, '0')}`;
  }
  // Last-resort Date.parse.
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export function pickCell(
  row: string[],
  idx: number | undefined,
): string | undefined {
  if (idx == null) return undefined;
  return row[idx];
}
