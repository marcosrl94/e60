'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type {
  IndustryMaterialityLevel,
  ScopeCategory,
} from '@e60/domain';
import { createClient } from '@/utils/supabase/server';

/**
 * Server-side mutations against `public.org_materiality_overrides`
 * (RLS-scoped to the signed-in user, composite PK on
 * user_id × sector_code × scope_category). Used by the materiality
 * Override modal.
 *
 * The DB enforces a 10-char minimum on `justification` via a CHECK
 * constraint; we mirror that here so the error surfaces before the
 * roundtrip when the form is partial.
 */

type ActionResult = { error: string } | { ok: true };

export interface UpsertOverrideInput {
  sectorCode: string;
  scopeCategory: ScopeCategory;
  materiality: IndustryMaterialityLevel;
  justification: string;
}

export async function upsertMaterialityOverride(
  input: UpsertOverrideInput,
): Promise<ActionResult> {
  if (input.justification.trim().length < 10) {
    return { error: 'Justification must be at least 10 characters.' };
  }

  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { error } = await supabase.from('org_materiality_overrides').upsert(
    {
      user_id: user.id,
      sector_code: input.sectorCode,
      scope_category: input.scopeCategory,
      materiality: input.materiality,
      justification: input.justification.trim(),
    },
    { onConflict: 'user_id,sector_code,scope_category' },
  );

  if (error) return { error: error.message };

  revalidatePath('/disclosure-hub/materiality');
  return { ok: true };
}

export async function deleteMaterialityOverride(
  sectorCode: string,
  scopeCategory: ScopeCategory,
): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { error } = await supabase
    .from('org_materiality_overrides')
    .delete()
    .eq('sector_code', sectorCode)
    .eq('scope_category', scopeCategory);

  if (error) return { error: error.message };

  revalidatePath('/disclosure-hub/materiality');
  return { ok: true };
}
