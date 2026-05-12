'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type {
  DmaIroType,
  TimeHorizon,
  ValueChainScope,
} from '@e60/domain';
import { createClient } from '@/utils/supabase/server';

/**
 * IRO mutations against public.iros (Impacts, Risks, Opportunities).
 *
 * RLS scopes every row through its parent materiality_assessments.user_id,
 * so we don't need to assert ownership here — the policy rejects writes
 * that don't match auth.uid(). We still call getUser() defensively for
 * a friendly error message before the round-trip.
 */

export interface CreateIroInput {
  assessmentId: string;
  matterId: string;
  type: DmaIroType;
  description: string;
  timeHorizon: TimeHorizon;
  valueChainLocation: ValueChainScope;
  stakeholders: string[];
}

type ActionResult = { ok: true } | { error: string };

export async function createIro(input: CreateIroInput): Promise<ActionResult> {
  if (input.description.trim().length < 3) {
    return { error: 'Description must be at least 3 characters.' };
  }
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { error } = await supabase.from('iros').insert({
    assessment_id: input.assessmentId,
    matter_id: input.matterId,
    type: input.type,
    description: input.description.trim(),
    time_horizon: input.timeHorizon,
    value_chain_location: input.valueChainLocation,
    stakeholders: input.stakeholders,
  });

  if (error) return { error: error.message };

  revalidatePath('/disclosure-hub/materiality');
  return { ok: true };
}

export async function deleteIro(id: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { error } = await supabase.from('iros').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/disclosure-hub/materiality');
  return { ok: true };
}
