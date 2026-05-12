-- Hardening pass after the initial schema:
--
-- 1. Pin search_path on tg_set_updated_at so the trigger function can't be
--    hijacked by a schema-shadowing attack. The body only touches NEW + now()
--    so pg_catalog is sufficient.
--
-- 2. Add covering btree indexes for the three foreign keys flagged by the
--    Supabase performance advisor (unindexed FKs). User tables are empty
--    today; planting the index now avoids re-hot-patching under load later.

alter function public.tg_set_updated_at()
  set search_path = pg_catalog;

create index if not exists idx_ee_activity_key
  on public.emission_entries (activity_key);

create index if not exists idx_nace_parent
  on public.nace_sectors (parent_code);

create index if not exists idx_omo_sector
  on public.org_materiality_overrides (sector_code);
