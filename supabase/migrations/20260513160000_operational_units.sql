-- D · Operational scope model.
--
-- The reporting entity (root) and its subtree (subsidiaries, business
-- lines, facilities, country aggregates) form the consolidation
-- perimeter that backs the non-financial statement, topic-by-topic.
-- This migration introduces:
--   · operational_units  — the tree.
--   · user_org_memberships — user × unit × role.
--   · emission_entries.operational_unit_id — attribution FK (nullable
--     during the rollout; the app starts always-setting it via D2).
--
-- Multi-tenant scoping is deferred: each user owns their own tree
-- (`created_by = auth.uid()`) and reads only their own units. When
-- the platform moves to proper multi-tenant (one tree per banking
-- group), RLS gets rewritten to walk the membership tree.

-- ── operational_units ──────────────────────────────────────────────────

create table if not exists public.operational_units (
  id           uuid primary key default gen_random_uuid(),
  parent_id    uuid references public.operational_units(id) on delete restrict,
  kind         text not null check (kind in (
    'reporting_entity',
    'subsidiary',
    'business_line',
    'facility',
    'country_aggregate'
  )),
  name         text not null,
  short_code   text,
  country      text,
  active       boolean not null default true,
  created_by   uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- A root reporting entity has no parent; every other kind must.
  constraint ou_root_no_parent check (
    (kind = 'reporting_entity' and parent_id is null) or
    (kind != 'reporting_entity' and parent_id is not null)
  )
);

create index if not exists idx_ou_owner  on public.operational_units(created_by);
create index if not exists idx_ou_parent on public.operational_units(parent_id);

create trigger trg_ou_updated_at
  before update on public.operational_units
  for each row execute function public.tg_set_updated_at();

alter table public.operational_units enable row level security;

create policy "ou_read_own" on public.operational_units
  for select to authenticated using (created_by = (select auth.uid()));
create policy "ou_insert_own" on public.operational_units
  for insert to authenticated with check (created_by = (select auth.uid()));
create policy "ou_update_own" on public.operational_units
  for update to authenticated using (created_by = (select auth.uid()));
create policy "ou_delete_own" on public.operational_units
  for delete to authenticated using (created_by = (select auth.uid()));

-- ── user_org_memberships ───────────────────────────────────────────────

create table if not exists public.user_org_memberships (
  user_id    uuid not null references auth.users(id) on delete cascade,
  unit_id    uuid not null references public.operational_units(id) on delete cascade,
  role       text not null default 'contributor'
              check (role in ('admin','contributor','viewer','auditor')),
  granted_at timestamptz not null default now(),
  primary key (user_id, unit_id)
);

create index if not exists idx_uom_user on public.user_org_memberships(user_id);
create index if not exists idx_uom_unit on public.user_org_memberships(unit_id);

alter table public.user_org_memberships enable row level security;

create policy "uom_read_own" on public.user_org_memberships
  for select to authenticated using (user_id = (select auth.uid()));
create policy "uom_insert_own" on public.user_org_memberships
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "uom_update_own" on public.user_org_memberships
  for update to authenticated using (user_id = (select auth.uid()));
create policy "uom_delete_own" on public.user_org_memberships
  for delete to authenticated using (user_id = (select auth.uid()));

-- ── emission_entries attribution ───────────────────────────────────────

alter table public.emission_entries
  add column if not exists operational_unit_id uuid
    references public.operational_units(id) on delete set null;

create index if not exists idx_ee_operational_unit
  on public.emission_entries(operational_unit_id);
