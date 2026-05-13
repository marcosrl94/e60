/**
 * Emissions domain
 *
 * Native Carbon Intelligence types — own-operations GHG inventory (Scope 1,
 * Scope 2 location/market, Scope 3 categories 1-14). Lifted and trimmed from
 * the legacy `nfq-carbon-intelligence` repo (see `0ld/` archive).
 */

import { z } from 'zod';

export const ScopeSchema = z.enum(['s1', 's2', 's3']);
export type Scope = z.infer<typeof ScopeSchema>;

export const FactorSourceSchema = z.enum(['MITECO', 'IDAE', 'DEFRA']);
export type FactorSource = z.infer<typeof FactorSourceSchema>;

export const Scope2MethodSchema = z.enum(['location_based', 'market_based']);
export type Scope2Method = z.infer<typeof Scope2MethodSchema>;

export const RenewableInstrumentTypeSchema = z.enum([
  'GoO',
  'REC',
  'PPA',
  'green_tariff',
]);
export type RenewableInstrumentType = z.infer<typeof RenewableInstrumentTypeSchema>;

/**
 * GHG Protocol / ESRS data-quality tier.
 *  · 1 = primary measured / metered
 *  · 2 = supplier-specific or activity-based with peer-reviewed factor
 *  · 3 = average / spend-based / proxy
 */
export const DataQualityTierSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);
export type DataQualityTier = z.infer<typeof DataQualityTierSchema>;

/**
 * Emission factor — a single row of the calculation catalogue.
 *
 * Semantics: tCO2e = quantity * efValue / 1000.
 * `efValue` is in kgCO2e per 1 unit of `efUnit` (kWh, L, km, kg, m3, pkm, vkm…).
 */
export const EmissionFactorSchema = z.object({
  /** Stable key used for seed idempotency and programmatic references. */
  activityKey: z.string(),
  scope: ScopeSchema,
  /** Top-level category, e.g. "Combustión estacionaria", "Electricidad". */
  category: z.string(),
  /** Optional sub-classification, e.g. "Gas natural", "Mix eléctrico nacional". */
  subcategory: z.string().nullable().optional(),
  /** Human-readable label shown in pickers. */
  activityLabel: z.string(),
  /** Numerator (kept for clarity; always 'kgCO2e'). */
  unit: z.literal('kgCO2e'),
  /** kgCO2e per 1 efUnit. */
  efValue: z.number().nonnegative(),
  /** Denominator unit (kWh, L, kg, m3, pkm, vkm, night, etc.). */
  efUnit: z.string(),
  source: FactorSourceSchema,
  sourceVersion: z.string().optional(),
  year: z.number().int(),
  /** ISO-3166 alpha-2 (or "EU27" / "GLOBAL"). */
  region: z.string(),
  citationUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

export type EmissionFactor = z.infer<typeof EmissionFactorSchema>;

/**
 * Compute tCO2e from (quantity, efValue). The factor lives in kgCO2e per
 * unit, so we divide by 1000. Returns null if any input is missing or NaN.
 */
export function computeTco2e(
  quantity: number | null | undefined,
  efValue: number | null | undefined,
): number | null {
  if (quantity == null || efValue == null) return null;
  if (Number.isNaN(quantity) || Number.isNaN(efValue)) return null;
  return (Number(quantity) * Number(efValue)) / 1000;
}

// ── Disclosure bindings (C1 · CI ↔ Hub bridge) ────────────────────────

/**
 * Default ESRS datapoint IDs each scope feeds. Lifted from EFRAG IG3
 * E1-6 disclosure (Gross GHG emissions per scope):
 *   · E1-6_07 — Gross Scope 1 greenhouse gas emissions
 *   · E1-6_09 — Gross location-based Scope 2 greenhouse gas emissions
 *   · E1-6_10 — Gross market-based Scope 2 greenhouse gas emissions
 *   · E1-6_11 — Gross Scope 3 greenhouse gas emissions
 *
 * The split for Scope 2 mirrors GHG Protocol Scope 2 Guidance: an entry
 * with `scope2Method='location_based'` feeds E1-6_09, `market_based`
 * feeds E1-6_10.
 */
export const DEFAULT_DISCLOSURE_BINDINGS = {
  s1: ['E1-6_07'],
  s2_location: ['E1-6_09'],
  s2_market: ['E1-6_10'],
  s3: ['E1-6_11'],
} as const;

export const DISCLOSURE_BINDING_LABELS: Record<string, string> = {
  'E1-6_07': 'Gross Scope 1 GHG emissions',
  'E1-6_09': 'Gross location-based Scope 2 GHG emissions',
  'E1-6_10': 'Gross market-based Scope 2 GHG emissions',
  'E1-6_11': 'Gross Scope 3 GHG emissions',
};

/**
 * Derive the default disclosure bindings for a (scope, scope2Method)
 * tuple. Returns a freshly-cloned array so the caller can mutate it
 * without poisoning `DEFAULT_DISCLOSURE_BINDINGS`.
 */
export function derivedDisclosureBindings(
  scope: Scope,
  scope2Method: Scope2Method | null | undefined,
): string[] {
  if (scope === 's1') return [...DEFAULT_DISCLOSURE_BINDINGS.s1];
  if (scope === 's2') {
    return scope2Method === 'market_based'
      ? [...DEFAULT_DISCLOSURE_BINDINGS.s2_market]
      : [...DEFAULT_DISCLOSURE_BINDINGS.s2_location];
  }
  if (scope === 's3') return [...DEFAULT_DISCLOSURE_BINDINGS.s3];
  return [];
}

export * from './unit-conversion';
