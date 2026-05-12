-- Double Materiality Assessment schema · per EFRAG ESRS 1.
--
-- Adds four tables behind the existing initial_schema:
--
--   sustainability_matters    · catalogue, 32 rows (read-only, anon SELECT)
--   materiality_assessments   · per user × period container
--   materiality_scores        · per assessment × matter, 6 dimensions
--   iros                      · per assessment × matter, free-form list
--
-- Every user-owned table is RLS-scoped to auth.uid(). Score and IRO rows
-- inherit ownership through the materiality_assessments parent — checked
-- via an EXISTS subquery in the policy so deleting the parent cascades.

-- ── 8. sustainability_matters (ESRS 1 AR16 catalogue) ─────────────

create table if not exists public.sustainability_matters (
  id           text primary key,
  topic        text not null check (topic in ('E1','E2','E3','E4','E5','S1','S2','S3','S4','G1')),
  category     text not null check (category in ('env','soc','gov')),
  label        text not null,
  description  text,
  sort_order   int not null default 0
);

alter table public.sustainability_matters enable row level security;

create policy "sm_read_anon" on public.sustainability_matters
  for select to anon using (true);
create policy "sm_read_auth" on public.sustainability_matters
  for select to authenticated using (true);

-- ── 9. materiality_assessments ────────────────────────────────────

create table if not exists public.materiality_assessments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  period      text not null,
  threshold   numeric(3,2) not null default 3.0 check (threshold between 0 and 5),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, period)
);

create index if not exists idx_ma_user_period
  on public.materiality_assessments(user_id, period);

alter table public.materiality_assessments enable row level security;

create policy "ma_read_own" on public.materiality_assessments
  for select to authenticated using (user_id = (select auth.uid()));
create policy "ma_insert_own" on public.materiality_assessments
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "ma_update_own" on public.materiality_assessments
  for update to authenticated using (user_id = (select auth.uid()));
create policy "ma_delete_own" on public.materiality_assessments
  for delete to authenticated using (user_id = (select auth.uid()));

create trigger trg_ma_updated_at
  before update on public.materiality_assessments
  for each row execute function tg_set_updated_at();

-- ── 10. materiality_scores ────────────────────────────────────────

create table if not exists public.materiality_scores (
  assessment_id            uuid not null references public.materiality_assessments(id) on delete cascade,
  matter_id                text not null references public.sustainability_matters(id) on delete restrict,
  -- Impact materiality (ESRS 1 §43-44)
  impact_scale             smallint check (impact_scale between 1 and 5),
  impact_scope             smallint check (impact_scope between 1 and 5),
  impact_irremediable      smallint check (impact_irremediable between 0 and 5),
  impact_likelihood        smallint check (impact_likelihood between 1 and 5),
  -- Financial materiality (ESRS 1 §49-50)
  financial_magnitude      smallint check (financial_magnitude between 1 and 5),
  financial_likelihood     smallint check (financial_likelihood between 1 and 5),
  notes                    text,
  updated_at               timestamptz not null default now(),
  primary key (assessment_id, matter_id)
);

create index if not exists idx_mscores_assessment
  on public.materiality_scores(assessment_id);

alter table public.materiality_scores enable row level security;

create policy "msc_read_own" on public.materiality_scores
  for select to authenticated using (
    exists (
      select 1 from public.materiality_assessments a
      where a.id = assessment_id and a.user_id = (select auth.uid())
    )
  );
create policy "msc_write_own" on public.materiality_scores
  for all to authenticated using (
    exists (
      select 1 from public.materiality_assessments a
      where a.id = assessment_id and a.user_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.materiality_assessments a
      where a.id = assessment_id and a.user_id = (select auth.uid())
    )
  );

create trigger trg_mscores_updated_at
  before update on public.materiality_scores
  for each row execute function tg_set_updated_at();

-- ── 11. iros ──────────────────────────────────────────────────────

