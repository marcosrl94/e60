/**
 * Real connector state derived from `connector_syncs` for the current user.
 *
 * Latest sync (by started_at) decides the visible status; total rows
 * ingested is the sum of `rows_processed` across successful syncs.
 * Returned as a Map keyed by `connector_id` so the Data Layer view can
 * merge it into the seeded catalogue with a single lookup per card.
 */

import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import type { ConnectorStatus } from '@/components/hub/data-layer/connectors';

export interface ConnectorRealState {
  connectorId: string;
  status: ConnectorStatus;
  /** ISO timestamp of the most recent sync (finished_at, falling back to started_at). */
  lastSyncAt: string | null;
  /** Cumulative rows from successful syncs only. */
  recordsIngested: number;
}

export async function fetchConnectorRealStates(): Promise<
  Map<string, ConnectorRealState>
> {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Map();

  const { data, error } = await supabase
    .from('connector_syncs')
    .select('connector_id, status, started_at, finished_at, rows_processed')
    .order('started_at', { ascending: false });

  if (error || !data) return new Map();

  const result = new Map<string, ConnectorRealState>();
  for (const row of data) {
    const existing = result.get(row.connector_id);
    if (!existing) {
      result.set(row.connector_id, {
        connectorId: row.connector_id,
        status: mapStatus(row.status),
        lastSyncAt: row.finished_at ?? row.started_at,
        recordsIngested:
          row.status === 'success' ? Number(row.rows_processed ?? 0) : 0,
      });
    } else if (row.status === 'success') {
      existing.recordsIngested += Number(row.rows_processed ?? 0);
    }
  }
  return result;
}

function mapStatus(raw: string): ConnectorStatus {
  if (raw === 'success') return 'connected';
  if (raw === 'failed') return 'error';
  if (raw === 'running') return 'partial';
  return 'not_connected';
}
