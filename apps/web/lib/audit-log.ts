/**
 * Cross-module audit log aggregator.
 *
 * Fetches recent activity from every user-owned table the platform has
 * today (emission_entries, org_materiality_overrides, materiality_scores,
 * iros, pillar_tbl_signoffs) and normalises it into a single
 * `AuditEvent` stream sorted newest-first.
 *
 * RLS scopes every read to auth.uid(), so an anonymous caller (or a
 * different user) gets an empty list. The Trust Center renders the
 * result as a timeline; the same shape can later feed an exportable
 * audit-trail JSON for KPMG/PwC.
 */

import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export type AuditEventModule =
  | 'carbon_intelligence'
  | 'materiality'
  | 'pillar_iii';

export type AuditEventKind =
  | 'emission_entry_created'
  | 'materiality_override_set'
  | 'matter_score_set'
  | 'iro_created'
  | 'tbl_signoff_set';

export interface AuditEvent {
  /** Stable id of the underlying row (uuid or composite-joined). */
  id: string;
  module: AuditEventModule;
  kind: AuditEventKind;
  /** ISO timestamp of the event. */
  at: string;
  /** Short one-line description shown in the timeline. */
  summary: string;
  /** Optional small context label rendered as a chip (topic, role, etc.). */
  context?: string;
}

export interface AuditLogResult {
  events: AuditEvent[];
  /** True when at least one table errored mid-fetch (we still return
   *  whatever the others produced). */
  partial: boolean;
}

const LIMIT_PER_TABLE = 25;

export async function fetchAuditLog(): Promise<AuditLogResult> {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { events: [], partial: false };

  const events: AuditEvent[] = [];
  let partial = false;

  // ── 1. Carbon Intelligence · emission_entries
  {
    const { data, error } = await supabase
      .from('emission_entries')
      .select('id, scope, activity_label, tco2e, created_at')
      .order('created_at', { ascending: false })
      .limit(LIMIT_PER_TABLE);
    if (error) partial = true;
    for (const r of data ?? []) {
      events.push({
        id: `ee-${r.id}`,
        module: 'carbon_intelligence',
        kind: 'emission_entry_created',
        at: r.created_at,
        summary: `Inventory entry · ${r.activity_label} · ${Number(r.tco2e).toFixed(2)} tCO₂e`,
        context: r.scope.toUpperCase(),
      });
    }
  }

  // ── 2. Materiality · org_materiality_overrides (sector pre-screen)
  {
    const { data, error } = await supabase
      .from('org_materiality_overrides')
      .select('sector_code, scope_category, materiality, set_at')
      .order('set_at', { ascending: false })
      .limit(LIMIT_PER_TABLE);
    if (error) partial = true;
    for (const r of data ?? []) {
      events.push({
        id: `omo-${r.sector_code}-${r.scope_category}-${r.set_at}`,
        module: 'materiality',
        kind: 'materiality_override_set',
        at: r.set_at,
        summary: `Sector pre-screen override · ${r.sector_code} × ${r.scope_category} → level ${r.materiality}`,
        context: r.sector_code,
      });
    }
  }

  // ── 3. Materiality · materiality_scores (DMA core)
  {
    const { data, error } = await supabase
      .from('materiality_scores')
      .select('assessment_id, matter_id, updated_at')
      .order('updated_at', { ascending: false })
      .limit(LIMIT_PER_TABLE);
    if (error) partial = true;
    for (const r of data ?? []) {
      events.push({
        id: `ms-${r.assessment_id}-${r.matter_id}-${r.updated_at}`,
        module: 'materiality',
        kind: 'matter_score_set',
        at: r.updated_at,
        summary: `DMA score updated · ${r.matter_id}`,
        context: r.matter_id.split('.')[0] ?? r.matter_id,
      });
    }
  }

  // ── 4. Materiality · iros (with their datapoint link count)
  {
    const { data, error } = await supabase
      .from('iros')
      .select('id, matter_id, type, description, created_at, iro_datapoints(datapoint_id)')
      .order('created_at', { ascending: false })
      .limit(LIMIT_PER_TABLE);
    if (error) partial = true;
    for (const r of data ?? []) {
      const links = (r.iro_datapoints ?? []) as Array<{ datapoint_id: string }>;
      const suffix =
        links.length > 0 ? ` · feeds ${links.length} DP${links.length > 1 ? 's' : ''}` : '';
      const trimmed =
        r.description.length > 70
          ? r.description.slice(0, 67) + '…'
          : r.description;
      events.push({
        id: `iro-${r.id}`,
        module: 'materiality',
        kind: 'iro_created',
        at: r.created_at,
        summary: `IRO added · ${trimmed}${suffix}`,
        context: r.matter_id.split('.')[0] ?? r.matter_id,
      });
    }
  }

  // ── 5. Pillar III · pillar_tbl_signoffs
  {
    const { data, error } = await supabase
      .from('pillar_tbl_signoffs')
      .select('tbl_num, role, decision, signed_at')
      .order('signed_at', { ascending: false })
      .limit(LIMIT_PER_TABLE);
    if (error) partial = true;
    for (const r of data ?? []) {
      events.push({
        id: `sign-${r.tbl_num}-${r.role}-${r.signed_at}`,
        module: 'pillar_iii',
        kind: 'tbl_signoff_set',
        at: r.signed_at,
        summary: `Pillar III TBL ${r.tbl_num} · ${r.role.toUpperCase()} → ${r.decision}`,
        context: `TBL ${r.tbl_num}`,
      });
    }
  }

  events.sort((a, b) => (a.at < b.at ? 1 : -1));
  return { events, partial };
}
