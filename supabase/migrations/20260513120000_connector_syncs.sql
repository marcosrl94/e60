-- Data Layer · connector ingestion plumbing.
--
-- One real connector ships first: "Portfolio CSV upload". The other 17
-- entries in apps/web/components/hub/data-layer/connectors.ts remain
-- decorative demo data until their integrations land — but they can all
-- write to the same `connector_syncs` table once they do.
--
-- Tables:
--   · connector_syncs     — per-user audit trail of every ingestion run.
--   · portfolio_exposures — PCAF-minimal exposure rows, with provenance
--                           (FK to connector_syncs) so dropping a sync
--                           cleans up its rows transparently.
--
-- Storage:
--   · connector_uploads bucket holds the raw CSVs; objects are pathed
--     under `{auth.uid()}/...` and RLS keeps each user inside their own
--     folder.
--
-- RLS:
--   · Everything is scoped to auth.uid() — same pattern as
--     emission_entries / pillar_tbl_signoffs.

-- ── connector_syncs ────────────────────────────────────────────────────

create table if not exists public.connector_syncs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  connector_id    text not null,
  started_at      timestamptz not null default now(),
  finished_at     timestamptz,
  status          text not null check (status in ('running','success','failed')),
  rows_processed  bigint not null default 0,
  error           text,
  source_filename text,
  storage_path    text
);

create index if not exists idx_cs_user_connector
  on public.connector_syncs(user_id, connector_id, finished_at desc nulls last);

alter table public.connector_syncs enable row level security;

create policy "cs_read_own" on public.connector_syncs
  for select to authenticated using (user_id = (select auth.uid()));
create policy "cs_insert_own" on public.connector_syncs
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "cs_update_own" on public.connector_syncs
  for update to authenticated using (user_id = (select auth.uid()));
create policy "cs_delete_own" on public.connector_syncs
  for delete to authenticated using (user_id = (select auth.uid()));

-- ── portfolio_exposures (PCAF-min) ─────────────────────────────────────

create table if not exists public.portfolio_exposures (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  connector_sync_id uuid not null references public.connector_syncs(id) on delete cascade,
  counterparty_name text not null,
  counterparty_id   text,
  nace_code         text,
  nace_label        text,
  ead_eur           numeric,
  outstanding_eur   numeric,
  region            text,
  as_of_date        date,
  created_at        timestamptz not null default now()
);

create index if not exists idx_pe_user_date
  on public.portfolio_exposures(user_id, as_of_date desc);
create index if not exists idx_pe_sync
  on public.portfolio_exposures(connector_sync_id);
create index if not exists idx_pe_nace
  on public.portfolio_exposures(nace_code) where nace_code is not null;

alter table public.portfolio_exposures enable row level security;

create policy "pe_read_own" on public.portfolio_exposures
  for select to authenticated using (user_id = (select auth.uid()));
create policy "pe_insert_own" on public.portfolio_exposures
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "pe_delete_own" on public.portfolio_exposures
  for delete to authenticated using (user_id = (select auth.uid()));

-- ── Storage bucket + RLS ───────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('connector_uploads', 'connector_uploads', false)
on conflict (id) do nothing;

create policy "cup_read_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'connector_uploads'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "cup_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'connector_uploads'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "cup_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'connector_uploads'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
