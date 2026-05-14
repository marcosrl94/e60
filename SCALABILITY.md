# E6.0 · Plan de Escalabilidad — From Scratch to Hero

*Mayo 2026 · Plan holístico de los 6 módulos · horizonte 8–10 meses · benchmark Workiva + Watershed + Climate X*

---

## TL;DR

E6.0 hoy tiene **un módulo en producción** (Disclosure Hub, Phases 0–6 + Carbon Intelligence) y **cinco esqueletos** (Pillar III, Climate Lab, Sustainable Finance, Data Layer, Trust Center — todos `page.tsx` con <50 líneas excepto Trust Center que tiene un audit-log stub a 235 líneas).

Para llevar la plataforma a tier-1 banca, el plan se ordena en **9 phases nuevas** (Phase 7 → 15):

| # | Phase | Módulo / Capa | Semanas |
|---|---|---|---|
| 7 | Cross-cutting Foundation | Auth · multi-tenant · MSW · Storybook · i18n · audit primitive · Phase-7 polish | 4–6 |
| 8 | Disclosure Hub Pro | Lineage · evidence vault · workflow · CI wizard · output generator real | 4–6 |
| 9 | Data Layer | Sources · ingestion · pipelines · quality · lineage explorer | 5–7 |
| 10 | Trust Center | Audit maduro · controls · RBAC · approvals · auditor pack | 3–5 |
| 11 | Pillar III | EBA templates · capital ratios · sign-off · XBRL export | 5–7 |
| 12 | Climate Lab | Physical risk maps · NGFS scenarios · stress test SREP · TNFD | 6–8 |
| 13 | Sustainable Finance | EU Taxonomy · SFDR PAI · CBAM embed · SLB tracker | 5–7 |
| 14 | Cross-module orchestration | cmd+K · AI assistant · exec dashboard · crosswalk · peer benchmarking | 3–4 |
| 15 | GA Banca readiness | Perf · security · SOC2/ISO · pilots · docs · i18n nativo | 4–6 |

**Total: 39–56 semanas (≈ 9–13 meses)** según paralelización. Crítico: **Phase 7 desbloquea todo lo demás**, **Phase 9 (Data Layer) es upstream** de todos los módulos de negocio, **Phases 11–13 pueden paralelizarse** una vez Phase 9 termine.

**Filosofía:** primero foundation (auth/tenant/quality), luego producto (módulos en orden de leverage técnico y valor regulatorio banca), después diferenciación (AI + benchmarking) y GA.

---

## 0. Lectura del estado actual

### 0.1 Lo que ya es sólido (no tocar)

- **Foundation técnica:** monorepo pnpm (4 packages), design tokens, Tailwind preset, shell (Sidebar primary/secondary/topbar/AiLauncher), 10+ primitives en `@e60/ui` (KpiCard, Sparkline, Panel, Tag, FrameworkChip, ActivityColumn, DonutCard, ComingSoon, Drawer, SubTabs).
- **Disclosure Hub Phases 0–6:** Overview, Repository (1184 datapoints EFRAG IG3), Drawer (5 tabs), Financed Emissions placeholder, Outputs (6 SVG previews), Materiality (52 NACE + 232 industry rows + override modal).
- **Carbon Intelligence:** 4 sub-tabs, 41 factores MITECO/IDAE/DEFRA, factor picker con unit conversion live, tCO₂e preview.
- **Tipos de dominio:** `frameworks`, `datapoints`, `disclosures`, `materiality`, `pcaf`, `emissions`, `audit` (stub trust-center).
- **CI:** GitHub Actions con typecheck + build.

### 0.2 Lo que duele y bloquea escalado

| Síntoma | Bloquea |
|---|---|
| `app/providers.tsx` sin `QueryClientProvider` real, MSW handlers placeholder | Backend integration de cualquier módulo |
| No hay auth, no hay multi-tenant, no hay i18n | Cualquier piloto banca tier-1 |
| Datapoints sin `value` / `status` / `owner` / `lineage` / `evidence` | Auditor no aprueba nada → no se vende |
| 5 módulos en stub (`<ComingSoon>` o page.tsx <50 líneas) | El producto se ve como "Disclosure Hub con marketing alrededor" |
| Sin Storybook ni regresión visual | Onboarding de devs lento, design system sin contrato |
| Sin audit log cross-module maduro, sin RBAC, sin approvals | Trust Center vacío → compliance team del banco lo rechaza |

### 0.3 Decisiones que arrastra el plan (cerradas)

- **ALQUID NZ = embed externo** vía `EngineEmbed` + `NEXT_PUBLIC_ALQUID_NZ_BASE_URL`. E6.0 no recomputa PCAF, presenta.
- **Carbon Intelligence = nativo** (Scope 1+2+S3 cat 1–14). Scope 3.15 financiado va a ALQUID NZ.
- **CBAM = futuro embed** como `packages/cbam-engine` + sub-ruta dentro de Sustainable Finance.
- **shadcn copy-in** (no npm dep) para ownership banca.
- **Server Components por defecto**, client sólo donde haya interactividad real.

---

## 1. Secuencia óptima y rationale

El orden no es arbitrario. Estos son los pesos que lo justifican:

1. **Foundation enabler primero** — sin auth, multi-tenant y providers reales no se puede vender ni testear seriamente con un banco. Phase 7 es no-negociable como primer paso.
2. **Data Layer es upstream de todo** — si lo dejamos para el final, los 4 módulos de arriba se construyen con mocks que después hay que reescribir. Ponerlo en Phase 9 (justo después del Hub Pro) significa que Pillar III, Climate Lab y SF nacen ya conectados a sources reales.
3. **Reuso de primitives ordena el resto** — Pillar III reusa Datapoint + Drawer + Repository pattern del Hub casi 1:1. Trust Center reusa el `audit` primitive que se define en Phase 7. Climate Lab y SF requieren más net-new (mapas D3, alignment engine), así que van más tarde.
4. **Valor regulatorio banca** — Pillar III (EBA) es regulatorio crítico para todo banco UE → sale antes que Climate Lab (regulatorio pero más SREP-driven) y antes que Sustainable Finance (más comercial/SFDR).
5. **Embeds externos al final** — ALQUID NZ wire-in + CBAM dependen de equipos externos; cerrar la lista con ellos minimiza el riesgo de dependencia.
6. **AI y diferenciación después de feature parity** — Phase 14 (AI assistant, peer benchmarking) sólo tiene sentido cuando hay 5–6 módulos con datos reales debajo.

**Paralelización:** Phase 11 (Pillar III), Phase 12 (Climate Lab) y Phase 13 (Sustainable Finance) se pueden trabajar en paralelo a partir del fin de Phase 9, si hay capacity. Phase 10 (Trust Center) puede correr en paralelo a Phase 11 sin conflictos.

---

## 2. Patrón estándar por módulo

Cada módulo (Phases 8–13) sigue la **misma plantilla de sub-fases**, derivada de cómo se construyó Disclosure Hub:

```
M.0  Scaffolding         · ruta (shell)/<modulo>/ · SidebarSecondary · domain types · MSW handlers
M.1  Overview            · greeting · KPI row · trend chart · activity panel
M.2  Core list/repo      · TanStack table virtualizada · filtros · sticky detail
M.3  Detail/drawer       · Drawer con tabs · lineage · history · comments
M.4  Workflow & evidence · Draft→Review→Approve→Lock · evidence vault binding
M.5  Cross-module wiring · feeds Hub datapoints · audit hooks · sources del Data Layer
M.6  Output & export     · output generator real (PDF/XBRL/Word según módulo)
M.7  Polish              · skeletons · error boundaries · empty states · a11y · Storybook stories
```

No todos los módulos necesitan los 8 pasos completos: Trust Center salta M.2 (no es list-driven), Climate Lab añade un M.2bis para mapas D3, etc. Pero el esqueleto es el mismo.

**Primitives reutilizables que se afilan en cada módulo:**

| Primitive | Nace en | Madura en | Final state |
|---|---|---|---|
| `Datapoint` + `Lineage` | Hub (Phase 8) | Pillar III (P11) | Foundation transversal |
| `EvidenceVault` | Hub (P8) | Trust Center (P10) | Cross-module file API |
| `Workflow` (Draft/Review/Approve/Lock) | Hub (P8) | Trust Center (P10) | Configurable por entidad |
| `AuditEvent` | Trust Center stub | Phase 7 → P10 | Streamable a sink externo |
| `RBAC` / `useCanWrite` | Phase 7 | P10 + todos | Policy-as-code |
| `Pipeline` / `IngestionRun` | Data Layer (P9) | — | Engine de ETL ligero |

