/**
 * Audit primitive · transversal event sink.
 *
 * Tipo first-class de un evento de auditoría que cualquier módulo
 * emite cuando muta estado o ejecuta una acción relevante. Replica el
 * shape de la tabla Supabase `audit_events` (migration
 * `20260514120000_audit_events.sql`) para que la frontera cliente ↔
 * BD sea un Zod parse en lugar de un `as` cast.
 *
 * Phase 7.6 baseline · §18.8 audit. La cobertura inicial (CI entries,
 * materiality overrides, drawer comments) entra en commits siguientes
 * cuando cada write-path se refactore para llamar `recordAuditEvent`.
 */

import { z } from 'zod';

export const AuditModuleSchema = z.enum([
  'disclosure_hub',
  'carbon_intelligence',
  'materiality',
  'pillar_iii',
  'data_layer',
  'trust_center',
]);
export type AuditModule = z.infer<typeof AuditModuleSchema>;

export const AuditActionSchema = z.enum([
  'create',
  'update',
  'delete',
  'approve',
  'reject',
  'lock',
  'unlock',
  'comment',
  'sync',
  'export',
]);
export type AuditAction = z.infer<typeof AuditActionSchema>;

export const AuditEventSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  /** Tenant scoping arrives in 7.4. Null hasta entonces. */
  tenantId: z.string().uuid().nullable(),
  module: AuditModuleSchema,
  /** Logical entity name: 'emission_entry', 'datapoint', 'iro', etc. */
  entity: z.string(),
  /** Id of the row affected. Stored as text porque algunos entities
   *  (datapoints) usan ids no-uuid (EFRAG codes). */
  entityId: z.string(),
  action: AuditActionSchema,
  /** Snapshot del estado antes del cambio. Null para `create`. */
  before: z.unknown().nullable(),
  /** Snapshot del estado después del cambio. Null para `delete`. */
  after: z.unknown().nullable(),
  at: z.string().datetime(),
  ip: z.string().nullable(),
  userAgent: z.string().nullable(),
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;

/**
 * Shape mínimo del payload que un caller emite — el server completa
 * `id`, `userId`, `at`, `ip`, `userAgent` automáticamente.
 */
export interface AuditEventInput {
  module: AuditModule;
  entity: string;
  entityId: string;
  action: AuditAction;
  before?: unknown;
  after?: unknown;
}
