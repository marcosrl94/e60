-- ========================================================================
-- E6.0 · initial schema (project nodhlwslrxuekmhluldr)
-- ========================================================================
-- 5 catalogue tables (read-only reference data, world-readable to
-- authenticated users) + 2 mutation tables (user-writable, RLS by auth.uid()).
--
-- Conventions:
--   · camelCase columns inside JSON payloads, snake_case at the DB layer.
--     The frontend hooks already accept either shape via mapping, but we
--     prefer snake_case here for Postgres ergonomics.
--   · Every table has updated_at + a trigger that bumps it on update.
--   · RLS enabled on every table from the start, even catalogues — explicit
--     beats permissive default.

-- ── Helpers ────────────────────────────────────────────────────────────────

create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 1. emission_factors (catalogue) ────────────────────────────────────────

create table if not exists public.emission_factors (
  activity_key      text primary key,
  scope             text not null check (scope in ('s1','s2','s3')),
  category          text not null,
  subcategory       text,
  activity_label    text not null,
  unit              text not null default 'kgCO2e',
  ef_value          numeric not null check (ef_value >= 0),
  ef_unit           text not null,
  source            text not null check (source in ('MITECO','IDAE','DEFRA')),
  source_version    text,
  year              int  not null check (year between 1990 and 2100),
  region            text not null,
  citation_url      text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_ef_scope  on public.emission_factors(scope);
create index if not exists idx_ef_source on public.emission_factors(source);

create trigger trg_ef_updated_at
  before update on public.emission_factors
  for each row execute function public.tg_set_updated_at();

alter table public.emission_factors enable row level security;

create policy "ef_read_authenticated" on public.emission_factors
  for select to authenticated using (true);

-- Anonymous read also allowed so the static frontend can hydrate without
-- forcing a sign-in flow during the demo. Lock down later.
create policy "ef_read_anon" on public.emission_factors
  for select to anon using (true);

-- ── 2. datapoints (catalogue) ─────────────────────────────────────────────

create table if not exists public.datapoints (
  id                 text primary key,                     -- EFRAG IG3 id (e.g. E1-6_01)
  efrag_id           text,
  name               text not null,
  definition         text,
  topic              text not null check (topic in ('E1','E2','E3','E4','E5','S1','S2','S3','S4','G1','GENERAL')),
  esrs_disclosure    text,
  paragraph          text,
  related_ar         text,
  type               text not null check (type in ('numeric','percentage','monetary','text','boolean','date','enum')),
  unit               text,
  status             text not null default 'pending' check (status in ('live','partial','blocked','pending','not_material','custom')),
  mappings           jsonb not null default '[]'::jsonb,
  crosswalk          text[] not null default '{}',
  phase_in_years     int   check (phase_in_years in (1,2,3)),
  conditional        boolean not null default false,
  may_disclose       boolean not null default false,
  voluntary          boolean not null default false,
  latest_value       text,
  numeric_value      numeric,
  owner              text,
  is_custom          boolean not null default false,
  tags               text[] not null default '{}',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_dp_topic   on public.datapoints(topic);
create index if not exists idx_dp_status  on public.datapoints(status);
create index if not exists idx_dp_search  on public.datapoints using gin (to_tsvector('simple', name));

create trigger trg_dp_updated_at
  before update on public.datapoints
  for each row execute function public.tg_set_updated_at();

alter table public.datapoints enable row level security;
create policy "dp_read_authenticated" on public.datapoints for select to authenticated using (true);
create policy "dp_read_anon" on public.datapoints for select to anon using (true);

-- ── 3. nace_sectors (catalogue) ───────────────────────────────────────────

create table if not exists public.nace_sectors (
  code         text primary key,
  level        text not null check (level in ('section','division')),
  parent_code  text references public.nace_sectors(code) on delete restrict,
  label_es     text not null,
  label_en     text not null,
  created_at   timestamptz not null default now()
);

alter table public.nace_sectors enable row level security;
create policy "nace_read_authenticated" on public.nace_sectors for select to authenticated using (true);
create policy "nace_read_anon" on public.nace_sectors for select to anon using (true);

-- ── 4. industry_materiality (catalogue) ───────────────────────────────────

create table if not exists public.industry_materiality (
  id                uuid primary key default gen_random_uuid(),
  sector_code       text not null references public.nace_sectors(code) on delete cascade,
  scope_category    text not null,
  materiality       smallint not null check (materiality between 0 and 3),
  source_framework  text not null check (source_framework in ('EFRAG_ESRS','SASB','GHG_Protocol','NFQ_internal')),
  notes             text,
  created_at        timestamptz not null default now(),
  unique (sector_code, scope_category, source_framework)
);

create index if not exists idx_im_sector on public.industry_materiality(sector_code);

alter table public.industry_materiality enable row level security;
create policy "im_read_authenticated" on public.industry_materiality for select to authenticated using (true);
create policy "im_read_anon" on public.industry_materiality for select to anon using (true);

-- ── 5. pillar_tbls (catalogue) ────────────────────────────────────────────

create table if not exists public.pillar_tbls (
  num                   smallint primary key check (num between 1 and 10),
  code                  text not null,
  title                 text not null,
  summary               text,
  family                text not null check (family in ('transition','physical','taxonomy','mitigation')),
  status                text not null check (status in ('live','in_prep','methodology_gap','scheduled')),
  datapoint_count       int,
  row_count             int,
  narrative             text not null,
  feeding_datapoint_ids text[] not null default '{}',
  signoff               jsonb not null default '{"cro":"pending","cso":"pending","auditor":"pending"}'::jsonb,
  deadline              text not null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger trg_tbls_updated_at
  before update on public.pillar_tbls
  for each row execute function public.tg_set_updated_at();

alter table public.pillar_tbls enable row level security;
create policy "tbls_read_authenticated" on public.pillar_tbls for select to authenticated using (true);
create policy "tbls_read_anon" on public.pillar_tbls for select to anon using (true);

-- ── 6. emission_entries (user-writable inventory) ─────────────────────────

create table if not exists public.emission_entries (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  inventory_year       int  not null,
  scope                text not null check (scope in ('s1','s2','s3')),
  scope2_method        text check (scope2_method in ('location_based','market_based')),
  activity_key         text not null references public.emission_factors(activity_key) on delete restrict,
  activity_label       text not null,
  category             text not null,
  factor_source        text not null check (factor_source in ('MITECO','IDAE','DEFRA')),
  ef_value             numeric not null,
  ef_unit              text not null,
  quantity             numeric not null check (quantity >= 0),
  quantity_input       numeric not null,
  quantity_input_unit  text not null,
  conversion_factor    numeric not null default 1 check (conversion_factor > 0),
  tco2e                numeric not null check (tco2e >= 0),
  data_quality_tier    smallint not null default 2 check (data_quality_tier in (1,2,3)),
  notes                text,
  created_at           timestamptz not null default now(),
  -- Enforce s2 ⇔ method consistency.
  constraint s2_method_consistency check (
    (scope = 's2' and scope2_method is not null) or
    (scope != 's2' and scope2_method is null)
  )
);

create index if not exists idx_ee_user_year on public.emission_entries(user_id, inventory_year);
create index if not exists idx_ee_scope     on public.emission_entries(scope);

alter table public.emission_entries enable row level security;

create policy "ee_read_own" on public.emission_entries
  for select to authenticated using (user_id = (select auth.uid()));
create policy "ee_insert_own" on public.emission_entries
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "ee_update_own" on public.emission_entries
  for update to authenticated using (user_id = (select auth.uid()));
create policy "ee_delete_own" on public.emission_entries
  for delete to authenticated using (user_id = (select auth.uid()));

-- ── 7. org_materiality_overrides (user-writable, sector × category) ───────

create table if not exists public.org_materiality_overrides (
  user_id          uuid not null references auth.users(id) on delete cascade,
  sector_code      text not null references public.nace_sectors(code) on delete cascade,
  scope_category   text not null,
  materiality      smallint not null check (materiality between 0 and 3),
  justification    text not null check (char_length(justification) >= 10),
  set_at           timestamptz not null default now(),
  primary key (user_id, sector_code, scope_category)
);

create index if not exists idx_omo_user on public.org_materiality_overrides(user_id);

alter table public.org_materiality_overrides enable row level security;

create policy "omo_read_own" on public.org_materiality_overrides
  for select to authenticated using (user_id = (select auth.uid()));
create policy "omo_upsert_own" on public.org_materiality_overrides
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "omo_update_own" on public.org_materiality_overrides
  for update to authenticated using (user_id = (select auth.uid()));
create policy "omo_delete_own" on public.org_materiality_overrides
  for delete to authenticated using (user_id = (select auth.uid()));
