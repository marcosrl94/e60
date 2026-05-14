-- 7.6 · Audit primitive · cross-module event sink.
--
-- Hoy el Trust Center agrega audit en `apps/web/lib/audit-log.ts`
-- leyendo a la pasada 5+ tablas mutables. Funciona pero es frágil
-- (cada tabla nueva requiere editar el aggregator) y no captura
-- comments, exports ni acciones no-mutables. Esta tabla es el sink
-- central donde todas las acciones future van a parar; el aggregator
-- legacy convive en paralelo hasta que cada write-path enchufe a
-- `recordAuditEvent()` (refactor incremental).
--
-- Append-only por RLS: insert/select scoped a `user_id`, update y
-- delete no expuestos a `authenticated`. Cuando 7.4 multi-tenant
-- aterrice, `tenant_id` pasará a not-null y la policy ampliará a
-- entity-membership scope.

create table if not exists public.audit_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  tenant_id   uuid,
  module      text not null check (module in (
    'disclosure_hub',
    'carbon_intelligence',
    'materiality',
    'pillar_iii',
    'data_layer',
    'trust_center'
  )),
  entity      text not null,
  entity_id   text not null,
  action      text not null check (action in (
    'create',
    'update',
    'delete',
    'approve',
    'reject',
    'lock',
    'unlock',
    'comment',
    'sync',
    'export'
  )),
  before      jsonb,
  after       jsonb,
  at          timestamptz not null default now(),
  ip          text,
  user_agent  text
);

create index if not exists idx_ae_user_at on public.audit_events(user_id, at desc);
create index if not exists idx_ae_entity  on public.audit_events(module, entity, entity_id);

alter table public.audit_events enable row level security;

create policy "ae_read_own" on public.audit_events
  for select to authenticated using (user_id = (select auth.uid()));
create policy "ae_insert_own" on public.audit_events
  for insert to authenticated with check (user_id = (select auth.uid()));
-- Intencionalmente sin update / delete policies para forzar append-only.
