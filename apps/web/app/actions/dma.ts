'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type { FinancialScore, ImpactScore } from '@e60/domain';
import { createClient } from '@/utils/supabase/server';

/**
 * Server-side mutations for the Double Materiality Assessment.
 * Three operations:
 *
 *   - ensureDefaultAssessment() · pulls or creates a FY2026 row in
 *     public.materiality_assessments for the signed-in user, so the
 *     UI always has an assessmentId to bind scores to without a
 *     dedicated "create assessment" flow at the page level.
 *
 *   - upsertMatterScore(input) · upserts a row in
 *     public.materiality_scores (composite PK = assessment × matter).
 *     Either dimension block can be null to mean "not scored yet".
 *
 *   - updateAssessmentThreshold(id, threshold) · single field update
 *     on the assessment row. Triggers re-render of the matrix where
 *     the threshold lines move.
 *
 * Every action revalidates /disclosure-hub/materiality so the server
 * render picks up fresh state on the next paint.
 */

const DEFAULT_PERIOD = 'FY2026';

export interface DefaultAssessment {
  id: string;
  period: string;
  threshold: number;
}

export async function ensureDefaultAssessment(): Promise<DefaultAssessment> {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated.');

  const { data: existing, error: readErr } = await supabase
    .from('materiality_assessments')
    .select('id, period, threshold')
    .eq('user_id', user.id)
    .eq('period', DEFAULT_PERIOD)
    .maybeSingle();
  if (readErr) throw readErr;

  if (existing) {
    return {
      id: existing.id,
      period: existing.period,
      threshold: Number(existing.threshold),
    };
  }

  const { data: created, error: insertErr } = await supabase
    .from('materiality_assessments')
    .insert({ user_id: user.id, period: DEFAULT_PERIOD })
    .select('id, period, threshold')
    .single();
  if (insertErr) throw insertErr;

  return {
    id: created.id,
    period: created.period,
    threshold: Number(created.threshold),
  };
}

export interface UpsertScoreInput {
  assessmentId: string;
  matterId: string;
  impact: ImpactScore | null;
  financial: FinancialScore | null;
  notes: string | null;
}

type ActionResult = { ok: true } | { error: string };

export async function upsertMatterScore(
  input: UpsertScoreInput,
): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { error } = await supabase.from('materiality_scores').upsert(
    {
      assessment_id: input.assessmentId,
      matter_id: input.matterId,
      impact_scale: input.impact?.scale ?? null,
      impact_scope: input.impact?.scope ?? null,
      impact_irremediable: input.impact?.irremediable ?? null,
      impact_likelihood: input.impact?.likelihood ?? null,
      financial_magnitude: input.financial?.magnitude ?? null,
      financial_likelihood: input.financial?.likelihood ?? null,
      notes: input.notes,
    },
    { onConflict: 'assessment_id,matter_id' },
  );

  if (error) return { error: error.message };

  revalidatePath('/disclosure-hub/materiality');
  return { ok: true };
}

export async function updateAssessmentThreshold(
  assessmentId: string,
  threshold: number,
): Promise<ActionResult> {
  if (threshold < 0 || threshold > 5) {
    return { error: 'Threshold must be between 0 and 5.' };
  }
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { error } = await supabase
    .from('materiality_assessments')
    .update({ threshold })
    .eq('id', assessmentId);

  if (error) return { error: error.message };

  revalidatePath('/disclosure-hub/materiality');
  return { ok: true };
}
