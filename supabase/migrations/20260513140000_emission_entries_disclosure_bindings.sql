-- C1 · Bridge Carbon Intelligence ↔ Disclosure Hub.
--
-- Each `emission_entries` row now declares which ESRS datapoints it
-- feeds. The default mapping is derived from scope + scope2 method
-- (see `derivedDisclosureBindings()` in `@e60/domain`), but users will
-- be able to override / extend the list per entry later. Storing as
-- text[] keeps it tight; FK to `datapoints.id` would prevent demo
-- entries from referencing seeded ids that aren't in the table yet.
alter table public.emission_entries
  add column if not exists disclosure_bindings text[] not null default '{}';

create index if not exists idx_ee_disclosure_bindings
  on public.emission_entries using gin (disclosure_bindings);
