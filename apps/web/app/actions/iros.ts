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
  /** Optional list of EFRAG datapoint ids this IRO feeds. */
  datapointIds: string[];
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

  const { data: created, error } = await supabase
    .from('iros')
    .insert({
      assessment_id: input.assessmentId,
      matter_id: input.matterId,
      type: input.type,
      description: input.description.trim(),
      time_horizon: input.timeHorizon,
      value_chain_location: input.valueChainLocation,
      stakeholders: input.stakeholders,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  // Wire the optional datapoint links. On failure, roll the IRO back
  // (ON DELETE CASCADE on the junction means the parent delete is
  // enough) so we don't leave an orphan IRO.
  if (input.datapointIds.length > 0) {
    const rows = input.datapointIds.map((dpId) => ({
      iro_id: created.id,
      datapoint_id: dpId,
    }));
    const { error: linkErr } = await supabase
      .from('iro_datapoints')
      .insert(rows);
    if (linkErr) {
      await supabase.from('iros').delete().eq('id', created.id);
      return { error: linkErr.message };
    }
  }

  revalidatePath('/disclosure-hub/materiality');
  revalidatePath('/disclosure-hub/repository');
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
  revalidatePath('/disclosure-hub/repository');
  return { ok: true };
}
