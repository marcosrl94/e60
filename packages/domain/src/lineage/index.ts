/**
 * Lineage — provenance and history for a datapoint value.
 *
 * A first-class trace of where a number came from, who put it there,
 * and how it has evolved. Surfaced in the Disclosure Drawer Lineage
 * tab and consumed by the Trust Center for auditor export.
 *
 * Separate from the existing `DatapointSource` (which records engine /
 * connector / last sync) because lineage is auditor-grade: it adds the
 * user behind every change plus the rolling value history.
 */

import { z } from 'zod';

/**
 * Where a datapoint value originates.
 * - manual       — entered by a user through a form.
 * - computed     — derived in-platform from other datapoints (formula).
 * - carbon-intel — fed by a Carbon Intelligence inventory entry.
 * - data-layer   — pulled from a connector (Temenos, SAP, CSV upload…).
 * - external     — sourced from a third-party (ALQUID NZ embed, MSCI…).
 */
export const LineageSourceSchema = z.enum([
  'manual',
  'computed',
  'carbon-intel',
  'data-layer',
  'external',
]);

export type LineageSource = z.infer<typeof LineageSourceSchema>;

/**
 * Minimal user reference embedded in lineage events. Kept narrow so
 * lineage payloads stay small in transit; full user objects live in
 * the auth/identity layer.
 */
export const UserRefSchema = z.object({
  id: z.string(),
  /** Display name shown in the timeline (e.g. "Marcos R."). */
  name: z.string(),
  /** Email when known — used as the canonical identifier for audit. */
  email: z.string().email().optional(),
  /** Optional initials for avatar rendering. */
  initials: z.string().optional(),
});

export type UserRef = z.infer<typeof UserRefSchema>;

/**
 * A single value in the rolling history of a datapoint. `value` is
 * stored as a string so the same record can carry numeric, text,
 * monetary, or enum values without coercion at the wire layer.
 */
export const LineageValueHistoryEntrySchema = z.object({
  value: z.string(),
  at: z.string().datetime(),
  by: UserRefSchema,
  /** Optional one-line note ("backfill from MSCI", "auditor correction"…). */
  note: z.string().optional(),
});

export type LineageValueHistoryEntry = z.infer<typeof LineageValueHistoryEntrySchema>;

/**
 * Full lineage record attached to a datapoint.
 */
export const DatapointLineageSchema = z.object({
  source: LineageSourceSchema,
  /**
   * Free-form reference into the source system, e.g.
   *   carbon-intel:emission_entry/<uuid>
   *   data-layer:connector_syncs/<uuid>
   *   computed:formula/sum(E1-6_scope1, E1-6_scope2_mb, E1-6_scope3)
   * Stable enough for the UI to deep-link but human-readable.
   */
  sourceRef: z.string().optional(),
  lastUpdatedAt: z.string().datetime(),
  lastUpdatedBy: UserRefSchema,
  /** Rolling history newest-first. Length is implementation-defined; the
   *  Trust Center export keeps all rows, the drawer typically shows ~5. */
  valueHistory: z.array(LineageValueHistoryEntrySchema).default([]),
});

export type DatapointLineage = z.infer<typeof DatapointLineageSchema>;

/**
 * Workflow status — separate from the existing `DatapointStatus`
 * (which describes EFRAG IG3 readiness: live / partial / blocked /
 * pending / not_material / custom). This one tracks the human-driven
 * approval cycle.
 */
export const DatapointWorkflowStatusSchema = z.enum([
  'empty', // no value captured yet
  'draft', // value entered, not submitted for review
  'review', // submitted, awaiting approval
  'approved', // approved by approver, not locked
  'locked', // locked for the reporting period (post-board / post-audit)
]);

export type DatapointWorkflowStatus = z.infer<typeof DatapointWorkflowStatusSchema>;

/**
 * Reporting period a value applies to. `period` is one of:
 *   { kind: 'fiscal_year', year: 2025 }
 *   { kind: 'fiscal_quarter', year: 2025, quarter: 3 }
 *   { kind: 'range', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' }
 */
export const ReportingPeriodSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('fiscal_year'), year: z.number().int() }),
  z.object({
    kind: z.literal('fiscal_quarter'),
    year: z.number().int(),
    quarter: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  }),
  z.object({
    kind: z.literal('range'),
    startDate: z.string(),
    endDate: z.string(),
  }),
]);

export type ReportingPeriod = z.infer<typeof ReportingPeriodSchema>;

/**
 * Helper — format a `ReportingPeriod` as a short label for UI chips.
 */
export function formatReportingPeriod(p: ReportingPeriod): string {
  if (p.kind === 'fiscal_year') return `FY${p.year}`;
  if (p.kind === 'fiscal_quarter') return `Q${p.quarter} ${p.year}`;
  return `${p.startDate} → ${p.endDate}`;
}
