# E6.0 · Contexto para Claude

ESG platform for European banks built by NFQ Advisory. Vive en `Apps/2. Plataformas/e60-frontend/`. **Plataforma central** del ecosistema NFQ ESG: aquí se consolida toda la oferta producto, y los POCs aislados (CBAM, ALQUID NZ) se embeben cuando maduran.

## 1. Contexto y objetivo

**Para quién:** bancos europeos.
**Qué problema resuelve:** disclosure ESG completo en una plataforma única — frameworks, datapoints, materialidad, financed emissions (PCAF), pillar III, output generators — sin tener que combinar 5–6 herramientas distintas.
**Qué produce:** SaaS multi-módulo accesible vía web, con outputs alineados a CSRD/ESRS, ISSB, GRI, TCFD, SASB.

**Los 6 módulos del shell:**
- `disclosure-hub` — gestión de datapoints + composición de disclosures + drawer de detalle. Migración HTML→React activa (Phase 0 hecha, Phase 1 en marcha).
- `pillar-iii` — banking Pillar 3 disclosures (capital, riesgo).
- `climate-lab` — análisis de riesgo físico y de transición; visualizaciones D3.
- `sustainable-finance` — productos financieros sostenibles. **Target de CBAM** cuando madure.
- `data-layer` — gestión de calidad / linaje / fuentes de datos.
- `trust-center` — auditoría, compliance, certificaciones.

**Sub-brands embeddables:**
- **ALQUID NZ** — Financed Emissions / PCAF. Repo en GitLab, placeholder visual ya reservado en Phase 4 (sub-brand badge en KPI cards).

## 2. Stack técnico

- **Framework:** Next.js 15 App Router + React 19 + TypeScript 5.6 (strict)
- **Estilos:** Tailwind CSS 3.4 + shadcn/ui **copy-in** (no npm dep — ownership y modificabilidad para clientes banca)
- **Monorepo:** pnpm 9.12 workspaces, `apps/web` + 4 packages
- **Estado:** TanStack Query (server) · Zustand (client) · Zod (validación)
- **Charts:** Recharts (la mayoría) · D3 (Climate Lab)
- **Tablas:** TanStack Table v8
- **Backend:** FastAPI en repo separado, contrato OpenAPI 3.1 → `packages/api-client` regenera tipos con `openapi-typescript`
- **Mocks:** MSW v2 en `packages/api-client/mock` (handlers todavía pendientes)

**Estructura del monorepo:**

```
apps/
  web/                       # Next.js app (App Router)
    app/(shell)/<modulo>/    # rutas que comparten el shell
    components/
      shell/                 # Sidebar primary, secondary, topbar
      hub/                   # composiciones específicas del Hub

packages/
  ui/                        # design system (E6.0 components, shadcn-based)
    src/primitives/          # Button, Input, Tabs, Drawer (shadcn copy-in)
    src/components/          # KpiCard, Panel, ActivityCol, Sparkline...
    src/tokens/              # design tokens en TS
    src/icons/               # icon set propio
  domain/                    # tipos ESG (frameworks, datapoints, materiality, PCAF...)
  api-client/                # fetch tipado + types generados de OpenAPI
  config/                    # tailwind preset, tsconfig base, eslint
```

**Comandos:**

```bash
corepack enable && corepack prepare pnpm@9.12.0 --activate
pnpm install
pnpm dev                  # apps/web en localhost:3000
pnpm build                # build recursivo
pnpm type-check           # tsc strict en todo el monorepo
pnpm lint
pnpm format               # prettier --write .
```

**Variables de entorno:** `NEXT_PUBLIC_API_BASE_URL` en `apps/web/.env.local`.

## 3. Estado actual y próximos pasos

**Phases 0-6 ✅ shipped** (full breakdown en [`MIGRATION.md`](MIGRATION.md)):
- **0** Foundation: monorepo pnpm + design tokens + Tailwind preset + shell (4 components) + primitives (KpiCard, Sparkline, Panel, Tag, FrameworkChip, ActivityColumn, DonutCard, ComingSoon, Drawer, SubTabs).
- **1** `/disclosure-hub/overview` — greeting, KPI row 5-card, `DisclosureActivityChart` (Recharts 5-series), 3-col activity, 3 donuts.
- **2** `/disclosure-hub/repository` — 1184 EFRAG IG3 datapoints, virtualized TanStack table, filtros 2-row (categoría + status + scope + crosswalk + search), sticky detail panel.
- **3** Drawer primitive en `@e60/ui` + `DisclosureDrawer` con 5 tabs (Datapoints sectioned por topic, Narrative, Mapping, History, Comments).
- **4** `/disclosure-hub/financed-emissions` y `/net-zero-trajectory` — `EngineEmbed` con placeholder ALQUID NZ (env var `NEXT_PUBLIC_ALQUID_NZ_BASE_URL` cuando esté).
- **5** `/disclosure-hub/outputs` — hero flow + 6 disclosure cards con SVG previews custom + click → drawer.
- **6** `/disclosure-hub/materiality` — 52 NACE sectors + 232 industry-materiality rows + resolver + heatmap + override modal.

