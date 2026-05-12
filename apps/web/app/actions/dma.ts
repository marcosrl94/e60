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

function defaultPeriod(): string {
  return `FY${new Date().getUTCFullYear()}`;
}

export interface AssessmentRow {
  id: string;
  period: string;
  threshold: number;
}

/**
 * List all assessments for the signed-in user, newest period first.
 * Used to populate the period switcher and resolve the "active"
 * assessment when no ?period= override is present.
 */
export async function listAssessments(): Promise<AssessmentRow[]> {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('materiality_assessments')
    .select('id, period, threshold')
    .eq('user_id', user.id)
    .order('period', { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    period: r.period,
    threshold: Number(r.threshold),
  }));
}

/**
 * Resolve the active assessment for this page render:
 *
 *   - If `period` is passed, return the matching row (creating it
 *     when it doesn't exist yet — the "click + New period" path).
 *   - Else, return the most-recent existing assessment.
 *   - Else, create + return the default FY{currentYear} row.
 *
 * Idempotent: parallel calls during a server render won't double-
 * insert thanks to the UNIQUE(user_id, period) constraint.
 */
export async function resolveActiveAssessment(
  period?: string,
): Promise<AssessmentRow> {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated.');

  if (period) {
    const { data: existing } = await supabase
      .from('materiality_assessments')
      .select('id, period, threshold')
      .eq('user_id', user.id)
      .eq('period', period)
      .maybeSingle();
    if (existing) {
      return {
        id: existing.id,
        period: existing.period,
        threshold: Number(existing.threshold),
      };
    }
    const { data: created, error } = await supabase
      .from('materiality_assessments')
      .insert({ user_id: user.id, period })
      .select('id, period, threshold')
      .single();
    if (error) throw error;
    return {
      id: created.id,
      period: created.period,
      threshold: Number(created.threshold),
    };
  }

  // No explicit period — pick latest or auto-create the default.
  const all = await listAssessments();
  if (all.length > 0) return all[0]!;

  const fallback = defaultPeriod();
  const { data: created, error } = await supabase
    .from('materiality_assessments')
    .insert({ user_id: user.id, period: fallback })
    .select('id, period, threshold')
    .single();
  if (error) throw error;
  return {
    id: created.id,
    period: created.period,
    threshold: Number(created.threshold),
  };
}

/**
 * Create a brand new assessment for `period` (idempotent against the
 * UNIQUE constraint — re-runs return the existing row). Used by the
 * "+ New period" form in the switcher.
 */
export async function createAssessment(
  period: string,
): Promise<{ ok: true; id: string; period: string } | { error: string }> {
  const trimmed = period.trim();
  if (trimmed.length < 2) {
    return { error: 'Period name is too short.' };
  }
  if (trimmed.length > 32) {
    return { error: 'Period name is too long (32 chars max).' };
  }
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { data, error } = await supabase
    .from('materiality_assessments')
    .upsert(
      { user_id: user.id, period: trimmed },
      { onConflict: 'user_id,period', ignoreDuplicates: false },
    )
    .select('id, period')
    .single();
  if (error) return { error: error.message };

  revalidatePath('/disclosure-hub/materiality');
  return { ok: true, id: data.id, period: data.period };
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