---

## 3. Phase 7 · Cross-cutting Foundation (4–6 semanas)

**Objetivo:** que cualquier módulo nuevo pueda nacer ya con auth, multi-tenant, i18n, MSW, audit y permisos sin reinventarlos.

> Sin Phase 7 cerrada, **no se empieza Phase 9 en adelante**. Phase 8 puede arrancar en paralelo si el track 7.7–7.9 lo hace otra persona.

### 7.1 · App Router providers reales · **S**
- `apps/web/app/providers.tsx` con `<QueryClientProvider>`, `<HydrationBoundary>`, `<ErrorBoundary>`, `<ToastProvider>`, `<TenantProvider>`, `<AuthProvider>`, `<I18nProvider>`.
- AC: SSR funciona sin warnings, devtools de TanStack Query en `NODE_ENV=development`.

### 7.2 · MSW handlers completos · **M** · `packages/api-client/src/mock/`
- Handlers para todos los endpoints existentes en el Hub (datapoints, materiality, carbon-intelligence) más los placeholders de los módulos por venir.
- Fixtures realistas (no Lorem ipsum): 1184 datapoints con valores demo, 232 materiality rows, 500 CI entries.
- Setup en dev + en CI (`pnpm test` los usa).
- AC: `apps/web` arranca sin backend, todas las rutas pintan datos coherentes.

### 7.3 · Auth & SSO · **L** · `packages/auth` (nuevo)
- Auth.js (NextAuth v5) con providers: Azure AD / Google Workspace / Okta SAML / Generic OIDC.
- MFA (TOTP) y idle timeout configurable.
- Session en cookie httpOnly + refresh token rotation.
- Roles base: `Viewer` / `Contributor` / `Approver` / `Admin` / `Auditor`.
- AC: login real contra un IdP de pruebas (Auth0 free tier o Keycloak local), `useSession()` disponible en cualquier client component.

### 7.4 · Multi-tenant context · **M** · `packages/auth` + middleware
- `<TenantProvider>` que lee `tenantId` de la sesión.
- Middleware Next que inyecta `x-tenant-id` en cada call a la API.
- `useTenant()` hook + `<TenantGuard>` para rutas privadas.
- Backend: cliente API (`@e60/api-client`) inyecta automáticamente el header.
- AC: cambiar tenant en la UI cambia los datos visibles sin recargar; intentar acceder a `/disclosure-hub` sin sesión redirige a `/login`.

### 7.5 · i18n con `next-intl` · **M** · `apps/web/messages/` + `packages/ui`
- Scaffold `next-intl` con 5 locales: `es`, `en`, `de`, `fr`, `it`.
- Namespaces por módulo (`disclosure-hub`, `pillar-iii`, …, `common`, `auth`).
- Migrar el mix español/inglés actual del Hub a `en` como default y `es` como locale completo.
- Otros 3 idiomas: scaffold + traducción de `common` + auth + sidebar (resto se trabaja en Phase 15).
- AC: switcher de idioma en el topbar; las 6 rutas principales del Hub renderizan en `es` y `en` sin fallback warnings.

### 7.6 · Audit primitive · **M** · `packages/domain/src/audit.ts` + sink
- Tipos: `AuditEvent = { id, tenantId, userId, module, entity, entityId, action, before?, after?, at, ip?, userAgent? }`.
- Cliente: `audit.track(event)` que postea async a `/api/audit` (con buffer + retry).
- Hook `useAuditTrail(filter)` que lee desde Trust Center sink.
- Cobertura inicial: capturar writes en CI entries, materiality overrides, drawer comments.
- AC: cualquier mutación en el Hub aparece en `/trust-center` < 2 s.

### 7.7 · Storybook + Chromatic · **M** · `packages/ui/.storybook/`
- Storybook 8 con autodocs.
- Stories para todos los primitives existentes (KpiCard, Sparkline, Panel, Tag, FrameworkChip, ActivityColumn, DonutCard, Drawer, SubTabs, ComingSoon) + las composiciones del Hub más reutilizables.
- Chromatic en CI sobre `main` y PRs (visual regression budget < 0.1%).
- AC: `pnpm --filter @e60/ui storybook` arranca, `pnpm chromatic` pasa en CI.

### 7.8 · Phase-7 polish del Hub (legacy pending) · **M**
- Skeleton loaders por ruta del Hub.
- Error boundaries con fallback friendly.
- Empty states con CTA en datapoints sin valor, disclosures sin DPs, CI inventory vacío.
- a11y pass: focus rings consistentes, contraste AA en chips de estado, navegación teclado en drawer + matrix.
- AC: Lighthouse a11y ≥ 95 en las 6 rutas del Hub.

### 7.9 · cmd+K palette primitive · **M** · `packages/ui/src/components/CommandPalette.tsx`
- Wrapper sobre `cmdk` (o copy-in).
- Hooks `useCommand({ id, title, run, scope, keywords })` para que cada módulo registre sus propios comandos.
- Búsqueda: navegación entre rutas, "Open datapoint by ID", "Add CI entry", `?` para shortcuts.
- AC: `cmd+K` abre overlay, búsqueda incremental, Enter ejecuta, Esc cierra.

### 7.10 · Permissions hooks · **S** · `packages/auth/src/permissions.ts`
- `useCanWrite(entity)`, `useCanApprove(entity)`, `<RequireRole role="Approver">`.
- Policies declarativas: `policies/disclosure-hub.ts`, `policies/pillar-iii.ts`, etc.
- Hint en UI: botones disabled con tooltip "Necesitas rol Approver" en lugar de ocultarlos.
- AC: como `Viewer` el botón "Edit value" está disabled con tooltip; como `Contributor` está enabled.

### 7.11 · CI/CD hardening · **S**
- Añadir steps en `.github/workflows/ci.yml`: lint, test, type-check, build, Storybook build, Chromatic, bundle-size check (`size-limit`).
- Conventional commits + changesets para versionar `packages/*`.
- Preview deploys con Vercel (o equivalente) por PR.

**Definition of Done Phase 7:** un nuevo módulo (placeholder vacío) hereda automáticamente auth, tenant, i18n scaffold, audit, permissions hooks y MSW handler. Tarda < 1 día en estar listo para empezar M.0.

---

## 4. Phase 8 · Disclosure Hub Pro (4–6 semanas)

