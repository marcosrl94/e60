# E6.0 · Contexto para Claude

ESG platform for European banks built by NFQ Advisory. Vive en `Apps/2. Plataformas/e60-frontend/`. **Plataforma central** del ecosistema NFQ ESG: aquí se consolida toda la oferta producto, y los POCs aislados (CBAM, ALQUID NZ) se embeben cuando maduran.

> **Plan vivo en [`SCALABILITY.md`](SCALABILITY.md) v2 (14 may 2026)** — roadmap de 9 phases (7 → 15) sobre 8-10 meses + audit §18 con gaps detectados sobre el plan. Este `CLAUDE.md` es contexto rápido, no sustituye el plan.

## 1. Contexto y objetivo

**Para quién:** bancos europeos.
**Qué problema resuelve:** disclosure ESG completo en una plataforma única — frameworks, datapoints, materialidad, financed emissions (PCAF), pillar III, output generators — sin tener que combinar 5–6 herramientas distintas.
**Qué produce:** SaaS multi-módulo accesible vía web, con outputs alineados a CSRD/ESRS, ISSB, GRI, TCFD, SASB.

**Los 6 módulos del shell:**
- `disclosure-hub` — gestión de datapoints + composición de disclosures + drawer de detalle + Carbon Intelligence + Outputs. **En producción** (Phases 0-6 ✅ + sprint Phase 8 parcial).
- `pillar-iii` — banking Pillar 3 (EBA templates · capital · liquidez · ESG Pillar III). **Stub** · Phase 11.
- `climate-lab` — riesgo físico (mapas hazard) + transición + NGFS + stress test SREP + TNFD. **Stub** · Phase 12.
- `sustainable-finance` — EU Taxonomy · SFDR PAI · GAR/BTAR · CBAM embed · SLB tracker. **Stub** · Phase 13. Target de CBAM cuando madure.
- `data-layer` — sources catalogue · pipelines DAG · quality rules · lineage explorer. **Connector stub + Portfolio CSV real** · Phase 9.
- `trust-center` — audit log maduro · RBAC · approvals · auditor pack · controls catalog. **Audit-log stub** · Phase 10.

**Sub-brands embeddables:**
- **ALQUID NZ** — Financed Emissions / PCAF. Repo en GitLab, placeholder visual ya reservado.
- **CBAM** — futuro `packages/cbam-engine` (POC en `Apps/2. Plataformas/CBAM/`, integración en Phase 13.6).

## 2. Stack técnico

- **Framework:** Next.js 15 App Router + React 19 + TypeScript 5.6 (strict)
- **Estilos:** Tailwind CSS 3.4 + shadcn/ui **copy-in** (no npm dep — ownership y modificabilidad para clientes banca)
- **Monorepo:** pnpm 9.12 workspaces, `apps/web` + 4 packages (`ui`, `domain`, `api-client`, `config`)
- **Estado:** TanStack Query (server) · Zustand (client) · Zod (validación)
- **Charts:** Recharts (la mayoría) · D3 (Climate Lab futuro)
- **Tablas:** TanStack Table v8 (virtualizadas vía `@tanstack/react-virtual`)

**Backend — mixto (confirmado §18.5 audit):**
- **Supabase managed** (project ref `nodhlwslrxuekmhluldr`) = source of truth transaccional. Postgres 17 + PostgREST + Auth + RLS + Storage + Realtime. Migraciones en `supabase/migrations/` (8 aplicadas: `initial_schema`, `harden_schema`, `dma_schema`, `iro_datapoints`, `pillar_tbl_signoffs`, `connector_syncs`, `emission_entries_disclosure_bindings`, `operational_units`). RLS enforced en cada tabla mutable desde la primera migración.
- **FastAPI separado (futuro)** = stateless compute. Casos: output PDF/Word render, AI narrative (LLM-backed), financed emissions PCAF math, climate VaR, bulk CSV validate+transform, connectors externos no-Supabase. Sin estado, no toca Supabase directamente — el frontend orquesta.
- **`packages/api-client`** se reorganizará en `supabase.*` (PostgREST + RPC) y `compute.*` (FastAPI) cuando llegue el segundo servicio. Hoy sólo Supabase.
- Tipos OpenAPI generados con `openapi-typescript` per servicio.

**Auth:** Supabase Auth con email + Google OAuth · middleware Next con `updateSession` · clients en `apps/web/utils/supabase/{client,server,middleware}.ts` · routes `/login`, `/sign-up`, `/auth/callback`. SSO empresarial (Azure AD / Okta SAML / Generic OIDC) llega en Phase 7.3.

**Mocks:** MSW v2 en `packages/api-client/mock` · **handlers pendientes (Phase 7.2)** — el repo se ejecuta hoy contra Supabase remoto directamente.

