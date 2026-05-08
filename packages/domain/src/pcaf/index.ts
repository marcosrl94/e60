/**
 * PCAF · Partnership for Carbon Accounting Financials
 *
 * Models financed emissions for the banking book. Aligned with PCAF
 * methodology v3 (2024).
 */

import { z } from 'zod';

/**
 * PCAF asset class — determines methodology and data quality scoring.
 */
export const PcafAssetClassSchema = z.enum([
  'business_loans',
  'project_finance',
  'mortgages',
  'commercial_real_estate',
  'motor_vehicle_loans',
  'sovereign_debt',
  'listed_equity',
  'corporate_bonds',
  'derivatives',
]);

export type PcafAssetClass = z.infer<typeof PcafAssetClassSchema>;

/**
 * Sectoral classification for emissions reporting.
 */
export const SectorSchema = z.enum([
  'power_generation',
  'cement',
  'steel',
  'aluminum',
  'oil_gas',
  'coal_mining',
  'aviation',
  'shipping',
  'heavy_transport',
  'real_estate_residential',
  'real_estate_commercial',
  'agriculture',
  'pulp_paper',
  'chemicals',
  'other',
]);

export type Sector = z.infer<typeof SectorSchema>;

/**
 * PCAF Data Quality score · 1 (best, verified data) to 5 (worst, proxies).
 */
export const PcafDqSchema = z.number().min(1).max(5);
export type PcafDq = z.infer<typeof PcafDqSchema>;

/**
 * Counterparty-level financed emissions record.
 */
export const FinancedEmissionsSchema = z.object({
  counterpartyId: z.string(),
  counterpartyName: z.string(),
  assetClass: PcafAssetClassSchema,
  sector: SectorSchema,
  /** Exposure at default in EUR */
  ead: z.number(),
  /** Attributed emissions in tCO2e (Scope 1+2 of counterparty, weighted by attribution factor) */
  scope12Attributed: z.number(),
  /** Scope 3 of counterparty when reportable */
  scope3Attributed: z.number().optional(),
  /** Data Quality score */
  dataQualityScore: PcafDqSchema,
  /** PCAF Score 1-5 (separate from DQ — relates to data sources methodology) */
  pcafScore: PcafDqSchema,
  /** Whether the counterparty has a validated transition plan (NZBA/SBTi) */
  hasTransitionPlan: z.boolean(),
  /** Implied temperature rise in °C, when computable */
  itr: z.number().optional(),
  /** Last calculation date */
  asOf: z.string().date(),
});

export type FinancedEmissions = z.infer<typeof FinancedEmissionsSchema>;

/**
 * Aggregated portfolio metrics.
 */
export interface PortfolioMetrics {
  absoluteEmissions: number;       // tCO2e
  intensityPerEur: number;         // tCO2e per €M
  pcafCoverage: number;            // % of portfolio covered
  averageDataQuality: number;      // 1-5 weighted average
  counterpartyCount: number;
  totalEad: number;                // EUR
}
