import type { Datapoint } from '@e60/domain';
import { DISCLOSURE_DATAPOINTS } from './disclosure-datapoint-mapping';

/**
 * Per-disclosure live metrics, computed from the curated
 * disclosure-datapoint mapping + the (demo-overlay) datapoint statuses.
 *
 * Used by `OutputsView` (server-side) to feed each `DisclosureCard`
 * with real numbers instead of the previously hand-typed copy.
 */
export interface DisclosureMetrics {
  /** Datapoints the curated mapping declares for this disclosure. */
  total: number;
  /** ...of which status === 'live'. */
  live: number;
  /** ...of which status === 'partial'. */
  partial: number;
  /** ...of which status === 'pending'. */
  pending: number;
  /** ...of which status === 'blocked' — i.e. blockers to closing it out. */
  blocked: number;
  /** Percentage live (rounded). 0 when total = 0. */
  coveragePct: number;
  /** Days from today (UTC, midnight) to the deadlineIso. Negative = overdue. */
  daysToDeadline: number;
}

function pct(num: number, denom: number): number {
  if (denom <= 0) return 0;
  return Math.round((num / denom) * 100);
}

function daysFromTodayUtc(targetIso: string): number {
  const target = new Date(targetIso + 'T00:00:00Z').getTime();
  const now = new Date();
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return Math.round((target - todayUtc) / (1000 * 60 * 60 * 24));
}

export function computeDisclosureMetrics(
  disclosureId: string,
  deadlineIso: string,
  datapoints: Datapoint[],
): DisclosureMetrics {
  const codes = DISCLOSURE_DATAPOINTS[disclosureId] ?? [];
  const byId = new Map(datapoints.map((d) => [d.id, d]));
  let live = 0;
  let partial = 0;
  let pending = 0;
  let blocked = 0;
  let total = 0;
  for (const c of codes) {
    const dp = byId.get(c);
    if (!dp) continue;
    total++;
    if (dp.status === 'live') live++;
    else if (dp.status === 'partial') partial++;
    else if (dp.status === 'pending') pending++;
    else if (dp.status === 'blocked') blocked++;
  }
  return {
    total,
    live,
    partial,
    pending,
    blocked,
    coveragePct: pct(live, total),
    daysToDeadline: daysFromTodayUtc(deadlineIso),
  };
}