**Estructura del monorepo:**

```
apps/
  web/                       # Next.js app (App Router)
    app/(shell)/<modulo>/    # rutas que comparten el shell
    app/actions/             # server actions (DMA, emissions)
    components/
      shell/                 # Sidebar primary/secondary/topbar
      hub/<sub-modulo>/      # composiciones específicas
    utils/supabase/          # client/server/middleware factories
    lib/                     # cross-module helpers (audit-log, dma-derived,
                             # connector-state, disclosure-bindings,
                             # operational-units)
    data/seed/               # 1184 datapoints EFRAG IG3 · 41 factores ·
                             # 52 NACE · 232 industry-materiality
  supabase/
    migrations/              # 8 SQL files versionadas
packages/
  ui/                        # design system (shadcn copy-in)
    src/primitives/          # Button, Input, Tabs, Drawer
    src/components/          # KpiCard, Panel, ActivityCol, Sparkline...
    src/tokens/              # design tokens en TS
    .storybook/              # Storybook 8 (Vite) · 10 primitives covered
  domain/                    # tipos ESG (frameworks, datapoints, materiality,
                             #            pcaf, emissions, lineage)
  api-client/                # fetch tipado + hooks (TanStack Query)
  config/                    # tailwind preset, tsconfig base, eslint
```

**Comandos:**

```bash
corepack enable && corepack prepare pnpm@9.12.0 --activate
pnpm install
pnpm dev                            # apps/web en localhost:3000
pnpm build                          # build recursivo
pnpm type-check                     # tsc strict en todo el monorepo
pnpm lint
pnpm format                         # prettier --write .
pnpm --filter @e60/ui storybook     # Storybook en :6006
```

**Variables de entorno (`apps/web/.env.local`, gitignored):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (formato `sb_publishable_...` también vale)
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `NEXT_PUBLIC_ALQUID_NZ_BASE_URL` (cuando exista)

Vercel ↔ Supabase integration inyecta las claves auto en Production/Preview/Development desde 12 may 2026.

## 3. Estado actual

**Phases 0-6 ✅ shipped** (Disclosure Hub — full breakdown en [`MIGRATION.md`](MIGRATION.md)):
- **0** Foundation: monorepo + design tokens + shell + 10 primitives.
- **1** `/disclosure-hub/overview` — KPI row + chart + activity + donuts.
- **2** `/disclosure-hub/repository` — 1184 EFRAG datapoints virtualizados + filtros + drawer.
- **3** Drawer primitive + Datapoint drawer (5 tabs).
- **4** `/disclosure-hub/financed-emissions` y `/net-zero-trajectory` — placeholder ALQUID NZ.
- **5** `/disclosure-hub/outputs` — hero flow + 6 disclosure cards.
- **6** `/disclosure-hub/materiality` — DMA EFRAG-compliant (32 ESRS 1 AR16 matters · matrix · IROs · pre-screen NACE 52 sectores · 232 industry rows).

**Carbon Intelligence** — `/disclosure-hub/carbon-intelligence` · 4 sub-tabs (Overview/Inventory/Factor catalogue/Disclosure feed) · 41 factores MITECO/IDAE/DEFRA · factor picker con unit conversion live · `emission_entries` Supabase RLS.

**Sprint `feat/scalability-sprint` (13-14 may, 11 commits, pusheado, PR draft pendiente):**
- **Track A** · Lineage domain types · DatapointDrawer enriched (comparatives N/N-1/N-2 ESRS) · Repository columns operativas + filtros · Disclosure Preview 2-pane en `/outputs/[id]`.
- **Track B** · Entries TanStack sub-tab · Activity entry wizard 3 pasos.
- **Track C** · CI ↔ Hub bridge (`disclosure_bindings` per entry · "Powered by N" en drawer · CI filter banner).
- **Track D** (emergente, foundational) · `operational_units` tree + `user_org_memberships` · bootstrap demo (Pilot Bank Iberia + 3 subs + 4 facilities) · Location selector en NewEntryForm · By-location aggregation table con DFS rollup · click row → `?location=` subtree filter.
- B3 (PCAF DQR) skipped per owner · B4 (Bulk CSV) deferred.

**Decisión arquitectónica vigente:**
- **ALQUID NZ = embed externo** (financed emissions PCAF + portfolio alignment + Scope 3.15).
- **Carbon Intelligence = nativo** en E6.0 (Scope 1+2+S3 cat 1-14).
- **CBAM = futuro embed** como `packages/cbam-engine` + sub-ruta dentro de `sustainable-finance`.
- **Multi-tenant híbrido** (§18.4 SCALABILITY): silo Supabase per bank + RLS interna por `entity_id` / consolidation_group. Sin implementar todavía — bloqueante de Phase 7.4.
- **Backend split** (§18.5 SCALABILITY): Supabase transaccional + FastAPI stateless compute. Bloqueante de Phase 8 hasta que se documente `docs/architecture/backend-split.md`.

