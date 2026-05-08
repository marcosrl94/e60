# E6.0 — Frontend

ESG platform for European banks. Built by Nfq Advisory.

## Stack

- **Framework** Next.js 15 with App Router · React 19 · TypeScript 5.6
- **Styling** Tailwind CSS 3.4 + shadcn/ui (copy-in components)
- **Monorepo** pnpm workspaces · Turborepo for build cache (optional)
- **Data** TanStack Query (server state) · Zustand (client state) · Zod (validation)
- **Charts** Recharts (most charts) · D3 (specific visualizations in Climate Lab)
- **Tables** TanStack Table v8

## Layout

```
e60-frontend/
├── apps/
│   └── web/                            # Next.js application
│       ├── app/                        # App Router pages
│       │   └── (shell)/                # Routes that share the app shell
│       │       ├── disclosure-hub/     # Hub module (6 sub-views)
│       │       ├── pillar-iii/
│       │       ├── climate-lab/
│       │       ├── sustainable-finance/
│       │       ├── data-layer/
│       │       └── trust-center/
│       └── components/
│           ├── shell/                  # Sidebar primary, sidebar secondary, topbar
│           └── hub/                    # Hub-specific compositions
├── packages/
│   ├── ui/                             # Design system (E6.0 components)
│   │   ├── src/primitives/             # Button, Input, Tabs, Drawer (shadcn-based)
│   │   ├── src/components/             # KpiCard, Panel, ActivityCol, Sparkline...
│   │   ├── src/tokens/                 # Design tokens (TS)
│   │   └── src/icons/                  # E6.0 icon set
│   ├── domain/                         # Domain types (ESG-specific)
│   │   └── src/{frameworks,datapoints,disclosures,materiality,pcaf}/
│   ├── api-client/                     # Typed API client (regenerated from OpenAPI)
│   └── config/                         # Shared configs
│       ├── tailwind/                   # Tailwind preset (NFQ tokens)
│       ├── typescript/                 # tsconfig base
│       └── eslint/                     # ESLint config
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Setup

Requires Node 20.11+ and pnpm 9+.

```bash
# install pnpm if you don't have it
corepack enable
corepack prepare pnpm@9.12.0 --activate

# install dependencies
pnpm install

# run dev server
pnpm dev

# build all packages
pnpm build

# type-check across the monorepo
pnpm type-check
```

The web app runs at `http://localhost:3000`.

## Architectural decisions

### Monorepo via pnpm workspaces

Single repository with multiple internal packages. `apps/web` depends on `packages/ui`, `packages/domain`, `packages/api-client`. This lets us share design tokens and domain types across the future modules of E6.0 (Pillar III, Climate Lab, etc.) without duplicating code.

### Design system in `packages/ui`

Components are based on **shadcn/ui** but **copied into our repo** rather than imported from npm. This is a deliberate choice for a banking client product:
- We own the source code (relevant for client security audits)
- We can modify any primitive without waiting for a library release
- No version drift between minor releases

The full list of design tokens is in `packages/ui/src/tokens/index.ts` and re-exported as Tailwind theme extensions in `packages/config/tailwind/preset.ts`.

### Server Components by default

App Router with React 19 Server Components. Client components are only used where interactivity is required (drawers, charts, drag-and-drop). This keeps initial bundle size low — relevant for banking environments with restricted connectivity.

### Domain types are first-class

`packages/domain` contains TypeScript types for ESG-specific concepts (datapoint, framework mapping, ESRS topic, IRO, PCAF asset class). These types are the contract between UI and data, and are used both client-side and (in the future) server-side. No string-typed domain primitives.

### API integration

The API contract is **OpenAPI-generated**. The backend (FastAPI, separate repo) produces an OpenAPI 3.1 spec; we run `openapi-typescript` against it to generate `packages/api-client/src/types.ts`. TanStack Query hooks wrap typed fetch calls.

If the backend is not ready yet, `packages/api-client/src/mock` provides MSW handlers for local development.

## Migration from HTML mockups

The current HTML mockups (`E6.0_disclosure_hub_v3.html` and predecessors) live in `_mockups/` (kept as visual reference). The migration sequence is:

1. **Phase 0** — design tokens + Tailwind preset + Storybook setup
2. **Phase 1** — shell components (Sidebar1, Sidebar2, Topbar, AppLayout)
3. **Phase 2** — Hub Overview (KpiCard, Panel, ActivityColumn, Donut, Chart)
4. **Phase 3** — Datapoint Repository + drawer pattern
5. **Phase 4** — Financed Emissions
6. **Phase 5** — Output Generators
7. **Phase 6** — Materiality Studio (most complex, built directly in React)

Each phase is a milestone with Storybook coverage and visual regression tests (Chromatic recommended).

## Next steps

- [ ] `pnpm install` after cloning
- [ ] Set `NEXT_PUBLIC_API_BASE_URL` in `apps/web/.env.local`
- [ ] Run `pnpm dev` and verify the demo route at `/disclosure-hub/overview`
- [ ] Add Storybook to `packages/ui`: `pnpm dlx storybook@latest init`
- [ ] Initialize shadcn/ui: `cd packages/ui && pnpm dlx shadcn@latest init`
