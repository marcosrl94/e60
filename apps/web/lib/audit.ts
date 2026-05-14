/**
 * Audit event sink helper · 7.6 baseline.
 *
 * `recordAuditEvent()` se invoca desde server actions y server
 * components después de cualquier mutación que el Trust Center deba
 * exhibir. RLS en `audit_events` filtra por `user_id` por ahora;
 * cuando 7.4 multi-tenant entre, el helper también poblará
 * `tenant_id` desde el contexto resuelto del request.
 *
 * Diseño:
 *   · No-throw: cualquier fallo de insert se loguea con pino + se
 *     reporta a Sentry breadcrumb pero no rompe el flujo del caller.
 *     Una mutation que tuvo éxito en negocio no debe revertirse
 *     porque audit falló — esa decisión la toma el Trust Center
 *     cuando reconcilie.
 *   · IP y User-Agent capturados desde `headers()` si están
 *     disponibles; no se requieren para que el insert pase.
 *
 * Caller pattern:
 *
 *     await recordAuditEvent({
 *       module: 'carbon_intelligence',
 *       entity: 'emission_entry',
 *       entityId: row.id,
 *       action: 'create',
 *       after: { scope, activityKey, tco2e },
 *     });
 */

import { cookies, headers } from 'next/headers';
import type { AuditEventInput } from '@e60/domain';
import { createClient } from '@/utils/supabase/server';
import { logger } from './logger';

export async function recordAuditEvent(
  input: AuditEventInput,
): Promise<void> {
  try {
    const supabase = createClient(await cookies());
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      logger.debug(
        { module: input.module, action: input.action },
        'audit_event_skipped_unauthenticated',
      );
      return;
    }
    const hdrs = await headers();
    const ip =
      hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      hdrs.get('x-real-ip') ??
      null;
    const userAgent = hdrs.get('user-agent') ?? null;

    const { error } = await supabase.from('audit_events').insert({
      user_id: user.id,
      module: input.module,
      entity: input.entity,
      entity_id: input.entityId,
      action: input.action,
      before: input.before ?? null,
      after: input.after ?? null,
      ip,
      user_agent: userAgent,
    });
    if (error) {
      logger.warn(
        {
          err: error.message,
          module: input.module,
          entity: input.entity,
          action: input.action,
        },
        'audit_event_insert_failed',
      );
      return;
    }
    logger.debug(
      {
        module: input.module,
        entity: input.entity,
        action: input.action,
        entityId: input.entityId,
      },
      'audit_event_recorded',
    );
  } catch (err) {
    logger.warn(
      {
        err: err instanceof Error ? err.message : String(err),
        module: input.module,
        action: input.action,
      },
      'audit_event_threw',
    );
  }
}