create table if not exists public.iros (
  id                    uuid primary key default gen_random_uuid(),
  assessment_id         uuid not null references public.materiality_assessments(id) on delete cascade,
  matter_id             text not null references public.sustainability_matters(id) on delete restrict,
  type                  text not null check (type in ('impact_actual','impact_potential','risk','opportunity')),
  description           text not null,
  time_horizon          text not null check (time_horizon in ('short','medium','long')),
  value_chain_location  text not null check (value_chain_location in ('own_operations','upstream','downstream')),
  stakeholders          text[] not null default '{}',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_iros_assessment on public.iros(assessment_id);
create index if not exists idx_iros_matter
  on public.iros(assessment_id, matter_id);

alter table public.iros enable row level security;

create policy "iros_read_own" on public.iros
  for select to authenticated using (
    exists (
      select 1 from public.materiality_assessments a
      where a.id = assessment_id and a.user_id = (select auth.uid())
    )
  );
create policy "iros_write_own" on public.iros
  for all to authenticated using (
    exists (
      select 1 from public.materiality_assessments a
      where a.id = assessment_id and a.user_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.materiality_assessments a
      where a.id = assessment_id and a.user_id = (select auth.uid())
    )
  );

create trigger trg_iros_updated_at
  before update on public.iros
  for each row execute function tg_set_updated_at();

-- ── 12. Seed: 32 sustainability matters per ESRS 1 AR16 ───────────

insert into public.sustainability_matters (id, topic, category, label, description, sort_order) values
('E1.mitigation', 'E1', 'env', 'Climate change mitigation', 'Reducing greenhouse gas emissions across own operations and value chain to limit warming to 1.5°C.', 11),
('E1.adaptation', 'E1', 'env', 'Climate change adaptation', 'Resilience and adaptive capacity of operations and value chain to physical climate risks (chronic + acute).', 12),
('E1.energy', 'E1', 'env', 'Energy', 'Energy consumption mix, intensity, and transition to renewable sources.', 13),
('E2.pollution_air', 'E2', 'env', 'Pollution of air', 'Air pollutant emissions (PM, NOx, SOx, VOCs) from own operations and value chain.', 21),
('E2.pollution_water_soil', 'E2', 'env', 'Pollution of water and soil', 'Discharges to water bodies and soil contamination from operations and supply chain.', 22),
('E2.substances_concern', 'E2', 'env', 'Substances of (very high) concern', 'Use, production, or release of substances of concern and substances of very high concern under REACH.', 23),
('E2.microplastics', 'E2', 'env', 'Microplastics', 'Generation and release of microplastics into the environment.', 24),
('E3.water', 'E3', 'env', 'Water', 'Water consumption, withdrawals, and discharges, with focus on water-stressed areas.', 31),
('E3.marine_resources', 'E3', 'env', 'Marine resources', 'Impacts on marine ecosystems and use of marine resources.', 32),
('E4.impact_drivers', 'E4', 'env', 'Biodiversity impact drivers', 'Land/water/sea-use change, pollution, invasive species, and other pressures affecting biodiversity.', 41),
('E4.species_impacts', 'E4', 'env', 'Impacts on species', 'Effects on populations of species, including threatened and endangered species.', 42),
('E4.ecosystem_services', 'E4', 'env', 'Ecosystem services', 'Impacts on and dependencies on ecosystem services (pollination, water purification, etc.).', 43),
('E5.resource_inflows', 'E5', 'env', 'Resource inflows', 'Use of primary vs. secondary materials, renewable vs. non-renewable, exposure to resource scarcity.', 51),
('E5.resource_outflows', 'E5', 'env', 'Resource outflows', 'Durability, repairability, and recyclability of products and services.', 52),
('E5.waste', 'E5', 'env', 'Waste', 'Waste generated, treatment hierarchy (reuse > recycle > recover > dispose), and circularity rate.', 53),
('S1.working_conditions', 'S1', 'soc', 'Own workforce — Working conditions', 'Job security, working time, wages, social dialogue, freedom of association, work-life balance, health and safety.', 61),
('S1.equal_treatment', 'S1', 'soc', 'Own workforce — Equal treatment & opportunities', 'Gender equality, training, diversity, disability inclusion, harassment, anti-discrimination.', 62),
('S1.other_work_rights', 'S1', 'soc', 'Own workforce — Other work-related rights', 'Child labour, forced labour, adequate housing, privacy.', 63),
('S2.working_conditions', 'S2', 'soc', 'Value chain workers — Working conditions', 'Working-condition dimensions scoped to upstream/downstream workers (subcontractors, suppliers, gig).', 71),
('S2.equal_treatment', 'S2', 'soc', 'Value chain workers — Equal treatment & opportunities', 'Equal-treatment dimensions scoped to value chain workers.', 72),
('S2.other_work_rights', 'S2', 'soc', 'Value chain workers — Other work-related rights', 'Forced and child labour risk in supply chain, indigenous workers'' rights.', 73),
('S3.economic_social_cultural_rights', 'S3', 'soc', 'Affected communities — Economic, social and cultural rights', 'Adequate housing, food, water, security; impacts on local economies.', 81),
('S3.civil_political_rights', 'S3', 'soc', 'Affected communities — Civil and political rights', 'Freedom of expression, assembly, access to remedy, defenders'' protection.', 82),
('S3.indigenous_peoples', 'S3', 'soc', 'Affected communities — Indigenous peoples', 'FPIC (Free, Prior, Informed Consent), cultural rights, land tenure, self-determination.', 83),
('S4.information_impacts', 'S4', 'soc', 'Consumers/end-users — Information-related impacts', 'Privacy, freedom of expression, access to quality information, non-discrimination.', 91),
('S4.personal_safety', 'S4', 'soc', 'Consumers/end-users — Personal safety', 'Health and safety of products/services, exposure to harmful content, security of person.', 92),
('S4.social_inclusion', 'S4', 'soc', 'Consumers/end-users — Social inclusion', 'Non-discrimination, access to products/services, responsible marketing.', 93),
('G1.corporate_culture', 'G1', 'gov', 'Corporate culture', 'Tone at the top, code of conduct, training on ethics.', 101),
('G1.whistleblower', 'G1', 'gov', 'Whistleblower protection', 'Channels, protections, retaliation prevention per EU Directive 2019/1937.', 102),
('G1.political_engagement', 'G1', 'gov', 'Political engagement & lobbying', 'Political contributions, lobbying activities, transparency-register registration.', 103),
('G1.supplier_relationships', 'G1', 'gov', 'Supplier relationships & payment practices', 'Payment terms, late payments to SMEs, sustainability criteria in procurement.', 104),
('G1.corruption_bribery', 'G1', 'gov', 'Corruption and bribery', 'Prevention, detection, incidents, fines and sanctions.', 105)
on conflict (id) do nothing;
