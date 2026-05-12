/**
 * Double Materiality Assessment (DMA) types · EFRAG ESRS 1
 *
 * Models the per-period assessment the CSRD requires of every reporting
 * undertaking. Stored in Supabase across four tables — see the
 * `dma_schema` migration — with RLS scoping every row to the user that
 * owns the parent assessment.
 *
 * Conceptual layers, bottom-up:
 *
 *   sustainability_matters  · catalogue · 32 rows per ESRS 1 AR16
 *           ↑
 *   materiality_scores      · per assessment × matter, 6 dimensions
 *           ↑                       (4 impact + 2 financial)
 *   iros                    · per assessment × matter, free-form list
 *           ↑                       of impacts / risks / opportunities
 *   materiality_assessments · the container, one per (user × period)
 *
 * The legacy `industry.ts` heatmap stays as a sub-tool — pre-screening
 * E1 impact materiality before the analyst sits down to score the full
 * matrix here.
 */

import { z } from 'zod';
import { EsrsTopicSchema } from '../datapoints';

// NOTE: we redeclare the three small enums locally (`category`,
// `timeHorizon`, `valueChainLocation`) instead of re-using the existing
// schemas from `./index` because that path triggers a circular import —
// `index.ts` re-exports `./dma` so the index module is still
// initialising when dma.ts evaluates. The enum values stay in lock-step
// with the originals; if you add a category here, mirror it there.

const DmaMaterialityCategorySchema = z.enum(['env', 'soc', 'gov']);
const DmaTimeHorizonSchema = z.enum(['short', 'medium', 'long']);
const DmaValueChainScopeSchema = z.enum([
  'own_operations',
  'upstream',
  'downstream',
]);

// ── Catalogue: ESRS 1 AR16 sustainability matters ────────────────────

export const SustainabilityMatterSchema = z.object({
  /** Stable id, e.g. 'E1.mitigation' — used as the FK from scores/iros. */
  id: z.string(),
  topic: EsrsTopicSchema,
  category: DmaMaterialityCategorySchema,
  label: z.string(),
  description: z.string().nullable(),
  sortOrder: z.number().int(),
});
export type SustainabilityMatter = z.infer<typeof SustainabilityMatterSchema>;

// ── Score dimensions per ESRS 1 §43-50 ──────────────────────────────

/**
 * Impact materiality dimensions per ESRS 1 §43-44.
 *
 *  scale         — severity of the effect on people/environment (1-5)
 *  scope         — breadth of who/what is affected (1-5)
 *  irremediable  — irreversibility, only meaningful for negative impacts
 *                  (0 = N/A for positive impacts; 1-5 otherwise)
 *  likelihood    — only meaningful for potential impacts;
 *                  actual impacts default to 5 (already happening)
 */
export const ImpactScoreSchema = z.object({
  scale: z.number().min(1).max(5),
  scope: z.number().min(1).max(5),
  irremediable: z.number().min(0).max(5),
  likelihood: z.number().min(1).max(5),
});
export type ImpactScore = z.infer<typeof ImpactScoreSchema>;

/**
 * Financial materiality dimensions per ESRS 1 §49-50.
 *
 *  magnitude   — size of the expected financial effect (1-5)
 *  likelihood  — probability over the assessment horizon (1-5)
 */
export const FinancialScoreSchema = z.object({
  magnitude: z.number().min(1).max(5),
  likelihood: z.number().min(1).max(5),
});
export type FinancialScore = z.infer<typeof FinancialScoreSchema>;

// ── Per-matter scoring record ───────────────────────────────────────

export const MatterScoreSchema = z.object({
  assessmentId: z.string(),
  matterId: z.string(),
  impact: ImpactScoreSchema.nullable(),
  financial: FinancialScoreSchema.nullable(),
  notes: z.string().nullable(),
  updatedAt: z.string().datetime(),
});
export type MatterScore = z.infer<typeof MatterScoreSchema>;

// ── IRO (Impacts, Risks, Opportunities) per assessment ──────────────

/**
 * EFRAG distinguishes actual vs. potential impacts because the
 * likelihood dimension only applies to potentials (actuals = already
 * happening). Risks and opportunities collapse into a single label
 * for each — there's no "actual risk" concept in ESRS.
 */
export const DmaIroTypeSchema = z.enum([
  'impact_actual',
  'impact_potential',
  'risk',
  'opportunity',
]);
export type DmaIroType = z.infer<typeof DmaIroTypeSchema>;

export const DmaIroSchema = z.object({
  id: z.string(),
  assessmentId: z.string(),
  matterId: z.string(),
  type: DmaIroTypeSchema,
  description: z.string(),
  timeHorizon: DmaTimeHorizonSchema,
  valueChainLocation: DmaValueChainScopeSchema,
  /**
   * Free-form stakeholder labels for now — formal Stakeholder records
   * land in M3 when we wire the consultation module.
   */
  stakeholders: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type DmaIro = z.infer<typeof DmaIroSchema>;

// ── Assessment container (org × period) ─────────────────────────────

/**
 * One MaterialityAssessment per (user × period). `period` is free-form
 * text so the org can pick its preferred convention: 'FY2026',
 * '2026-Q1', 'CY2025-baseline', whatever the CRO uses.
 */
export const MaterialityAssessmentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  period: z.string(),
  /**
   * Materiality cut-off on the combined 0-5 rating. Anything above on
   * either axis is declared material per ESRS 1 §28. Default 3.0.
   */
  threshold: z.number().min(0).max(5),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type MaterialityAssessment = z.infer<typeof MaterialityAssessmentSchema>;

// ── Aggregation helpers ─────────────────────────────────────────────

/**
 * Collapse impact dimensions to a single 0-5 rating.
 *
 * Methodology: mean of present dimensions (irremediable opt-in for
 * negative impacts; positive impacts pass 0 which is excluded),
 * weighted by likelihood / 5. Banks can override the formula later
 * by replacing this function — for v1 we keep it transparent.
 */
export function computeImpactRating(
  s: ImpactScore | null | undefined,
): number {
  if (!s) return 0;
  const dims = [s.scale, s.scope];
  if (s.irremediable > 0) dims.push(s.irremediable);
  const base = dims.reduce((a, b) => a + b, 0) / dims.length;
  const weighted = base * (s.likelihood / 5);
  return Math.round(weighted * 100) / 100;
}

/**
 * Collapse financial dimensions to a single 0-5 rating:
 * magnitude × (likelihood / 5).
 */
export function computeFinancialRating(
  s: FinancialScore | null | undefined,
): number {
  if (!s) return 0;
  return Math.round(s.magnitude * (s.likelihood / 5) * 100) / 100;
}

/**
 * A matter is declared material if EITHER axis crosses the threshold
 * (ESRS 1 §28 — double materiality is inclusive OR).
 */
export function isMaterial(
  impact: ImpactScore | null | undefined,
  financial: FinancialScore | null | undefined,
  threshold: number,
): boolean {
  return (
    computeImpactRating(impact) >= threshold ||
    computeFinancialRating(financial) >= threshold
  );
}
