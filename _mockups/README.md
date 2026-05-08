# Mockups · visual reference

This folder contains the HTML mockups that designed the product before React migration began. **Do not delete these files** — they are the source of truth for visual design decisions until each route is fully migrated.

## Files

- `disclosure-hub.html` — Disclosure Hub v4 with all 5 views (Overview, Repository, Materiality Studio with 4 sub-tabs, Financed Emissions, Output Generators) and the Open Disclosure drawer.

## How to use

Open the HTML file directly in a browser to see the design intent for any view. When migrating a view to React, **replicate exactly** the visual output of the mockup. Design tokens, spacing, colors, and component composition are non-negotiable — they have been refined through several iterations and validated.

If a tweak is needed during migration, update the design tokens in `packages/ui/src/tokens/index.ts` rather than diverging the React implementation from the mockup. The mockup itself can also be updated to keep the two in sync.

## What's NOT in the mockup

The HTML mockups are static and don't have:
- Real data fetching (everything is hardcoded)
- Form validation
- Loading states / skeletons
- Error states
- Real authentication

These are added during React migration. The mockup tells you **what it should look like**; the React code adds **how it actually works**.
