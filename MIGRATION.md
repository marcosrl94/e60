# Migration · HTML mockups → React

Practical record of the migration from `_mockups/disclosure-hub.html` to the production React app in `apps/web/`. Tracks phases as **shipped** vs **pending** so anyone landing on the repo can see what's real and what's still in mockup form.

## Status snapshot

| Phase | Scope | Status |
|---|---|---|
| 0 | Foundation · monorepo + design system + shell | ✅ Done |
| 1 | Hub Overview · KPI row + activity chart + activity columns + donuts | ✅ Done |
| 2 | Datapoint Repository · 1184 EFRAG datapoints, virtualized table, filters, sticky detail | ✅ Done |
| 3 | Drawer primitive + Disclosure drawer (5 tabs) | ✅ Done |
| 4 | Financed Emissions + Net-Zero Trajectory · ALQUID NZ embed shell | ✅ Done (placeholder, awaiting engine URL) |
| 5 | Output Generators · hero flow + gallery + drawer click-through | ✅ Done |
| 6 | Materiality Studio · industry pre-screening heatmap | ✅ Done |
| — | Carbon Intelligence (native, not in original plan) | ✅ Done |
| 7 | Polish · skeletons, error boundaries, empty states, a11y, perf | 🚧 Partial |

The migration officially planned through Phase 6 is shipped. The Carbon Intelligence module was added on top (it's a native E6.0 module — see decision below). What's left is real-data wiring, polish, and the backend integrations that were always out-of-scope of the visual migration.

## What's shipped, in detail

### Phase 0 · Foundation
- Monorepo with pnpm 9.12 workspaces (`apps/web` + `packages/{ui,domain,api-client,config}`).
- Design tokens in `@e60/ui/tokens` re-exported as the Tailwind preset in `@e60/config/tailwind/preset`.
- Strict TypeScript across all packages.
- Shell: `SidebarPrimary`, `SidebarSecondary` (route-aware Disclosure Hub tree, collapsible with `[`), `Topbar`, `AiLauncher`.
- Primitives in `@e60/ui`: `KpiCard`, `Sparkline`, `Panel`, `Tag`, `FrameworkChip`, `ActivityColumn`, `DonutCard`, `ComingSoon`.
- Domain types: `frameworks`, `datapoints`, `disclosures`, `materiality`, `pcaf`, `emissions`.

### Phase 1 · Hub Overview · `/disclosure-hub/overview`
- Greeting block with `Live` tag + last-updated timestamp.
- 5-card KPI row (Datapoints / Captured / Frameworks / Disclosures Q4 / Pending review).
- `DisclosureActivityChart` (Recharts `ComposedChart` with 5 stacked area series).
- 3-column "Recent Disclosure Activity" panel with `RecentlyCaptured` / `RecentlyPublished` / `BlockedReview`.
- 3 donut cards · By ESRS Topic / By Framework / By Source.

### Phase 2 · Datapoint Repository · `/disclosure-hub/repository`
- Seed: **1184 datapoints** parsed from EFRAG IG3 v2025-06 (`apps/web/data/seed/datapoints.json`).
- Domain shape extended with structured fields: `paragraph`, `relatedAr`, `phaseInYears` (1/2/3 EFRAG IG3 Appendix C), `voluntary`, `conditional`, `mayDisclose`, `crosswalk` (SFDR / Pillar III / Benchmark / Climate Law).
- `DataTable` primitive (`apps/web/components/datatable/DataTable.tsx`) on TanStack Table v8 + `@tanstack/react-virtual`. SSR-safe via mounted-gate ("Loading catalogue…" placeholder).
- Filters in 2 rows (Zustand-backed): category (E/S/G/Cross/All) + status + free-text search; second row · scope (mandatory only / phased-in / voluntary / conditional) + crosswalk regulator.
- Sticky right-side detail panel with sparkline, ESRS reference (DR · § paragraph · AR), regulatory crosswalk, phase-in note, frameworks mapped, owner.
- `applyDemoOverlay()` decorates the seed deterministically with `live / partial / pending / blocked` statuses + curated highlight values for E1-6_01/02 and E1-7_01.

### Phase 3 · Drawer primitive + Disclosure drawer
- `Drawer` primitive in `@e60/ui` (720px slide-from-right, blur backdrop, Esc + backdrop close, body scroll lock, transform-only animation, auto-unmount post-close). Ships `Drawer.Tabs` subcomponent (underline, sticky inside drawer body).
- `DisclosureDrawer` (in `apps/web/components/hub/outputs/`) with 5 tabs:
  - **Datapoints** — sectioned by ESRS topic, coverage card on top (live / pending / total + % bar). Mapping per disclosure id in `disclosure-datapoint-mapping.ts` resolved against the EFRAG seed.
  - **Narrative**, **Mapping**, **History**, **Comments** — demo content + composer placeholder.

### Phase 4 · Financed Emissions + Net-Zero Trajectory (ALQUID NZ embed)
- `EngineEmbed` in `apps/web/components/embeds/` — generic iframe shell parametrised by engine. Reads `NEXT_PUBLIC_ALQUID_NZ_BASE_URL`; renders `${BASE}/embed/{view}` when set, "Not connected" placeholder when missing.
- `/disclosure-hub/financed-emissions` and `/disclosure-hub/net-zero-trajectory` are both ALQUID NZ embed routes today, with curated `feeds` lists pointing at the ESRS DPs each view rolls up to.
- **Decision:** ALQUID NZ stays as an external product (separate repo, embedded). E6.0 doesn't recompute PCAF — it presents.

### Phase 5 · Output Generators · `/disclosure-hub/outputs`
- Greeting + meta tag (12 disclosures Q4) + hero flow (3 steps with arrows: 1184 datapoints → 8 frameworks → 47 disclosures published).
- 6 disclosure cards in a 3-col grid (CSRD / CDP / Pillar III ESG / DJSI / UNEP-FI PRB / Board ESG). Each has a custom inline SVG preview (`previews.tsx`), framework label coloured by accent, status tag overlaid on the gradient.
- `OutputsGallery` (client) owns the selected disclosure id and mounts the `DisclosureDrawer` (Phase 3) on click. Cards are keyboard-accessible (`Enter` / `Space`).

### Phase 6 · Materiality Studio · `/disclosure-hub/materiality`
- Seeds:
  - 52 NACE Rev 2.1 sectors (21 sections + 31 representative divisions) — `apps/web/data/seed/nace-sectors.json`.
  - 232 industry-materiality rows (210 section-level baseline + 22 division overrides for refining, cement, food, retail, banking K.64, insurance K.65, real estate L.68, datacentres, healthcare, air transport) — `apps/web/data/seed/industry-materiality.json`.
- `resolveMateriality()` in `@e60/domain/materiality/industry`: override → exact (EFRAG > GHG > SASB > NFQ) → parent-section inheritance → 0 fallback.
- Two-column UI:
  - **SectorPicker** (left) — multi-select grouped by NACE section with sticky headers, search, removable chips on top, division flag.
  - **MaterialityMatrix** (right) — categories rows × sectors cols, level 0–3 coloured cells, inheritance trail "↑X" annotation, override ring (purple).
- **OverrideModal** with catalogue baseline panel + 4-button level picker + mandatory justification (≥10 chars) + reset-to-baseline. State persisted in a Zustand store (in-memory; ready to swap for a server action when the backend exists).

### Carbon Intelligence (native, not in original plan) · `/disclosure-hub/carbon-intelligence`
Added late in the migration after a scope decision: ALQUID NZ ships as an embed (Phase 4) but the **operational** GHG inventory (Scope 1 + Scope 2 LB/MB + Scope 3 cat 1-14) is built natively in E6.0.

- 4 sub-tabs (`SubTabs` primitive): Overview / Inventory / Factor catalogue / Disclosure feed.
- Overview · 4-card KPI row + monthly stacked area chart (Recharts).
- Inventory · 3 activity columns (recent entries / active reduction targets / validation queue). The "recent entries" column is fed by a Zustand store, so live additions from the New entry modal show up at the top.
- Factor catalogue · 41 factors (13 S1 + 8 S2 incl. 4 market-residual placeholders + 20 S3) lifted from the legacy `nfq-carbon-intelligence` SQL seed. Filterable by scope + source (MITECO / IDAE / DEFRA).
- Disclosure feed · ESRS DPs the module rolls up to.
- "+ New entry" modal — picker over the 41 factors, unit dropdown driven by `listCompatibleInputUnits()`, **live tCO₂e preview** with both the unit-conversion line and the final formula. Scope 2 method toggle, DQ tier T1/T2/T3, optional notes.

Lifted primitives from the legacy repo:
- `@e60/domain/emissions` — `Scope`, `FactorSource`, `EmissionFactor`, `Scope2Method`, `RenewableInstrumentType`, `DataQualityTier`, `computeTco2e()`, plus the full `unit-conversion.ts` (generic mass / energy / volume / distance + activity-specific densities + natural gas PCS).

## What's pending

### Phase 7 · Polish (in progress)
- Skeleton loaders for routes that hit the API.
- Error boundaries with friendly fallbacks per route.
- Empty states (datapoint with no value, disclosure with no DPs mapped, etc.).
- Keyboard shortcuts (cmd+K palette, navigation hints).
- Accessibility audit pass (focus rings already in place on cards/drawer; rest TBD).

### Backend integration (out of visual migration scope)
- Wire TanStack Query against the future FastAPI endpoints; replace the JSON seeds and Zustand stores with server data.
- MSW handlers in `packages/api-client/src/mock` are still placeholders.
- ALQUID NZ — connect once the team provides `NEXT_PUBLIC_ALQUID_NZ_BASE_URL` (env var documented in `.env.example`).

### Tooling
- ✅ GitHub Actions CI (typecheck + build) — added.
- 🚧 Storybook in `@e60/ui` for component documentation.
- 🚧 Chromatic / visual regression on the gallery + matrix.
- 🚧 `app/providers.tsx` with `<QueryClientProvider>` (left for the day TanStack Query starts hitting endpoints).

### Decisions still open
- Auth & session — pending backend team.
- Real-time updates — websocket vs SSE for the system-online status.
- Multi-tenant isolation — banking requirement, not designed yet.
- i18n — `next-intl` recommended; mockup is mixed Spanish / English today.
- Audit logging — coordinate with the future Trust Center module.

## Pattern reference for new modules

Look at `apps/web/components/hub/carbon-intelligence/` for the canonical template:

1. `data.tsx` (or `data.ts`) — typed mock arrays.
2. `*View.tsx` (server) — greeting + sub-tabs + composition.
3. Sub-components (server when static, client when interactive).
4. `store.ts` (Zustand) for client-side state that needs to survive within a session.
5. Heavy interactions in dedicated client components (modals, forms, drawers); imports from `@e60/ui` so server boundaries don't have to serialise function refs.

The mockups in `_mockups/` are the visual reference. Don't delete until the polish phase is closed.
