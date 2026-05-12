-- Per-user sign-off records for the 10 EBA Pillar III ESG ITS templates.
--
-- The `pillar_tbls` catalogue ships demo signoff state in its jsonb
-- `signoff` column so the gallery looks rich on first visit. This new
-- table layers the user's actual decisions on top — each (user_id ×
-- tbl_num × role) is the unit of approval. The reading view merges:
-- user signoff overrides the catalogue default when present.
--
-- RLS scopes everything to auth.uid(); ON DELETE CASCADE on tbl_num
-- means a future TBL drop cleans up history transparently.

create table if not exists public.pillar_tbl_signoffs (
  user_id    uuid not null references auth.users(id) on delete cascade,
  tbl_num    int  not null references public.pillar_tbls(num) on delete cascade,
  role       text not null check (role in ('cro','cso','auditor')),
  decision   text not null check (decision in ('signed','pending','na')),
  notes      text,
  signed_at  timestamptz not null default now(),
  primary key (user_id, tbl_num, role)
);

create index if not exists idx_ptso_user
  on public.pillar_tbl_signoffs(user_id);
create index if not exists idx_ptso_user_tbl
  on public.pillar_tbl_signoffs(user_id, tbl_num);

alter table public.pillar_tbl_signoffs enable row level security;

create policy "ptso_read_own" on public.pillar_tbl_signoffs
  for select to authenticated using (user_id = (select auth.uid()));
create policy "ptso_insert_own" on public.pillar_tbl_signoffs
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "ptso_update_own" on public.pillar_tbl_signoffs
  for update to authenticated using (user_id = (select auth.uid()));
create policy "ptso_delete_own" on public.pillar_tbl_signoffs
  for delete to authenticated using (user_id = (select auth.uid()));
