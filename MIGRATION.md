# Migration plan · HTML mockups → React

This document describes the practical sequence to migrate the HTML mockups in `_mockups/` to the production React app in `apps/web/`. It's written as a checklist a senior frontend engineer can follow.

## Phase 0 · Foundation (sprint 1) — DONE

- [x] Monorepo with pnpm workspaces
- [x] Tailwind preset consuming design tokens from `@e60/ui/tokens`
- [x] Strict TypeScript across all packages
- [x] Shell components: `SidebarPrimary`, `SidebarSecondary`, `Topbar`, `AiLauncher`
- [x] Design system primitives: `KpiCard`, `Sparkline`, `Panel`, `Tag`, `FrameworkChip`, `ComingSoon`
- [x] Domain types: frameworks, datapoints, disclosures, materiality, PCAF
- [x] First migrated route: `/disclosure-hub/overview` (greeting + KPI row + chart placeholder)

**What's missing still in Phase 0:**
- [ ] Storybook setup in `packages/ui` for component documentation
- [ ] Visual regression tests (Chromatic recommended)
- [ ] CI/CD pipeline (GitHub Actions or GitLab CI)
- [ ] `app/providers.tsx` wrapping `<QueryClientProvider>` for TanStack Query

## Phase 1 · Hub Overview (sprint 2)

The greeting + KPI row is already in place. Missing:

- [ ] Migrate the main "Disclosure Activity" multi-line area chart from the mockup using **Recharts** (`<AreaChart>` with 5 stacked series). Reference the SVG paths in the mockup for the data shape.
- [ ] Migrate the 3-column "Recent Activity" panel below the chart. Build an `<ActivityColumn>` component in `@e60/ui/components` with props `{ icon, title, count, items }`.
- [ ] Migrate the bottom row with 3 donut cards. Build a `<DonutCard>` component using stacked `<circle>` with `strokeDasharray`.

**Pattern for migration:**
1. Open the mockup in browser, inspect the section
2. Find the matching CSS classes in the original HTML
3. Build a React component in `@e60/ui/src/components` if reusable
4. Compose components in the route file (`app/(shell)/disclosure-hub/overview/page.tsx`)
5. Replace hardcoded data with TanStack Query hook calling `@e60/api-client`

## Phase 2 · Datapoint Repository (sprint 3)

- [ ] Migrate the table using **TanStack Table v8**. Define columns with the shape of `Datapoint` from `@e60/domain/datapoints`.
- [ ] Build `<DataTable>` primitive in `@e60/ui` (column defs, sorting, filtering, virtualization for 1144+ rows).
- [ ] Migrate the right-hand detail panel as a sticky aside. When a row is selected, show the datapoint's full info (definition, source, mappings, lineage).
- [ ] Filter chips above the table (E/S/G/Cross + status + framework). Use Zustand for filter state.

## Phase 3 · Open Disclosure drawer (sprint 4)

- [ ] Build `<Drawer>` primitive based on shadcn/ui's `Sheet` (Radix UI underneath). Width 720px, slide from right, backdrop with blur.
- [ ] 5 internal tabs (Datapoints, Narrative, Mapping, History, Comments) using Radix Tabs.
- [ ] Datapoints tab is the most complex: sectioned by ESRS topic, each row with status + name + value.
- [ ] Comments tab needs a textarea composer with mention support (defer to later if needed).

## Phase 4 · Financed Emissions (sprint 5)

- [ ] PCAF KPI row (4 cards with sub-brand "ALQUID NZ" badge).
- [ ] Decarbonization trajectory chart in Recharts: historical (solid) + projection (dotted) + SBTi target (red) + gap area.
- [ ] Sectoral progress bars (6 sectors: power, cement, transport, CRE, residential, oil&gas) with target markers.
- [ ] 3-column activity panel (Top emitters / Recently aligned / Under review).

## Phase 5 · Output Generators (sprint 6)

- [ ] Hero flow with 3 steps + arrows (datapoints → frameworks → disclosures).
- [ ] Gallery grid of disclosure cards. Each card has a custom SVG preview based on the framework.
- [ ] Click card → opens the Open Disclosure drawer (built in phase 3).

## Phase 6 · Materiality Studio (sprint 7-8)

This is the most complex view; budget 2 sprints.

- [ ] Internal tabs (Matrix, IRO Inventory, Stakeholders, Assessment Workflow). Use Radix Tabs.
- [ ] **Matrix tab**: 2D scatter plot. Use D3 or build with absolute-positioned `<div>` elements (the mockup uses the latter, which is simpler for fewer than 20 dots).
  - Tooltip on hover (use Radix Tooltip or floating-ui).
  - Drill-down panel below the matrix that updates on selection.
  - Evolution timeline at the bottom (3 mini-matrices side by side).
- [ ] **IRO Inventory tab**: filterable list with type chips, topic dot, datapoint count, validation status.
- [ ] **Stakeholders tab**: split layout (list + detail). Click on a stakeholder card updates the detail panel.
- [ ] **Assessment Workflow tab**: dark hero with phase timeline + current phase detail with checklist.

## Phase 7 · Polish & production-ready (sprint 9-10)

- [ ] Loading states / skeletons for every route.
- [ ] Error boundaries with friendly fallbacks.
- [ ] Empty states (datapoint with no value, disclosure with no data, etc.).
- [ ] Keyboard shortcuts: `[` for sidebar collapse (already done), `/` for search focus, `g h` for hub, etc.
- [ ] Accessibility audit: keyboard navigation, screen reader testing, color contrast, focus management.
- [ ] Performance: bundle analysis, code splitting per route, image optimization.

## Backend integration

When the FastAPI backend is ready:

1. Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to point at the backend.
2. Run `pnpm --filter @e60/api-client generate` to generate types from the OpenAPI spec.
3. Replace hardcoded data in route files with `useQuery({ queryKey, queryFn: api.<resource>.<endpoint> })`.

For local development without backend:
1. Use the mock handlers in `@e60/api-client/mock` (currently empty stub — populate with MSW v2 handlers).

## What's outside scope of this migration

The HTML mockups are visual. They don't define:
- **Authentication & session management** — to be designed with backend team
- **Real-time updates** — websocket strategy for system-online status (probably Server-Sent Events)
- **Multi-tenant isolation** — banking clients will require tenant-level data isolation
- **i18n** — currently the mockup is in mixed Spanish/English; production needs proper localization (next-intl recommended)
- **Audit logging** — every mutation needs to be logged; coordinate with Trust Center module

These are major workstreams to plan separately, not part of the visual migration.