**Objetivo:** que el Hub deje de ser "lista de datapoints bonita" y se convierta en **el centro de mando con linaje, evidencia, workflow y output real**. Es la evolución del [sprint plan que vivía aquí antes](#anexo-a--sprint-detallado-disclosure-hub-pro).

### 8.1 · Lineage model · **S** · `packages/domain/src/lineage.ts`
- `DatapointLineage = { source: 'manual' | 'computed' | 'carbon-intel' | 'data-layer' | 'pillar-iii' | 'external'; sourceRef?: string; lastUpdatedAt; lastUpdatedBy; valueHistory: Array<{value, at, by}> }`.
- Extiende `Datapoint` con `value`, `unit`, `period`, `status: 'empty' | 'draft' | 'review' | 'approved' | 'locked'`, `owner`, `evidenceCount`, `lineage`.

### 8.2 · Drawer con valor + linaje · **M**
- Tab 1 "Datapoints" enriquecido: value + unit + status chip + source badge + owner avatar + evidence count.
- Nuevo tab "Lineage" (reemplaza o complementa "Mapping"): grafo simple source → transformation → value, con timestamp y user.
- Tab "History" lee de `lineage.valueHistory`.

### 8.3 · Repository operativo · **M**
- Columnas: Value, Status (chip), Source (badge), Owner (avatar), Evidence (icon + count), Updated (relative).
- Filtros nuevos: `status`, `source`. Mantener virtualización TanStack.

### 8.4 · Output Preview real · **M**
- Click en disclosure card → vista preview side-by-side: árbol de datapoints (izq) + render narrativo ESRS con `{{datapoint}}` resueltos (der).
- Datapoints vacíos en rojo, hover ↔ resaltado.
- Botón "Export PDF" stub (8.8 lo materializa).

### 8.5 · Workflow Draft→Review→Approve→Lock · **L**
- State machine en `@e60/domain/workflow.ts` con guards.
- UI: status chip clickable que abre transitions permitidas según rol.
- `Approver` puede mover a Locked; sólo `Admin` puede unlock.
- Audit hook por transición.

### 8.6 · Evidence Vault primitive · **L** · `packages/ui/src/components/EvidenceVault.tsx` + `packages/domain/src/evidence.ts`
- `EvidenceItem = { id, name, type: 'doc'|'screenshot'|'formula'|'link', size?, uploadedAt, uploadedBy, sha256 }`.
- Storage: S3-compatible (MinIO en dev) vía signed URLs.
- Bindable a `Datapoint`, `CIEntry`, `Pillar3Cell`, `Control`.
- UI: drop zone + preview (img/pdf) + meta + delete con audit.

### 8.7 · CI · wizard 3 pasos + bulk CSV + PCAF DQR + binding · **L**
Heredado del sprint plan original (Tracks B + C):
- `<ActivityEntryWizard>` con Scope → Activity & Factor → Quantity/Period/Source/Evidence.
- Footer live: tCO₂e + uncertainty + PCAF DQR estimado.
- Inventory TanStack table sortable/filterable con inline-edit de quantity.
- CSV importer (4 steps Upload→Map→Validate→Commit).
- `dataPointBinding` automático (Scope 1 → E1-6_scope1).
- "Used in disclosures" en el drawer del datapoint.

### 8.8 · Output Generator real · **L** · `packages/output-engine` (nuevo)
- Engine que compone narrativa ESRS + datapoints + evidence:
  - Output PDF (vía `react-pdf` o `puppeteer` server-side).
  - Output Word (`docx` via `docx` lib).
  - Output XBRL ESEF para CSRD (vía `xbrl-js` o spec custom).
- Templates por disclosure (E1, E2, …, G1) en `apps/web/templates/`.

### 8.9 · AI-assisted narrative · **M** · `apps/web/app/api/ai/narrative/route.ts`
- Server route que llama a Claude/OpenAI con system prompt ESRS-aware + contexto del banco + datapoints.
- UI: botón "Draft narrative" en cada tab "Narrative" del drawer.
- Editor inline con review (no auto-commit, siempre revisable).
- Guardrails: nunca inventa números, sólo redacta sobre los datapoints provistos.

**Definition of Done Phase 8:** un usuario puede abrir cualquier datapoint, ver su valor + linaje completo + evidencia, mover el datapoint por el workflow, ver el preview de la disclosure compuesta en vivo, exportar a PDF/Word/XBRL y pedir al asistente que redacte el narrativo.

---

## 5. Phase 9 · Data Layer (5–7 semanas)

**Objetivo:** materializar el módulo más upstream — fuentes de datos, ingestion, calidad, linaje. **Todos los módulos siguientes lo consumen.**

### 9.0 · Scaffolding · **S**
- `apps/web/app/(shell)/data-layer/{overview,sources,pipelines,quality,lineage}/page.tsx`.
- Sidebar secondary con 5 entradas.
- Domain en `packages/domain/src/data-layer.ts`: `DataSource`, `Connector`, `IngestionRun`, `Pipeline`, `PipelineStep`, `QualityRule`, `QualityResult`, `LineageNode`, `LineageEdge`.
- MSW handlers con fixtures.

### 9.1 · Overview · **M**
- KPI row: # sources, # active pipelines, % data fresh (<24h), avg quality score, # quality alerts.
- Trend chart: ingestion volume + error rate por semana.
- Activity panel: "Recent ingestion runs" / "Failed checks" / "New sources".

### 9.2 · Sources catalogue · **M**
- TanStack table de `DataSource` (ERP, manual upload, API connector, CSV/Excel, IoT/utility, internal DB).
- Filtros: tipo, owner, status (healthy/degraded/down), last sync.
- Sticky detail panel: schema, last run, owner, schedule, depends-on.

### 9.3 · Source detail + connectors · **L**
- Drawer con tabs: Schema, Runs, Quality, Lineage, Settings.
- Connector wizard para añadir source nueva: tipo → credenciales → schema discovery → preview → schedule.
- Connectors mínimos: HTTP/REST, S3 CSV, Postgres, SAP RFC stub, Salesforce stub, manual upload.

### 9.4 · Pipelines (DAG visual) · **L**
- Visualización del DAG (React Flow): nodes = pipeline steps (extract, transform, validate, load), edges = dependencias.
- Status por step: success / running / failed / skipped.
- Click step → logs + retry + skip.
- "Promote to production" button en cada pipeline.

### 9.5 · Quality rules engine · **L**
- `QualityRule = { id, sourceId | datapointId, type: 'not-null'|'unique'|'range'|'regex'|'custom-zod', config, severity }`.
- Editor UI: form para crear regla por source o por datapoint.
- Runner: ejecuta rules en cada ingestion + diaria.
- Anomaly detection inline: z-score sobre `valueHistory`.
- Quality dashboard: scorecard por source, completeness/freshness/validity gauges.

### 9.6 · Lineage Explorer · **M**
- Vista interactiva (React Flow o D3 force) del grafo completo: `DataSource → Pipeline → Datapoint → Disclosure`.
- Click en cualquier nodo → drawer con detalle + audit trail.
- Filtros: por módulo destino (Hub, Pillar III, Climate Lab…), por source.
- Bidireccional: dado un datapoint, hacer backwards-trace hasta su raíz.

### 9.7 · Cross-module wiring · **M**
- Reemplazar mocks: Hub datapoints leen `source: 'data-layer'` con `sourceRef` real.
- CI entries pueden tener `source: 'data-layer'` (utility bill ingested).
- Pillar III KPIs (capital ratios) leen GL / risk DWH a través del Data Layer.
- Climate Lab counterparty data desde core banking.
- SF portfolio data desde lending system.

### 9.8 · Polish · **S**
- Storybook stories para `LineageGraph`, `PipelineDAG`, `QualityScorecard`.
- a11y + skeletons + error boundaries.

**Definition of Done Phase 9:** todos los demás módulos pueden registrar sus inputs como sources en el Data Layer; cualquier número en el sistema se puede trazar bidireccionalmente hasta su origen.

---

## 6. Phase 10 · Trust Center (3–5 semanas)

**Objetivo:** convertir el stub actual (`page.tsx` con audit-log básico) en el módulo de gobierno: auditoría completa, controles, RBAC visualizado, approvals, certificaciones.

### 10.0 · Scaffolding · **S**
- Rutas: `/trust-center/{audit-log, controls, roles, approvals, certifications, exports}`.
- Domain: `Control`, `ControlEvidence`, `Role`, `Permission`, `ApprovalRequest`, `Certification`.

### 10.1 · Audit Log maduro · **M**
- TanStack table virtualizada sobre `AuditEvent` con filtros: módulo, user, periodo, acción, entidad.
- Drawer detalle con diff `before`/`after` (JSON viewer).
- Export JSON/CSV time-bound.
- Cryptographic chaining: cada evento hashea el anterior (`sha256(prev_hash + event_json)`). Verificable.

### 10.2 · Controls Catalog · **M**
- Seed: SOC 2 Trust Services Criteria (CC1–CC9), ISO 27001 Annex A (93 controls v2022), DORA (chapters II–V), GDPR articles relevantes.
- Vista list + detail con: descripción, frecuencia (continuous/quarterly/annual), owner, status (operating/exception/not-tested), last test.
- Binding a `EvidenceVault` items (cada control → N evidencias).

### 10.3 · RBAC visualizer + role management · **M**
- Vista de matriz: Roles × Permissions por módulo.
- Editor de roles custom (por encima de los 5 base).
- User → roles assignment (con audit).
- Effective permissions inspector ("what can user X do in Pillar III?").

### 10.4 · Approval workflow viewer · **M**
- Cola global de `ApprovalRequest` pending del usuario actual y del tenant.
- Tipos: datapoint approval, materiality override, disclosure lock, Pillar III sign-off, control deficiency response.
- Cards con SLA timer + escalation path.
- Bulk approve para approver.

### 10.5 · Compliance Dashboard · **M**
- KPI: % controls operating, % evidence current, # open audit findings, # exceptions, days to next external audit.
- Heatmap controls × frameworks.
- Burndown de findings.

### 10.6 · Auditor Export Pack · **M**
- Wizard: seleccionar periodo + módulos + tipo de evidencia → genera ZIP con:
  - `audit-log.json` time-bound + hash chain verification.
  - `evidence/` (todos los items vinculados).
  - `controls.pdf` testing summary.
  - `signatures.json` (workflow approvals).
- AC: pack reproducible byte-a-byte para el mismo periodo.

### 10.7 · Certifications surface · **S**
- Cards públicos de status SOC 2 / ISO 27001 / DORA / future PCI.
- Last audit date + auditor + next renewal.

### 10.8 · Polish · **S**

**Definition of Done Phase 10:** auditor externo del banco puede entrar al tenant del cliente, generar el pack, y verificar la hash chain sin pedir nada al equipo de E6.0.

---

## 7. Phase 11 · Pillar III (5–7 semanas)

**Objetivo:** módulo banking-critical regulatorio. Reusa máximo del Hub. Hoy ya existe placeholder en `apps/web/app/(shell)/disclosure-hub/pillar-iii/` (route legacy) — Phase 11 lo promueve a módulo top-level.

> Reuso de Phase 8: `Datapoint`, `Drawer`, `Repository`, `Workflow`, `EvidenceVault`, `OutputEngine`.

### 11.0 · Scaffolding · **S**
- `/pillar-iii/{overview, templates, capital, liquidity, esg, sign-off}/page.tsx`.
- Domain: `PillarIIITemplate`, `PillarIIICell`, `CapitalRatio`, `LiquidityRatio`, `EBADisclosure`.

### 11.1 · Overview · **M**
- KPI row: CET1, Tier 1, Total Capital, Leverage Ratio, LCR, NSFR.
- Trend chart 12 meses con threshold lines (minimum + Pillar 2 requirement + management buffer).
- Activity panel: "Recent template updates" / "Pending sign-offs" / "Threshold breaches".

### 11.2 · Templates Repository · **M**
- Seed: EBA ITS on Pillar 3 disclosures v2024:
  - **Risk-weighted exposures**: CR1, CR2, CR3, CR4, CR5–CR10.
  - **Market risk**: MR1–MR4.
  - **Operational risk**: OR1–OR3.
  - **Leverage**: LR1–LR3.
  - **Liquidity**: LIQ1, LIQ2.
  - **ESG**: P3 ESG templates 1–5 (Banking Book Taxonomy, Mitigating Actions, Banking Book GAR, BTAR, Transition Risk).
- TanStack table similar al `/disclosure-hub/repository`.
- Filtros: tipo de riesgo, periodicidad (quarterly/semi/annual), status.

### 11.3 · Template detail · **M**
- Drawer con tabs: Cells, Computation, History, Sign-off, Lineage.
- Cells: tabla de celdas EBA con valor + status + source + owner.
- Computation: fórmula EBA (markdown LaTeX) con inputs resueltos.
- Sign-off: workflow específico CFO → Risk → Auditor.

### 11.4 · Capital ratio engine · **L** · `packages/pillar3-engine` (nuevo)
- Computa CET1, T1, Total Capital y RWA basado en exposiciones + risk weights.
- Backtesting: serie histórica con override manual posible (con audit).
- Stress: cambia RWA inputs y muestra impacto en ratios.

### 11.5 · Liquidity tracker · **M**
- LCR y NSFR daily/monthly con drill-down a HQLA composition y net cash outflows.

### 11.6 · ESG Pillar III (5 templates) · **M**
- Re-uso fuerte del Hub: estos templates leen E1-6 (GHG financed), E1-7 (transition plan), exposures por NACE.
- Cross-link con Sustainable Finance (BTAR, GAR) — pero P11 puede ir antes; los enlaces se establecen cuando P13 termine.

### 11.7 · Sign-off workflow · **M**
- State machine extendida: Draft → CFO Review → Risk Review → Internal Audit → Locked → Submitted.
- Auditor role (read-only across all signed-off templates).
- 4-eyes principle enforceado (no puede aprobar quien preparó).

### 11.8 · Export EBA XBRL + PDF · **M**
- Output Engine extendido con plantillas EBA reporting framework (versión vigente).
- XBRL taxonomy validation antes de export.
- PDF con cover sheet + templates renderizados.

### 11.9 · Cross-module · **S**
- Pillar III ESG templates auto-pueblan desde Hub financed emissions + Sustainable Finance taxonomy alignment.
- Audit completo via `AuditEvent`.

### 11.10 · Polish · **S**

**Definition of Done Phase 11:** un banco puede preparar, revisar, firmar y exportar su Pillar III trimestral con la suite EBA completa sin salir de E6.0.

---

## 8. Phase 12 · Climate Lab (6–8 semanas)

**Objetivo:** módulo de análisis de riesgo climático físico y de transición + nature risk. **Net-new significativo** (mapas D3 + scenario engine). Hoy es `<ComingSoon>`.

### 12.0 · Scaffolding · **S**
- Rutas: `/climate-lab/{overview, physical-risk, transition-risk, stress-test, abatement, nature-risk}`.
- Domain: `Hazard`, `HazardScenario` (RCP 4.5/8.5, NGFS), `Counterparty`, `Geography`, `Exposure`, `ScenarioRun`, `AbatementCurvePoint`, `TNFDLeapStep`.
- Dep externa: Climate X (proveedor de hazard layers) o equivalente — decisión: licencia vs. open data (Copernicus, JRC).

### 12.1 · Overview · **M**
- KPI: % portfolio at risk (high climate VaR), expected loss climate scenario, top 5 hazards, # counterparties stress-tested.
- Trend chart: PnL impact por scenario over time.
- Activity: "Recent scenario runs", "Counterparties newly geocoded", "Abatement curves updated".

### 12.2 · Physical Risk Map · **L** · `apps/web/components/climate-lab/HazardMap.tsx` (client)
- Mapbox GL JS (o MapLibre + OpenMapTiles open data si la licencia es un problema banca).
- Layers de hazard (flood, heat, drought, wildfire, sea-level rise) con time slider (now / 2030 / 2050 / 2080).
- Portfolio overlay: counterparties como puntos con size = exposure, color = composite climate score.
- Click counterparty → drawer con drill-down.

### 12.3 · Counterparty geocoder + drill-down · **M**
- Tabla de counterparties con address → geocoded coords (server-side cache).
- Drawer: hazard exposure por counterparty (radar chart), historical loss data, mitigation actions.

### 12.4 · Transition Risk · **L**
- NGFS scenarios v5: Orderly, Disorderly, Hot House World, Below 2°C, Net Zero 2050.
- Sector impact engine: por sector (NACE), carbon price trajectory, demand shift.
- Portfolio impact: aplica trajectories a exposiciones del banking book.

### 12.5 · Climate Stress Test (SREP-ready) · **L**
- Engine que combina physical + transition + macro variables (GDP, unemployment).
- Output: PnL impact 1y/3y/5y por scenario, capital impact (CET1 delta).
- Comparable y exportable al modelo del regulador (ECB / BoE / EBA).
- Sign-off workflow + audit.

### 12.6 · Abatement curves · **M**
- Marginal Abatement Cost Curve (MACC) por sector financiado.
- Editor: añadir intervenciones (renovables, EV fleet, retrofit) con cost € / tCO₂e.
- Comparación pre/post intervención sobre el portfolio.

### 12.7 · Nature Risk (TNFD LEAP) · **M** (opcional, partir si scope aprieta)
- Locate → Evaluate → Assess → Prepare en 4 sub-pasos.
- Biodiversity & ecosystem services exposure (datasets WWF / IBAT).
- Output: TNFD-aligned disclosure.

### 12.8 · Output: Stress Test Memorandum · **M**
- Auto-generated PDF con metodología + assumptions + results + commentary.
- Editable narrative + AI assist (re-uso de Phase 8.9).

### 12.9 · Cross-module · **S**
- Climate Lab feeds Hub datapoints E1-1 (transition plan), E1-3 (actions), E1-9 (resilience), E1-MDR.
- Climate VaR alimenta Pillar III ESG template P3.5.

### 12.10 · Polish · **S**

**Definition of Done Phase 12:** un risk officer puede correr un climate stress test SREP-aligned end-to-end y exportar el memorandum sin necesidad de salir del módulo.

---

## 9. Phase 13 · Sustainable Finance (5–7 semanas)

**Objetivo:** módulo comercial-regulatorio. EU Taxonomy alignment, SFDR PAI, GAR/BTAR, SLB tracker, CBAM embed. Hoy es stub `page.tsx` con 5 líneas y sub-ruta `cbam` placeholder.

### 13.0 · Scaffolding · **S**
- Rutas: `/sustainable-finance/{overview, taxonomy, sfdr, gar-btar, slb, cbam}`.
- Domain: `TaxonomyActivity`, `TaxonomyAlignment` (SC + DNSH + MS), `SFDRMetric`, `FinancialProduct` (Art 6/8/9), `GreenAssetRatio`, `BTAR`, `SLBKPI`.

### 13.1 · Overview · **M**
- KPI: GAR, BTAR, % portfolio EU Taxonomy aligned, AUM SFDR Art 8 / Art 9, # SLBs active.
- Trend chart: alignment % over time.

### 13.2 · EU Taxonomy screener · **L**
- Seed: 6 environmental objectives × Delegated Acts activities (CCM, CCA, Water, Circular Economy, Pollution, Biodiversity) — v2024 con CDA / EDA.
- Portfolio classifier: counterparty NACE + revenue split → eligibility + alignment.
- Workflow per exposure: Substantial Contribution check → DNSH → Minimum Safeguards → Aligned %.
- Bulk classify wizard con CSV.

### 13.3 · SFDR PAI dashboard · **M**
- 18 mandatory + opcionales del Annex I RTS.
- Por producto (Art 8 / Art 9) y a nivel entidad.
- Charts comparativos vs. benchmark.

### 13.4 · GAR / BTAR computation · **M**
- Engine que calcula GAR (numerador taxonomy-aligned + denominador covered assets) y BTAR.
- Comparable con Pillar III ESG template 7/8 (link bidireccional).

### 13.5 · Product disclosures (Art 8/9) · **M**
- Output generator: Annex II/III/IV/V templates pre-contract + periodic.
- AI assist para narrativa.

### 13.6 · CBAM embed · **L** · `packages/cbam-engine` (nuevo, externo)
- Engine en repo aparte (similar a ALQUID NZ) cuando madure el POC.
- Embed via `<EngineEmbed engine="cbam" view="..." />` con env var `NEXT_PUBLIC_CBAM_BASE_URL`.
- Sub-ruta `/sustainable-finance/cbam` ya reservada — sólo conecta cuando el engine esté listo.
- Si CBAM no madura en el horizonte de P13, se deja placeholder + plan de wire-in en backlog.

### 13.7 · SLB tracker · **M**
- Tabla de Sustainability-Linked Loans con KPIs vinculados (intensidad CO₂e, % renovables, # mujeres en directiva, etc.), step-up triggers, fechas de medición.
- Drawer detalle con histórico de mediciones + evidencias.
- Alertas auto cuando KPI falla → step-up activa.

### 13.8 · ALQUID NZ wire-in real · **S**
- Cuando llegue `NEXT_PUBLIC_ALQUID_NZ_BASE_URL`, sustituir placeholder de `/disclosure-hub/financed-emissions` y `/net-zero-trajectory`. Postmessage handshake + token passing.
- Cross-link desde Sustainable Finance ("This portfolio aligned with NZ trajectory →").

### 13.9 · Cross-module · **S**
- SF auto-puebla Pillar III ESG templates GAR/BTAR (P3.6/P3.7).
- Feeds Hub datapoints E1 (climate-related products), E2/E3/E4/E5 según activity.

### 13.10 · Polish · **S**

**Definition of Done Phase 13:** un product manager puede clasificar un portfolio loan-by-loan en EU Taxonomy, generar el SFDR Art 8 disclosure y trackear los SLBs sin tocar Excel.

---

## 10. Phase 14 · Cross-module orchestration (3–4 semanas)

**Objetivo:** capa superior que conecta los 6 módulos en una experiencia unificada. AI + UX power-user + diferenciación.

### 14.1 · cmd+K palette completa · **M**
- Implementación final del primitive de Phase 7.9: search across todos los módulos (datapoints, templates, counterparties, controls, audit events, CI entries).
- Acciones contextuales por scope: "Open template CR1", "Add CI entry", "Trace this number".
- Recent + favorites + suggestions con base en uso.

### 14.2 · AI assistant ("Ask E6.0") · **L**
- Side panel persistente con conversación libre.
- Tools-as-MCP: el asistente puede llamar `getDatapoint`, `traceLineage`, `runStressTest`, `draftNarrative`, `bulkImportCSV`, `findControls`.
- Memory por usuario (con consentimiento + audit).
- Output siempre auditable (cita las fuentes que tocó).

### 14.3 · Executive Dashboard · **M** · `/executive`
- Vista CFO/CSO/CRO con KPI cross-module:
  - Compliance: % controls operating, # findings open.
  - Climate: GHG total, % portfolio at risk, financed emissions.
  - Capital: CET1, GAR, BTAR.
  - Disclosure: % datapoints captured, # disclosures locked Q.
- Drill-through a cada módulo.

### 14.4 · Cross-framework crosswalk automation · **M**
- Re-uso del campo `crosswalk` ya en `Datapoint`.
- Si capturas E1-6 (ESRS), auto-llena SASB FB-FR-130a.1 + GRI 305-1 + TCFD Metrics & Targets + CDP C6.1 + Pillar III P3.5 + SFDR PAI 1.
- UI: "1 input → N outputs" visual.

### 14.5 · Peer benchmarking · **M** (opt-in)
- Anonimizado, agregados por país + asset size band.
- KPIs comparables: tCO₂e per €1M loans, GAR, % captured datapoints, days to close ESG disclosure.
- Surface en Overview de cada módulo como "Top quartile / Median / Bottom".

### 14.6 · Notification center + alerts · **S**
- Bell icon en topbar con feed.
- Alert types: workflow needs review, control deficiency, threshold breach, source unhealthy, deadline approaching.
- Routing: email + in-app (Slack / Teams en P15).

### 14.7 · Global Evidence Pack export · **M**
- Variante de Trust Center auditor pack a nivel plataforma: incluye todos los módulos.
- Selector: "Q4 2026 + ESRS scope" → ZIP con datapoints + narrativas + evidencias + audit log + controls evidence + lineage diagrams.

**Definition of Done Phase 14:** un usuario puede operar 3–4 módulos sin cambiar de ruta gracias a cmd+K + assistant, y un comité ejecutivo tiene una vista única con todo el ESG-finance de la entidad.

---

## 11. Phase 15 · GA Banca readiness (4–6 semanas)

**Objetivo:** convertir el producto en "deployable a un banco tier-1 mañana". Es la fase que abre la comercialización.

### 15.1 · Performance hardening · **M**
- Bundle audit y code-split por módulo (`next/dynamic` agresivo en client-only).
- Server Components revisitar: cualquier client component que pueda volverse server.
- Virtualización en todas las tablas > 200 filas (TanStack Virtual).
- LCP < 2.5s, CLS < 0.1, TTI < 4s en 3G simulado.

### 15.2 · Security review · **M**
- Pen test externo (objetivo: 0 highs, 0 mediums sin mitigación).
- Dependency audit (`pnpm audit` + Snyk + Renovate config).
- CSP + HSTS + secure cookies + rate limiting.
- Secrets management (Vault / AWS Secrets Manager).
- OWASP Top 10 review.

### 15.3 · SOC2 Type I + ISO 27001 prep · **L**
- Tracker en `/trust-center/certifications` con controles E6.0-side.
- Vendor SOC2 (Auth0/Vercel/etc.) collection.
- Gap analysis + remediation plan.

### 15.4 · DR + multi-region · **M**
- Postgres replicación (primary EU-west + replica EU-central).
- Backup policy: daily snapshots, RTO ≤ 4h, RPO ≤ 1h.
- Tenant-level export "right to portability".

### 15.5 · Customer pilots · **L** (calendario externo)
- 1–2 bancos tier-1 en beta cerrado.
- Onboarding checklist (3-day setup).
- Feedback loop con weekly review.

### 15.6 · Documentation completa · **M**
- Admin guide (tenant setup, RBAC, integraciones).
- User guide por módulo (PDF + interactive walk-through).
- Auditor guide (cómo verificar la hash chain, cómo leer un export pack).
- API reference (OpenAPI generated + Redoc).

### 15.7 · i18n nativo · **M**
- Revisión nativa de las 5 locales (ES/EN/DE/FR/IT) por traductor profesional.
- Date/number/currency formatting localizado.
- RTL prep (no urgente, pero arquitectura lo soporta).

**Definition of Done Phase 15:** firma del primer contrato comercial con un banco tier-1.

---

## 12. Métricas de éxito por phase

| Phase | KPI primario | Target |
|---|---|---|
| 7 | Onboarding de módulo nuevo (M.0 → M.1 rendering) | < 1 día |
| 8 | % datapoints con linaje visible | 100% (mock o real) |
| 8 | Tiempo crear 10 CI entries | < 3 min (wizard / CSV) |
| 9 | Cualquier número trazable a su raíz | 100% en ≤ 3 clicks |
| 10 | Auditor pack reproducible byte-a-byte | Sí |
| 11 | Banco prepara Pillar III Q sin Excel | Sí |
| 12 | SREP-style stress test corre en | < 30 s |
| 13 | Clasificar 1000 loans por EU Taxonomy | < 5 min |
| 14 | cmd+K → resultado | < 200 ms |
| 15 | Lighthouse perf | ≥ 90 en todos los módulos |
| 15 | Pen test highs | 0 |

---

## 13. Riesgos transversales y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Phase 7 se alarga > 6 semanas | Alta | Bloquea todo | Cortar i18n a 2 idiomas, dejar SSO a OIDC genérico, mover Storybook a P8 si aprieta |
| Backend no entrega endpoints a tiempo | Alta | Cada módulo se construye contra mocks | MSW handlers desde día 1, contrato OpenAPI cerrado antes de empezar phase, mocks como **single source of truth de demo** |
| Climate X / Mapbox licensing en P12 | Media | Mapas sin layers | Plan B: open data (Copernicus EO, JRC flood, ESA WorldCover) + MapLibre |
| ALQUID NZ / CBAM no maduran a tiempo | Media | Placeholders permanentes | El plan no los considera bloqueantes; embed wires-in incremental |
| Scope creep de Climate Lab (TNFD opcional crece) | Media | Phase 12 → 10 semanas | TNFD se aparta a Phase 12.5 separada, post-GA |
| AI assistant alucina cifras | Alta si no guardrailed | Riesgo legal | Guardrails: AI sólo redacta sobre datapoints provistos, nunca inventa; output siempre revisado por humano; audit del prompt |
| Capacity team < 4 devs | Alta | Roadmap se va a 12+ meses | Paralelización pierde valor; secuencia estricta 7→8→9→10→11→12→13→14→15 |
| Multi-tenant data leaks | Baja prob, altísimo impacto | Pérdida de cliente | Tests automated de isolation en CI, row-level security en backend, pen test específico en P15 |
| Bundle size explota | Media | Banking environments restricted bandwidth | `size-limit` en CI desde P7, code-split agresivo, Climate maps lazy |

---

## 14. Decisiones abiertas (cierran antes de iniciar la phase indicada)

| # | Decisión | Necesaria antes de | Recomendación inicial |
|---|---|---|---|
| 1 | IdP para auth (Auth0 vs Keycloak self-host vs WorkOS) | Phase 7.3 | Auth0 para dev/staging + WorkOS para enterprise SSO en GA |
| 2 | Storage de evidence vault (S3 / Azure Blob / MinIO) | Phase 8.6 | MinIO en dev, S3 / Azure Blob en prod según tenant |
| 3 | Map provider Climate Lab (Mapbox paid vs MapLibre open) | Phase 12.2 | MapLibre + open hazard data para no bloquear; Mapbox como upgrade |
| 4 | LLM provider (Anthropic Claude vs OpenAI vs Azure OpenAI) | Phase 8.9 / 14.2 | Anthropic Claude (mejor con regs + más cauto con cifras), vía API con prompt audit |
| 5 | XBRL library (xbrl-js custom vs SaaS Workiva-style) | Phase 8.8 + 11.8 | Empezar custom (control + costes), evaluar SaaS si se complica DORA/CSRD |
| 6 | DB strategy multi-tenant (shared schema RLS vs schema-per-tenant) | Phase 7.4 (backend) | Shared schema + RLS para densidad; schema-per-tenant para tier-1 si lo piden |
| 7 | Workflow engine (in-house state machines vs Temporal / Camunda) | Phase 8.5 | In-house para empezar; migrar a Temporal si pasamos de 3 state machines |
| 8 | Real-time (SSE vs WebSocket) | Phase 10.4 + 14.6 | SSE primero (más simple, suficiente para approvals + status); WS si llega caso colaborativo |

---

## 15. Capacity y secuencia recomendada

### 15.1 · Single-dev (worst case)
Estrictamente secuencial: 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15.
**Estimación total: ~12–14 meses.**

### 15.2 · Team de 2 devs frontend + 1 backend
- Dev A: tracks de foundation (7) y luego data-heavy (9, 11).
- Dev B: tracks visuales (8, 12, 13).
- Backend: schemas + endpoints + DB en paralelo a las phases que los necesitan.
**Estimación total: ~9–10 meses con dependencias respetadas.**

### 15.3 · Team de 4+ devs (objetivo razonable para banca)
- Dev A (lead): Phase 7 entera + Phase 14 + Phase 15 perf.
- Dev B: Phase 8 (Hub Pro).
- Dev C: Phase 9 (Data Layer) → Phase 12 (Climate Lab).
- Dev D: Phase 10 (Trust Center) → Phase 11 (Pillar III) → Phase 13 (SF).
- Backend (1–2): API contract paralelo a cada phase.
**Estimación total: ~7–8 meses.**

---

## 16. Checklist de arranque

### 16.1 · Inmediato (día 1 del plan)
- [ ] Branch `main` proteger; `feat/phase-7-*` workflow.
- [ ] Issues en tracker creados con label por phase (`phase-7` … `phase-15`).
- [ ] Decisiones #1 (IdP) y #6 (DB) cerradas con backend antes de codear P7.
- [ ] Cerrar contrato OpenAPI de Hub + Data Layer (P7+P9 dependen).
- [ ] Confirmar capacity (15.1 vs 15.2 vs 15.3) para calibrar timeline.

### 16.2 · Antes de cada phase
- [ ] Decision log de la phase actualizado (esta tabla §14).
- [ ] OpenAPI del backend para los endpoints de esta phase listo.
- [ ] MSW handlers + fixtures con la shape final del endpoint.
- [ ] Storybook stories de los primitives nuevos (en `packages/ui`).
- [ ] Spike de 1 día para validar arquitectura si hay net-new significativo (mapas, XBRL, AI).

### 16.3 · Definition of Done global por phase
- [ ] `pnpm lint && pnpm type-check && pnpm build` verde.
- [ ] Storybook actualizado.
- [ ] MSW handlers + fixtures coherentes.
- [ ] a11y AA (focus rings, contraste, screen reader).
- [ ] Documentation actualizada (`MIGRATION.md` se queda como histórico, `SCALABILITY.md` — este doc — se actualiza con learnings).
- [ ] Audit hooks en cada mutación.
- [ ] Permissions enforced (server + UI hint).
- [ ] i18n strings extraídos a `messages/<modulo>.json` (mínimo ES + EN).

---

## 17. Diferenciación competitiva (por qué este orden gana)

| Competidor | Su fortaleza | Cómo lo batimos con este plan |
|---|---|---|
| **Workiva** | Trazabilidad + workflow + audit | Phase 8 + 10 igualan rigor con estética 2026 (no 2018) y bundle 10× más liviano |
| **Watershed** | UX velocidad + factor recommendation | Phase 8.7 (wizard + CSV + DQR) iguala; Phase 14 (AI + crosswalk) supera |
| **MSCI ESG / Sustainalytics** | Cobertura datos + ratings | No competimos en data provider; sí en disclosure stack consolidado (single pane) |
| **Diligent ESG** | Banca focus | Phase 11 (Pillar III nativo) + Phase 12 (SREP stress test) son moat banca |
| **Sweep / Persefoni** | Carbon accounting profesional | Phase 8.7 (CI native) + Phase 12 (climate risk) cubre lo que ellos cubren más nature |
| **Generic GRC (OneTrust, ServiceNow)** | RBAC + workflow + controls | Phase 10 (Trust Center) iguala; lo combinamos con disclosure + finanzas = único en mercado |

**El moat real** es la combinación de: **(a)** disclosure stack completo (CSRD + Pillar III + SFDR + TCFD + GRI + SASB + CDP) con crosswalk automático, **(b)** finanzas + riesgo en el mismo producto (financed emissions + capital + GAR + climate VaR), y **(c)** trazabilidad / audit grade con la estética y velocidad de un producto 2026. Este plan ordena las fases para que ese moat se construya en el orden con menor rework.

---

## 18. Audit 2026-05-14 · gaps detectados sobre el plan

*Revisión externa contra el código real. Los puntos que siguen complementan o re-priorizan secciones existentes; no las sustituyen.*

**Contexto que calibra todo lo que sigue (respondido por owner en la revisión):**
- **Timeline:** sin fecha de primer cliente — fase de construir plataforma. → Hay aire para hacer fundamentos bien, sin recortes por presión comercial.
- **Multi-tenant:** modelo **híbrido**, silo de Supabase por banco + RLS interna por entidad legal / consolidación.
- **Backend:** **mixto** — Supabase para datos transaccionales (CRUD, auth, real-time, evidence vault metadata, snapshots), FastAPI separado para compute pesado (output engine, narrativa AI, climate VaR, PCAF math, bulk processing).
- **"No es usable":** falta el **loop end-to-end** (ingest → calcular → revisar → aprobar → exportar). Phase 8 es la respuesta.

### 18.1 · Diagnóstico cualitativo

La arquitectura aguanta crecer: monorepo bien partido (`domain` separado de `ui`, OpenAPI types generados, design tokens en TS reexportados como Tailwind preset, Storybook arrancado en `packages/ui`, RSC por defecto, Supabase con RLS desde la primera migración). Lo que no aguanta hoy es ser usable como producto: falta el loop **ingest → calcular → revisar → aprobar → exportar disclosure firmado**. Sin ese loop cerrado, lo que existe es un showcase muy bien hecho, no software operativo.

**Sin presión comercial, la métrica del próximo milestone no es "vendible" sino "demoable end-to-end":** disclosure E1 cerrado de extremo a extremo (CI wizard → bind a datapoint → preview narrativa + números → workflow approve → snapshot inmutable → export PDF). Hasta que esa cadena pase verde, el resto es polish.

### 18.2 · Drift documental (meta)

`CLAUDE.md` está incompleto, no obsoleto:
- Dice "FastAPI en repo separado" → cierto en parte: FastAPI vendrá, pero **sólo para compute pesado**. La capa transaccional ya está en **Supabase in-tree** con 8 migraciones (`emission_factors`, `datapoints`, DMA, IRO, pillar sign-offs, connector syncs, emission entries + disclosure bindings, operational units). Hay que decirlo así explícitamente.
- Dice "`app/providers.tsx` pendiente con `<QueryClientProvider>`" → ya existe y está montado.
- Dice "MSW handlers pendientes" → sigue cierto.
- Dice "Auth & session management pendiente con backend team" → ya hay `login/`, `sign-up/`, `auth/callback/`, `middleware.ts` con `updateSession` de Supabase. Auth resuelta vía Supabase es la realidad.

**Regla operativa:** al cerrar cada phase, el PR de cierre debe tocar `CLAUDE.md` y `MIGRATION.md`. Un doc que miente cuesta más caro que uno que no existe.

### 18.3 · Tests = 0 en todo el repo

No hay un solo `*.test.ts` ni `*.spec.ts`. Sin presión comercial no es bloqueante, pero la deuda crece exponencialmente con la superficie de código. Añadir como **7.12 · Testing baseline · S**:

- **Vitest** en `packages/domain` cubriendo: unit-conversion, materiality resolver, PCAF DQR heurística, frameworks crosswalk.
- **Vitest + React Testing Library** en `packages/ui` para primitives críticos (Drawer, KpiCard, Sparkline, ActivityColumn).
- **Playwright** en `apps/web` con un único smoke test inicial: login → `/disclosure-hub/overview` → abrir drawer en `/repository` → assertion que el value se renderiza.
- Coverage target Phase 7: **50% en `domain` (es lógica pura, fácil), smoke verde en `web`**. El target sube cada phase: 70% en `domain` cuando entre snapshot/output engine.

### 18.4 · Multi-tenant híbrido (silo + RLS interna) · re-escribir 7.4

Confirmado el modelo: **un proyecto Supabase por banco** (aislamiento físico cross-bank) + **RLS interna por entidad legal / consolidación**. Esto cambia 7.4 actual:

- **Provisioning layer · S+** — un banco nuevo = un proyecto Supabase nuevo. Automatizable via Supabase Management API o Terraform provider. Genera URL + anon key + service key + corre `pnpm supabase db push` con migraciones canónicas. El frontend recibe la URL por config de tenant (subdomain `bancox.e60.app` → resolver que mapea a Supabase URL).
- **Schema interno de entidades** — añadir a las migraciones canónicas:
  - `entities` (entidades legales del banco): `id`, `legal_name`, `lei`, `parent_id` (jerarquía), `created_at`.
  - `consolidation_groups`: `id`, `name`, `parent_id`, `accounting_method` ('full' | 'proportional' | 'equity').
  - `consolidation_members`: `(group_id, entity_id, weight)`.
  - `user_entity_memberships`: `(user_id, entity_id, role)` con role ∈ `viewer | editor | reviewer | approver | admin`.
- **RLS interna** — en tablas mutables (`emission_entries`, `disclosure_bindings`, `operational_units`, `iro_*`, `dma_*`, `pillar_signoffs`, `connector_syncs`, futura `disclosure_snapshots`): `using (entity_id in (select entity_id from user_entity_memberships where user_id = auth.uid()))`. Para reads agregados de un grupo de consolidación, vista materializada con seguridad invocada o función `security definer` que verifica pertenencia.
- **Decisiones a cerrar antes de codear** — (a) ¿cross-entity dentro de un mismo banco se modela como RLS pura o como service-role + filtro en API? (b) ¿el rol `approver` se hereda por jerarquía o se asigna explícito? (c) ¿filings de consolidación viven en una entidad "ficticia" (group entity) o en una tabla aparte?

Sin retrofitting drama porque las migraciones siguen siendo 8 — pero el diseño hay que cerrarlo antes de la primera migración con datos de banco real.

### 18.5 · Frontera Supabase / FastAPI · nuevo 7.14 · S

Si el backend es mixto, la frontera tiene que estar documentada desde ya o termina siendo confusión cara. **Nuevo ticket 7.14 · `docs/architecture/backend-split.md`**:

- **Supabase es source of truth para todo lo transaccional:** auth, entidades, datapoints (catálogo y valores), emission entries, disclosure bindings, evidence metadata, audit log, snapshots, real-time updates. RLS aplica aquí.
- **FastAPI es stateless compute:** recibe payload via API, devuelve resultado, no persiste. Casos: ESRS narrative generation (LLM-backed), output PDF render, financed emissions PCAF math complejo, climate VaR escenarios, bulk CSV validation + transform, conexiones a connectors externos (cuando no usen Supabase edge functions).
- **Frontend orquesta:** carga datos de Supabase (vía `@e60/api-client` con TanStack Query), envía payload a FastAPI cuando necesita compute, persiste resultado de vuelta en Supabase (un `disclosure_snapshot` o un `emission_entry` calculado).
- **FastAPI NO toca Supabase directamente.** Stateless por contrato → es trivialmente escalable horizontal, no necesita conocer RLS, y la única source of truth sigue siendo Supabase.
- **OpenAPI contract por servicio:** `packages/api-client` se reorganiza en `supabase.*` (PostgREST + RPC) y `compute.*` (FastAPI). Generación de tipos automática para ambos.
- **`packages/output-engine` se replantea:** no es motor local sino cliente del compute service. Mantiene los tipos del payload (input/output schemas) pero el render lo hace FastAPI.

Bloquea Phase 8: sin esta línea trazada, el equipo va a improvisar dónde vive qué cuando llegue el output generator.

### 18.6 · CI demasiado fino · refuerzo de 7.11

El workflow actual (`.github/workflows/ci.yml`) hace `pnpm install` + `pnpm type-check` + build. Falta:

- `pnpm lint` enforcement.
- `pnpm test` (cuando 18.3 esté en marcha).
- `pnpm audit --prod` con fail en High/Critical.
- **CodeQL** (gratis en repos privados, scan SAST).
- **Lighthouse CI** sobre `/disclosure-hub/overview` y `/repository` con budget de LCP < 2.5s y bundle JS < 350 kB inicial.
- **PR comment** con bundle diff (Next.js bundle analyzer).
- Cuando FastAPI entre: pipeline equivalente en ese repo + un job de integration test contract-based entre ambos servicios.

### 18.7 · Immutable snapshots por filing · nuevo 8.5b

8.5 (Workflow Draft→Review→Approve→Lock) deja la disclosure "locked" pero el lock no es suficiente: si mañana MITECO actualiza un emission factor o un usuario edita el `valueHistory`, el filing publicado ya no es reproducible.

**Añadir 8.5b · Disclosure snapshots inmutables · M · `packages/domain/src/snapshot.ts` + migración**:

- Tabla en Supabase `disclosure_snapshots`: `id`, `entity_id` (o `consolidation_group_id`), `disclosure_id`, `period`, `filed_at`, `filed_by`, `payload jsonb` (copia profunda de inputs + factors usados + output renderizado devuelto por FastAPI + hash sha256 del payload), `signature` (opcional, e-sign).
- Append-only por RLS: `revoke` permitido (marca + nuevo snapshot revocador), `update` denegado.
- Compute path: frontend manda payload a FastAPI compute → recibe output renderizado → llama RPC `seal_snapshot(payload, output, hash)` en Supabase que hace insert append-only.
- UI: `/outputs` muestra "Filed snapshots" tab con cada versión, diff entre versiones, y botón "Re-open as draft" (crea draft a partir del snapshot, no lo edita).

### 18.8 · Observability · nuevo 7.13 · S

`SCALABILITY.md` cubre audit primitive (7.6) — bueno para compliance — pero no cubre operacional. Añadir:

- **Sentry** (cliente + server Next.js + FastAPI) con tag `entity_id`, `user_id`, `tenant` (banco).
- **Vercel Analytics** o equivalente para Core Web Vitals.
- **Performance budgets** en CI (ver 18.6).
- **Server logs estructurados** (pino en Next.js, structlog en FastAPI) a sink centralizado — necesario para Trust Center después.

### 18.9 · Audit Client/Server boundaries

42 de 78 `.tsx` en `apps/web` tienen `'use client'` (54%). Para una app declaradamente "RSC por defecto" eso es alto. Con el backend split, hay oportunidad de bajar este número: muchos componentes que hoy fetchean del lado cliente pueden volverse Server Components que llaman a FastAPI / Supabase server-side. Acción en Phase 7 polish:

- Pasar bundle analyzer y publicar baseline.
- Identificar `'use client'` injustificados (componentes que sólo renderean texto/SVG y heredaron la directiva).
- Mover hooks/state al borde inferior del árbol, dejando padres como Server Components.

Target: **< 30% client components antes de Phase 8**.

### 18.10 · Data residency / GDPR como artefacto, no como intención

Decisión abierta en CLAUDE.md, pero sin entregable concreto. Sin presión comercial puede ir en paralelo a Phase 7-8, pero hay que arrancar ya el ticket porque el modelo silo-per-bank lo hace más complejo:

- Región Supabase **pinada a EU** en el template de provisioning de tenant nuevo (verificar que la Management API permite forzar región).
- DPA con Supabase a nivel master account (lo heredan todos los proyectos hijos).
- FastAPI hosting en EU (Fly.io/Hetzner/Scaleway si se quiere control, AWS eu-west-* si se quiere managed).
- Lista de subprocesadores actualizada (Supabase, host de FastAPI, Sentry si entra, OpenAI/Anthropic si entra para AI narrative).
- Diagrama de flujo de datos: qué sale del tenant, hacia dónde, en qué condiciones. Incluir explícitamente el viaje payload-frontend-FastAPI-respuesta.

Coste: **paperwork + decisiones de hosting**, no código.

### 18.11 · Resumen ejecutable

Cambios concretos al plan tras este audit:

| ID | Acción | Phase | Tamaño | Nota |
|---|---|---|---|---|
| 7.4 (reescribir) | Multi-tenant híbrido: silo Supabase per bank + RLS interna por entity_id | 7 | M | Cerrar decisiones de jerarquía y consolidación antes de codear |
| 7.11 (expand) | CI con lint + test + audit + CodeQL + Lighthouse + bundle diff | 7 | S | Aplicar también a FastAPI repo cuando llegue |
| 7.12 (nuevo) | Testing baseline (Vitest domain + ui, Playwright smoke) | 7 | S | Target 50% en `domain` |
| 7.13 (nuevo) | Observability baseline (Sentry + Web Vitals + structured logs) | 7 | S | Tags `entity_id` + `tenant` |
| 7.14 (nuevo) | `docs/architecture/backend-split.md` Supabase vs FastAPI | 7 | S | **Bloquea Phase 8** |
| 8.5b (nuevo) | Immutable disclosure snapshots persistidos en Supabase | 8 | M | Compute en FastAPI, persistencia en Supabase append-only |
| 8.8 (replantear) | Output engine como cliente FastAPI stateless, no motor local | 8 | M-L | `packages/output-engine` redefinido |
| 15.x (pull-up) | Data residency / DPA / subprocesadores | en paralelo a 7-8 | XS-paperwork | Sin urgencia comercial |
| meta | CLAUDE.md actualizado al cierre de cada PR de phase | continuo | XS | Y reflejar split Supabase/FastAPI ya |

El orden general Phase 7 → 8 → 9 se mantiene. Lo que cambia: **(a)** Phase 7 incluye explícitamente el split Supabase/FastAPI (7.14) porque bloquea todo lo que viene; **(b)** multi-tenant es híbrido (silo + RLS interna) en lugar de pool con tenant_id global; **(c)** el output engine no es local sino cliente del FastAPI compute; **(d)** sin presión comercial, el ritmo es "construir bien" antes que "demo vendible ya" — pero el milestone interno sigue siendo cerrar el loop end-to-end de Phase 8.

---

## Anexo A · Sprint detallado Disclosure Hub Pro

*Movido aquí del SCALABILITY.md anterior — Phase 8 desglose ejecutable a nivel ticket.*

### Track A · Disclosure Hub: "Ver qué se reporta"

**A1 · `Lineage` model en `@e60/domain`** · **S** · `packages/domain/src/lineage.ts`
- Añade `DatapointLineage = { source: 'manual' | 'computed' | 'carbon-intel' | 'data-layer' | 'external'; sourceRef?: string; lastUpdatedAt: ISO; lastUpdatedBy: UserRef; valueHistory: Array<{value, at, by}> }`.
- Extiende `Datapoint` con `value`, `unit`, `period`, `status: 'empty' | 'draft' | 'review' | 'approved' | 'locked'`, `owner`, `evidenceCount`, `lineage`.
- AC: `pnpm type-check` verde, tipos exportados del barrel.

**A2 · Enriquecer `DisclosureDrawer` con valor + linaje** · **M** · `packages/ui/src/components/DisclosureDrawer.tsx` + `apps/web/components/hub/`
- Tab 1 "Datapoints" → cada fila muestra: **value + unit + status chip + source badge + owner avatar + evidence count**.
- Nuevo tab "Lineage" (reemplaza "Mapping" o se añade): grafo simple `source → transformation → value`, con timestamp y user.
- Tab "History" pasa a leer de `lineage.valueHistory`.
- AC: abrir drawer de cualquier datapoint con datos mock muestra todo lo anterior, sin overflow visual.

**A3 · Columnas operativas en `/repository`** · **M** · `apps/web/app/(shell)/disclosure-hub/repository/`
- Añadir columnas: `Value`, `Status` (chip), `Source` (badge: manual/CI/external), `Owner` (avatar), `Evidence` (icon + count), `Updated` (relative).
- Mantener virtualización TanStack (1184 filas).
- Filtro nuevo: por `status` y por `source`.
- AC: filtrar "status = empty" deja sólo datapoints sin valor; ordenar por "updated" funciona.

**A4 · Disclosure Preview mode en `/outputs`** · **M** · `apps/web/app/(shell)/disclosure-hub/outputs/`
- Click en disclosure card → vista preview side-by-side: árbol de datapoints (izq) + render textual de la disclosure ESRS con `{{datapoint}}` resueltos (der).
- Botón "Export PDF" stub.
- AC: una disclosure E1 muestra el texto narrativo con números intercalados; clickear un número resalta la fila izquierda.

### Track B · Carbon Intelligence: "Inserción que no duele"

**B1 · Activity entry como wizard de 3 pasos** · **M** · `/disclosure-hub/carbon-intelligence/`
- Refactor del modal actual a `<ActivityEntryWizard>` con tres steps: Scope & Category → Activity & Factor → Quantity, Period, Source, Evidence.
- Footer persistente: **tCO₂e preview live + uncertainty band + PCAF DQR estimado**.

**B2 · Inventory table con TanStack** · **M**
- TanStack table sortable/filterable. Columnas: Scope/Cat, Activity, Quantity+Unit, Period, tCO₂e, DQR, Status, Evidence, Actions.
- Filtros: scope, period range, DQR ≤ 3, search.
- Inline-edit en quantity con recalculo live de tCO₂e.

**B3 · PCAF DQR model + surface** · **S** · `packages/domain/src/carbon.ts`
- `DataQualityRating = 1 | 2 | 3 | 4 | 5` con descriptores PCAF.
- Heurística stub: manual=4, factor genérico=3, factor específico+evidencia=2, medido=1.
- Surface: chip en cada entry + agregado en KPI row ("Avg DQR = 2.8").

**B4 · Bulk CSV import wizard** · **L**
- 4 steps: Upload → Map columns → Validate → Commit.
- Mapper inteligente con sugerencia de activity por columna.
- Preview de tCO₂e total antes de commit.

### Track C · El puente (CI ↔ Hub)

**C1 · `dataPointBinding` en CI entries** · **S** · domain + UI
- Cada CI entry tiene `disclosureBindings: ESRSDatapointId[]`.
- Mostrar en wizard step 3: *"Esta actividad alimentará: E1-6 GHG emissions (Scope 1)"*.

**C2 · "Used in disclosures" en datapoint drawer** · **S**
- Nuevo sub-section en tab "Lineage": "Powered by X carbon-intelligence entries → link".
- Click link → navega a `/carbon-intelligence?filter=disclosure:E1-6`.

---

*Plan vivo. Phases 7–8 son operativas mañana. Phases 9–15 dependen de capacity y de cerrar las decisiones abiertas (§14). El doc se actualiza al final de cada phase con learnings que reordenen las siguientes.*
