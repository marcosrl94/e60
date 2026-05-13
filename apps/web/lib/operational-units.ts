/**
 * Operational scope helpers.
 *
 * The reporting entity (root) + its subtree back the consolidated
 * non-financial statement. Phase 1: each user owns their own tree.
 * `ensureUserOrgTree()` is idempotent — on the first call for a fresh
 * user it bootstraps a Pilot Bank Iberia demo tree (root + 3 subs +
 * 4 facilities) and grants the user admin at the root + contributor
 * at every descendant; on subsequent calls it just returns the units.
 *
 * Callers must run server-side (uses cookies()).
 */

import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import type {
  OperationalUnit,
  OperationalUnitKind,
} from './operational-units-shared';

export type { OperationalUnit, OperationalUnitKind } from './operational-units-shared';
export { flattenTreeForSelect } from './operational-units-shared';

export async function ensureUserOrgTree(): Promise<OperationalUnit[]> {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: memberships } = await supabase
    .from('user_org_memberships')
    .select('unit_id')
    .limit(1);

  if (!memberships || memberships.length === 0) {
    await bootstrapDemoTree(supabase, user.id);
  }
  return fetchUnits(supabase);
}

async function fetchUnits(
  supabase: SupabaseClient,
): Promise<OperationalUnit[]> {
  const { data, error } = await supabase
    .from('operational_units')
    .select('id, parent_id, kind, name, short_code, country')
    .order('kind')
    .order('name');
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id as string,
    parentId: (r.parent_id as string | null) ?? null,
    kind: r.kind as OperationalUnitKind,
    name: r.name as string,
    shortCode: (r.short_code as string | null) ?? null,
    country: (r.country as string | null) ?? null,
  }));
}

async function bootstrapDemoTree(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  // Root
  const { data: root, error: rootErr } = await supabase
    .from('operational_units')
    .insert({
      parent_id: null,
      kind: 'reporting_entity',
      name: 'Pilot Bank Iberia',
      short_code: 'PB',
      country: 'ES',
      created_by: userId,
    })
    .select('id')
    .single();
  if (rootErr || !root) return;

  // Subsidiaries + business line under root
  const { data: subs, error: subsErr } = await supabase
    .from('operational_units')
    .insert([
      {
        parent_id: root.id,
        kind: 'subsidiary',
        name: 'PB Spain',
        short_code: 'PB-ES',
        country: 'ES',
        created_by: userId,
      },
      {
        parent_id: root.id,
        kind: 'subsidiary',
        name: 'PB Portugal',
        short_code: 'PB-PT',
        country: 'PT',
        created_by: userId,
      },
      {
        parent_id: root.id,
        kind: 'business_line',
        name: 'PB Markets',
        short_code: 'PB-MK',
        created_by: userId,
      },
    ])
    .select('id, name');
  if (subsErr || !subs) return;

  const byName = new Map(subs.map((s) => [s.name as string, s.id as string]));

  // Facilities under each subsidiary / business line
  const facilities = [
    {
      parent_id: byName.get('PB Spain'),
      kind: 'facility',
      name: 'Madrid HQ',
      short_code: 'MAD-HQ',
      country: 'ES',
    },
    {
      parent_id: byName.get('PB Spain'),
      kind: 'facility',
      name: 'Barcelona Office',
      short_code: 'BCN',
      country: 'ES',
    },
    {
      parent_id: byName.get('PB Portugal'),
      kind: 'facility',
      name: 'Lisbon Office',
      short_code: 'LIS',
      country: 'PT',
    },
    {
      parent_id: byName.get('PB Markets'),
      kind: 'facility',
      name: 'Frankfurt Data Center',
      short_code: 'FRA-DC',
      country: 'DE',
    },
  ].map((f) => ({ ...f, created_by: userId }));

  const { data: facs, error: facsErr } = await supabase
    .from('operational_units')
    .insert(facilities)
    .select('id');
  if (facsErr || !facs) return;

  // Grant memberships: admin at root, contributor everywhere else
  const memberships = [
    { user_id: userId, unit_id: root.id, role: 'admin' as const },
    ...subs.map((s) => ({
      user_id: userId,
      unit_id: s.id as string,
      role: 'contributor' as const,
    })),
    ...facs.map((f) => ({
      user_id: userId,
      unit_id: f.id as string,
      role: 'contributor' as const,
    })),
  ];
  await supabase.from('user_org_memberships').insert(memberships);
}

