# E6.0 — Frontend

ESG platform for European banks. Built by NFQ Advisory.

[![ci](https://github.com/marcosrl94/E60/actions/workflows/ci.yml/badge.svg)](https://github.com/marcosrl94/E60/actions/workflows/ci.yml)

## What's in here

A Next.js 15 monorepo that hosts the E6.0 product surface. The app boots into the **Disclosure Hub** — the consolidation layer for everything ESG: datapoints, disclosures, materiality, financed emissions, output generators. Other top-level modules (Pillar III, Climate Lab, Sustainable Finance, Data Layer, Trust Center) are scaffolded but not all populated yet — see [`MIGRATION.md`](MIGRATION.md) for the per-route status.

External calculation engines (ALQUID Net Zero · CBAM) live in their own repos and embed in via iframe. Carbon Intelligence — the operational GHG inventory — is built natively here.

## What works today

| Route | What it shows |
|---|---|
| `/disclosure-hub/overview` | Greeting · 5-card KPI row · multi-line activity chart · 3-column activity panel · 3 donut cards |
| `/disclosure-hub/repository` | Virtualised TanStack table over **1,184 EFRAG IG3 datapoints**, filters (category · status · scope · regulator crosswalk · search), row click → DatapointDrawer with 5 tabs |
| `/disclosure-hub/materiality` | 52 NACE sectors × 10 GHG categories heatmap, override modal with auditable justification, 232 catalogue rows |
| `/disclosure-hub/carbon-intelligence` | Native operational footprint module · 4 sub-tabs · monthly trend chart · 41-row factor catalogue · "+ New entry" modal with live tCO₂e preview |
| `/disclosure-hub/outputs` | Hero flow + 6 disclosure cards · click → DisclosureDrawer with Datapoints / Narrative / Mapping / History / Comments |
| `/disclosure-hub/financed-emissions` | ALQUID NZ embed shell · placeholder until URL connected |
| `/disclosure-hub/net-zero-trajectory` | ALQUID NZ embed shell · placeholder |
| `/design` | In-app design system reference · tokens + 10 `@e60/ui` primitives with variants |

Press **⌘K** (or **Ctrl+K**) anywhere inside the shell to open the global command palette — searches routes, datapoints, NACE sectors, emission factors and disclosures.

## Stack

- **Framework** Next.js 15 App Router · React 19 · TypeScript 5.6 (strict)
- **Styling** Tailwind CSS 3.4, design tokens in `packages/ui/src/tokens` re-exported as a Tailwind preset in `@e60/config/tailwind`
- **Monorepo** pnpm 9.12 workspaces · `apps/web` + 4 packages
- **State** TanStack Query (server, ready for backend integration) · Zustand (client) · Zod (validation)
- **Charts** Recharts · D3 reserved for Climate Lab
- **Tables** TanStack Table v8 + `@tanstack/react-virtual` for the 1,184-row repository

## Repo layout

```
.
├── apps/web/                              # the Next.js app
│   ├── app/(shell)/<modulo>/              # routes that share the chrome (sidebar / topbar)
│   ├── app/design/                        # standalone design system reference
│   ├── components/
│   │   ├── shell/                         # SidebarPrimary, SidebarSecondary, Topbar, AiLauncher
│   │   ├── hub/<modulo>/                  # per-module compositions (overview, repository, ...)
│   │   ├── cmd-k/                         # global ⌘K palette
│   │   ├── datatable/                     # virtualised TanStack table primitive
│   │   └── embeds/                        # EngineEmbed iframe shell (ALQUID NZ etc.)
│   └── data/seed/                         # datapoints / nace-sectors / industry-materiality / emission-factors
├── packages/
│   ├── ui/                                # design system primitives (Tag, Panel, Drawer, ...)
│   ├── domain/                            # ESG types (frameworks, datapoints, materiality, emissions, ...)
│   ├── api-client/                        # typed fetch + MSW handlers (placeholder)
│   └── config/                            # Tailwind preset, tsconfig base, eslint
├── _mockups/                              # original HTML reference (don't delete until polish phase closes)
├── MIGRATION.md                           # per-phase status of the HTML→React migration
└── CLAUDE.md                              # project brief for AI assistants
```

## Running locally

Requires Node 20.11+ and pnpm 9+.

```bash
corepack enable && corepack prepare pnpm@9.12.0 --activate
pnpm install
pnpm dev                  # http://localhost:3000
```

Other scripts:

```bash
pnpm build                # next build (recursive across packages)
pnpm type-check           # tsc --noEmit across all packages
pnpm lint                 # eslint
pnpm format               # prettier --write .
```

CI runs `pnpm type-check` + `pnpm build` on every push to `main` and on every pull request — see [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Environment

`apps/web/.env.local`:

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | FastAPI backend base URL (when wired) |
| `NEXT_PUBLIC_TENANT` | tenant id for multi-tenant deployments (single-tenant in dev) |
| `NEXT_PUBLIC_ALQUID_NZ_BASE_URL` | when set, the financed-emissions and net-zero-trajectory routes embed `${BASE}/embed/{view}` via iframe; placeholder otherwise |

See [`apps/web/.env.example`](apps/web/.env.example).

## Architectural decisions

**Monorepo via pnpm workspaces.** `apps/web` depends on the four internal packages. Lets the future modules (Pillar III, Climate Lab) reuse design tokens + domain types without duplicating code.

**Design system in `@e60/ui` (shadcn copy-in).** Primitives are based on shadcn/ui but copied into the repo, not pulled from npm. We own the source for client security audits, can modify any primitive without waiting for a release, and avoid minor-version drift.

**Server components by default.** Client islands only where interactivity is real (drawers, palettes, charts, drag-drop). Keeps initial bundle small for banking environments with restricted connectivity.

**Domain types are first-class.** `packages/domain` carries the TypeScript types for ESRS topics, datapoints, framework mappings, materiality, PCAF asset classes and emissions inventory. No string-typed primitives for ESG concepts.

**External engines embed, native engines ship inline.** ALQUID NZ (financed emissions, PCAF) and CBAM are separate products; they embed via the `EngineEmbed` shell. Carbon Intelligence (operational GHG, Scope 1+2+3 own ops) is built natively here. The split is documented in [`MIGRATION.md`](MIGRATION.md).

**API contract via OpenAPI.** The future FastAPI backend produces an OpenAPI 3.1 spec; `packages/api-client` regenerates types from it via `openapi-typescript`. Until then, the app reads from JSON seeds in `apps/web/data/seed/` (1,184 EFRAG datapoints, 52 NACE sectors, 232 industry materiality rows, 41 emission factors).

## Migration status

Phases 0 through 6 of the original HTML→React migration are shipped. Carbon Intelligence was added on top as a native module. Phase 7 polish is partial. Backend wiring is the next big foundational step. Full breakdown in [`MIGRATION.md`](MIGRATION.md).

## Working with the AI

Project-level brief for Claude / Cursor / Copilot is in [`CLAUDE.md`](CLAUDE.md). It covers stack, commands, conventions and the embed-vs-native split. Worth pasting into your tool's context when starting a session.
