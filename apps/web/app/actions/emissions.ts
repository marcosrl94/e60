'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type {
  DataQualityTier,
  EmissionFactor,
  Scope,
  Scope2Method,
} from '@e60/domain';
import { createClient } from '@/utils/supabase/server';

/**
 * Server-side mutations against `public.emission_entries` (RLS-scoped to
 * the signed-in user). Used by the Carbon Intelligence "New entry" form.
 *
 * The middleware already gates `(shell)/*`, so getUser() should always
 * resolve here. We still check defensively — if it doesn't, the INSERT
 * would 401 against the RLS policy `ee_insert_own` anyway.
 */

export interface CreateEmissionEntryInput {
  scope: Scope;
  scope2Method: Scope2Method | null;
  activityKey: string;
  activityLabel: string;
  category: string;
  factorSource: EmissionFactor['source'];
  efValue: number;
  efUnit: string;
  /** Already converted to the factor's denominator unit. */
  quantity: number;
  /** Raw input as typed by the user. */
  quantityInput: number;
  quantityInputUnit: string;
  conversionFactor: number;
  tco2e: number;
  dataQualityTier: DataQualityTier;
  notes: string | null;
  inventoryYear: number;
  /**
   * ESRS datapoint IDs this entry feeds. Computed on the client from
   * `derivedDisclosureBindings(scope, scope2Method)`; persisted as a
   * `text[]` column on `emission_entries` (C1 · CI ↔ Hub bridge).
   */
  disclosureBindings: string[];
}

type ActionResult<T = void> = { error: string } | { data: T };

export async function createEmissionEntry(
  input: CreateEmissionEntryInput,
): Promise<ActionResult<{ id: string }>> {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { data, error } = await supabase
    .from('emission_entries')
    .insert({
      user_id: user.id,
      inventory_year: input.inventoryYear,
      scope: input.scope,
      scope2_method: input.scope2Method,
      activity_key: input.activityKey,
      activity_label: input.activityLabel,
      category: input.category,
      factor_source: input.factorSource,
      ef_value: input.efValue,
      ef_unit: input.efUnit,
      quantity: input.quantity,
      quantity_input: input.quantityInput,
      quantity_input_unit: input.quantityInputUnit,
      conversion_factor: input.conversionFactor,
      tco2e: input.tco2e,
      data_quality_tier: input.dataQualityTier,
      notes: input.notes,
      disclosure_bindings: input.disclosureBindings,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  revalidatePath('/disclosure-hub/carbon-intelligence');
  return { data: { id: data.id } };
}

export async function deleteEmissionEntry(id: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { error } = await supabase
    .from('emission_entries')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/disclosure-hub/carbon-intelligence');
  return { data: undefined };
}