**Carbon Intelligence (extra, native, no estaba en el plan):** `/disclosure-hub/carbon-intelligence` — KPI row + monthly trend chart + factor catalogue (41 factores MITECO/IDAE/DEFRA liftados del legacy) + new-entry modal con factor picker + unit conversion en vivo + tCO₂e preview. Sub-tabs (Overview/Inventory/Factor catalogue/Disclosure feed).

**Decisión arquitectónica:** ALQUID NZ = embed externo. Carbon Intelligence = nativo en E6.0. Reparto: Scope 1+2+S3 cat 1-14 (ops propias) → CI nativo; Scope 3.15 financiado + portfolio alignment → ALQUID NZ embed.

**Pendiente · Phase 7 polish y backend:**
- Skeleton loaders, error boundaries, empty states.
- Keyboard shortcuts (cmd+K palette).
- Storybook en `packages/ui`, Chromatic visual regression.
- `app/providers.tsx` con `<QueryClientProvider>` cuando TanStack Query empiece a tirar de endpoints reales.
- MSW handlers en `packages/api-client/mock`.
- Wire ALQUID NZ cuando llegue el repo.

**CI:** GitHub Actions con typecheck + build en cada push (`.github/workflows/ci.yml`).

**Decisiones abiertas / outside scope migración:**
- Auth & session management — pendiente con backend team
- Real-time updates — websocket vs SSE para system-online status
- Multi-tenant isolation — requisito banca, sin diseñar todavía
- i18n — `next-intl` recomendado, mockup hoy en mix español/inglés
- Audit logging — coordinar con módulo Trust Center

## Cómo trabajar en este proyecto con Claude

**Reglas de la casa:**
- Antes de cerrar cualquier cambio: `pnpm lint && pnpm type-check && pnpm build`. Strict TS, no escapes.
- **Server Components por defecto.** Client components solo donde haya interactividad real (drawers, charts, drag-drop). Importante para mantener bundle bajo en entornos banca con conectividad restringida.
- **shadcn copy-in, no install.** Cuando añadas un primitive nuevo: `cd packages/ui && pnpm dlx shadcn@latest add <component>` y la copia queda en `packages/ui/src/primitives/`. Evita versionar contra npm.
- **Tipos de dominio en `packages/domain`.** Nada de string-typed primitives para conceptos ESG. Estos tipos son el contrato entre UI y data, usados client- y (en el futuro) server-side.
- **API tipada vía OpenAPI.** No hagas `fetch` crudo; usa `@e60/api-client` con TanStack Query (`useQuery({ queryKey, queryFn: api.<resource>.<endpoint> })`).
- **No commitear sin confirmación explícita** del owner.
- **Componentes nuevos:** primitives generales en `packages/ui/src/primitives/`, composiciones reusables en `packages/ui/src/components/`, app-specific en `apps/web/components/<modulo>/`.

**POCs externos (CBAM, ALQUID NZ) cuando entren:**
- Engines van como `packages/<nombre>-engine`, sin acoplar a UI Vite/standalone
- Vistas van como sub-rutas dentro del módulo correspondiente (CBAM → `apps/web/app/(shell)/sustainable-finance/cbam/`)
- API contract vía OpenAPI desde el día 1
- Mantener ownership del UI standalone hasta que el embed sea estable

**Donde está cada cosa:**
- Mockups originales en [`_mockups/`](_mockups/) — referencia visual hasta Phase 7, **no borrar**.
- Plan completo de migración en [`MIGRATION.md`](MIGRATION.md).
- Tokens del design system en `packages/ui/src/tokens/index.ts`, re-exportados como Tailwind preset en `packages/config/tailwind/preset.ts`.
- Demo route hoy: `http://localhost:3000/disclosure-hub/overview`.