## 4. Phase 7 inmediato (próximos pasos)

Ver [`SCALABILITY.md` §3](SCALABILITY.md) para el detalle. Tickets críticos:
- **7.14** · `docs/architecture/backend-split.md` · **S · bloquea Phase 8**.
- **7.4** · Multi-tenant híbrido (reescribir per §18.4).
- **7.12** · Testing baseline (Vitest domain + ui · Playwright smoke web).
- **7.13** · Observability (Sentry + Web Vitals + structured logs).
- **7.2** · MSW handlers completos.
- **7.3** · Auth & SSO (Auth.js sobre Supabase para SAML/OIDC empresarial).
- **7.6** · Audit primitive transversal.
- **7.7** · Storybook completo + Chromatic en CI.

**Definition of Done Phase 7:** un nuevo módulo (placeholder vacío) hereda auth, tenant, i18n scaffold, audit, permissions hooks y MSW handler sin reinventarlos. Tarda < 1 día en estar listo para M.0.

**CI:** GitHub Actions con `type-check` + `build` en cada push (`.github/workflows/ci.yml`). Refuerzo en 7.11/§18.6: añadir `lint`, `test`, `pnpm audit`, CodeQL, Lighthouse, bundle diff.

## Cómo trabajar en este proyecto con Claude

**Reglas de la casa:**
- Antes de cerrar cualquier cambio: `pnpm lint && pnpm type-check && pnpm build`. Strict TS, no escapes.
- **Server Components por defecto.** Client components solo donde haya interactividad real. Target `< 30%` de `.tsx` con `'use client'` antes de Phase 8 (hoy ~54%, §18.9 audit).
- **shadcn copy-in, no install.** `cd packages/ui && pnpm dlx shadcn@latest add <component>` — la copia queda en `packages/ui/src/primitives/`. Evita versionar contra npm.
- **Tipos de dominio en `packages/domain`.** Nada de string-typed primitives para conceptos ESG.
- **Datos vía Supabase (PostgREST + RLS) o server actions** — no `fetch` crudo. Cuando entre FastAPI, vía `@e60/api-client/compute.*` con TanStack Query.
- **No commitear sin confirmación explícita** del owner.
- **Cada PR de cierre de phase toca `CLAUDE.md` + `MIGRATION.md`** (regla §18.2). Un doc que miente cuesta más caro que uno que no existe.
- **Componentes nuevos:** primitives generales en `packages/ui/src/primitives/`, composiciones reusables en `packages/ui/src/components/`, app-specific en `apps/web/components/<modulo>/`.
- **Tailwind preset gotcha:** `@e60/tailwind` reemplaza `sm/md/lg/xl` por `cramped/standard/wide`. Usar esos breakpoints, no `lg:` ni `min-[Npx]:`.

**POCs externos (CBAM, ALQUID NZ) cuando entren:**
- Engines van como `packages/<nombre>-engine`, sin acoplar a UI Vite/standalone.
- Vistas como sub-rutas dentro del módulo correspondiente.
- API contract vía OpenAPI desde el día 1.

**Decisiones abiertas (no resueltas todavía):**
- **Multi-tenant interno** — silo per bank decidido, pero (a) cross-entity dentro de un mismo banco ¿RLS pura o service-role + filtro API? (b) ¿`approver` se hereda por jerarquía o explícito? (c) ¿filings consolidados en entidad "ficticia" o tabla aparte? Cerrar antes de Phase 7.4.
- **i18n** — `next-intl` decidido (Phase 7.5), 5 locales (es/en/de/fr/it). Pendiente migrar el mix español/inglés del Hub a `en` default + `es` completo.
- **Real-time updates** — Supabase Realtime para system-online y notificaciones cross-user. Sin diseñar.
- **AI narrative** — proveedor (OpenAI vs Anthropic vs both) y guardrails. Phase 8.9.

**Donde está cada cosa:**
- Mockups originales en [`_mockups/`](_mockups/) — referencia visual, no borrar.
- Plan de roadmap completo en [`SCALABILITY.md`](SCALABILITY.md) (v2 · 9 phases · §18 audit).
- Plan de migración Phases 0-6 en [`MIGRATION.md`](MIGRATION.md).
- Tokens del design system en `packages/ui/src/tokens/index.ts`, re-exportados como Tailwind preset en `packages/config/tailwind/preset.ts`.
- Demo route hoy: `http://localhost:3000/disclosure-hub/overview`.
