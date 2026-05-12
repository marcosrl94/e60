'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

/**
 * Mutations against public.pillar_tbl_signoffs. The three roles
 * (cro · cso · auditor) line up with the EBA-mandated approval chain
 * for Pillar III ESG submissions.
 */

export type SignoffRole = 'cro' | 'cso' | 'auditor';
export type SignoffDecision = 'signed' | 'pending' | 'na';

export interface UpsertSignoffInput {
  tblNum: number;
  role: SignoffRole;
  decision: SignoffDecision;
  notes?: string | null;
}

type ActionResult = { ok: true } | { error: string };

export async function upsertTblSignoff(
  input: UpsertSignoffInput,
): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { error } = await supabase.from('pillar_tbl_signoffs').upsert(
    {
      user_id: user.id,
      tbl_num: input.tblNum,
      role: input.role,
      decision: input.decision,
      notes: input.notes ?? null,
      signed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,tbl_num,role' },
  );
  if (error) return { error: error.message };

  revalidatePath('/disclosure-hub/pillar-iii');
  return { ok: true };
}

export async function clearTblSignoff(
  tblNum: number,
  role: SignoffRole,
): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { error } = await supabase
    .from('pillar_tbl_signoffs')
    .delete()
    .eq('tbl_num', tblNum)
    .eq('role', role);
  if (error) return { error: error.message };

  revalidatePath('/disclosure-hub/pillar-iii');
  return { ok: true };
}
