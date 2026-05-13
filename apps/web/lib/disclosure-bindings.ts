/**
 * Server-side aggregator: how many of the user's CI entries feed each
 * ESRS datapoint?
 *
 * Returns a Record keyed by datapoint id (`E1-6_07` etc.) with the
 * count of `emission_entries` rows whose `disclosure_bindings` array
 * contains that id. Used by the Datapoint Repository drawer to render
 * the "Powered by N Carbon Intelligence entries → …" trail (C2 ·
 * Track C of the scalability sprint).
 *
 * Aggregation is done in-process rather than via a PostgreSQL GROUP BY
 * + unnest RPC because the per-user row count is small in this phase;
 * an RPC swap is a one-line change here when scale demands it.
 */

import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export type BindingCounts = Record<string, number>;

export async function fetchBindingCountsForUser(): Promise<BindingCounts> {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};
  const { data, error } = await supabase
    .from('emission_entries')
    .select('disclosure_bindings');
  if (error || !data) return {};
  const counts: BindingCounts = {};
  for (const row of data) {
    const bindings = (row.disclosure_bindings ?? []) as string[];
    for (const id of bindings) {
      counts[id] = (counts[id] ?? 0) + 1;
    }
  }
  return counts;
}
