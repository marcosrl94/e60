/**
 * Derived helpers for the Double Materiality Assessment.
 *
 * Server-side computations that any page can call to surface DMA state
 * outside the Materiality module itself — primarily, the Repository
 * filter "datapoints feeding material IROs".
 */

import { cookies } from 'next/headers';
import { computeFinancialRating, computeImpactRating } from '@e60/domain';
import { createClient } from '@/utils/supabase/server';

/**
 * Set of EFRAG datapoint ids that are linked to at least one IRO whose
 * parent matter has a *material* score in the user's active period.
 *
 * "Material" here = computeImpactRating ≥ threshold OR
 * computeFinancialRating ≥ threshold (ESRS 1 §28 — double materiality
 * is an inclusive OR).
 *
 * RLS scopes every read to auth.uid(); a signed-out caller gets an
 * empty Set. Anonymous browsing of the Repository still works — the
 * filter just won't match anything.
 */
export async function fetchMaterialDatapointIds(): Promise<Set<string>> {
  const supabase = createClient(await cookies());

  // Step 1 · resolve the user's active assessment (most recent).
  const { data: assessments } = await supabase
    .from('materiality_assessments')
    .select('id, threshold')
    .order('period', { ascending: false })
    .limit(1);
  if (!assessments || assessments.length === 0) return new Set();
  const assessment = assessments[0]!;
  const threshold = Number(assessment.threshold);

  // Step 2 · pull all scores for that assessment, keyed by matter.
  const { data: scores } = await supabase
    .from('materiality_scores')
    .select('*')
    .eq('assessment_id', assessment.id);
  if (!scores || scores.length === 0) return new Set();

  const materialMatterIds = new Set<string>();
  for (const s of scores) {
    const impact =
      s.impact_scale != null &&
      s.impact_scope != null &&
      s.impact_likelihood != null
        ? {
            scale: s.impact_scale,
            scope: s.impact_scope,
            irremediable: s.impact_irremediable ?? 0,
            likelihood: s.impact_likelihood,
          }
        : null;
    const financial =
      s.financial_magnitude != null && s.financial_likelihood != null
        ? {
            magnitude: s.financial_magnitude,
            likelihood: s.financial_likelihood,
          }
        : null;
    const impactR = computeImpactRating(impact);
    const financialR = computeFinancialRating(financial);
    if (impactR >= threshold || financialR >= threshold) {
      materialMatterIds.add(s.matter_id);
    }
  }
  if (materialMatterIds.size === 0) return new Set();

  // Step 3 · grab IROs in those material matters, with their DP links.
  const { data: iros } = await supabase
    .from('iros')
    .select('id, matter_id, iro_datapoints(datapoint_id)')
    .eq('assessment_id', assessment.id)
    .in('matter_id', Array.from(materialMatterIds));
  if (!iros) return new Set();

  const dpIds = new Set<string>();
  for (const i of iros) {
    const links = (i.iro_datapoints ?? []) as Array<{ datapoint_id: string }>;
    for (const l of links) dpIds.add(l.datapoint_id);
  }
  return dpIds;
}
