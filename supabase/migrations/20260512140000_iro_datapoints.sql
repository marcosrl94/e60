-- Cross-module wiring · DMA ↔ Repository
--
-- iro_datapoints is the junction table that lets an IRO declare which
-- ESRS datapoints it actually feeds when reported. This makes it
-- possible for the Repository view to filter to "datapoints supporting
-- material IROs", closing the loop:
--
--   Materiality → IROs → Datapoints → Disclosures
--
-- Composite primary key on (iro_id, datapoint_id) guarantees each
-- (IRO, DP) pair can only be linked once.
-- ON DELETE CASCADE on iro_id mirrors the IRO lifecycle; ON DELETE
-- RESTRICT on datapoint_id protects the catalogue.
-- RLS scopes every read/write through the IRO's parent assessment
-- (which is already RLS-scoped to auth.uid()) — we walk the same FK
-- chain in the policy EXISTS sub-query.

create table if not exists public.iro_datapoints (
  iro_id        uuid not null references public.iros(id) on delete cascade,
  datapoint_id  text not null references public.datapoints(id) on delete restrict,
  created_at    timestamptz not null default now(),
  primary key (iro_id, datapoint_id)
);

create index if not exists idx_iro_dp_iro on public.iro_datapoints(iro_id);
create index if not exists idx_iro_dp_dp  on public.iro_datapoints(datapoint_id);

alter table public.iro_datapoints enable row level security;

create policy "irodp_read_own" on public.iro_datapoints
  for select to authenticated using (
    exists (
      select 1
      from public.iros i
      join public.materiality_assessments a on a.id = i.assessment_id
      where i.id = iro_id and a.user_id = (select auth.uid())
    )
  );

create policy "irodp_write_own" on public.iro_datapoints
  for all to authenticated using (
    exists (
      select 1
      from public.iros i
      join public.materiality_assessments a on a.id = i.assessment_id
      where i.id = iro_id and a.user_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1
      from public.iros i
      join public.materiality_assessments a on a.id = i.assessment_id
      where i.id = iro_id and a.user_id = (select auth.uid())
    )
  );
