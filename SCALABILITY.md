# E6.0 · Plan de Escalabilidad — Disclosure Hub & Carbon Intelligence

*Mayo 2026 · Sprint inmediato (2–3 sem) + visión Q3 · Benchmark: Workiva + Watershed*

---

## TL;DR

El Hub hoy lista datapoints pero **no deja ver qué se reporta** en cada uno (valor, fórmula, fuente, evidencia, owner). Carbon Intelligence captura emisiones pero **la inserción es un formulario plano** sin batch, sin calidad de dato y sin puente claro hacia los disclosures ESRS. El plan ataca ambos en 3 tracks paralelos durante el sprint, monta el **bridge CI ↔ Hub** que hoy no existe, y deja sembrados los pilares (workflow, evidence vault, audit) que el producto necesita para vender a banca tier-1.

**Filosofía:** Workiva nos da la **trazabilidad** (cada número tiene linaje, owner, evidencia, audit). Watershed nos da la **velocidad de entrada** (wizards, batch, validación en vivo, charts que respiran). Combinamos.

---

## 1. Diagnóstico (qué duele)

### 1.1 Disclosure Hub — "No vemos qué se reporta"

| Síntoma | Causa raíz | Impacto |
|---|---|---|
| El drawer abre, pero los 5 tabs muestran texto estático sin valor real ligado al datapoint | `DisclosureDrawer` no recibe `datapointValue`, ni `lineage`, ni `evidence[]` | Auditor no puede aprobar nada, banco no se atreve a firmar |
| `/repository` enseña 1184 datapoints como tabla, pero no se ve **qué tiene valor y qué no** | Falta columna `status × source × last value` con visual claro | El usuario tiene que abrir cada fila para saber el estado |
| `/outputs` muestra 6 SVG previews bonitos pero **no son la disclosure real** | Mock visual, sin renderizar texto+datos compuestos | No hay "preview mode" que sirva para revisar antes de exportar |
| Sin trazabilidad: ¿de dónde viene el número de GHG Scope 1? | No hay `lineage` model que conecte datapoint ← origen (CI, data-layer, manual, computed) | Cualquier auditor pregunta "¿fuente?" y cae el sistema |

### 1.2 Carbon Intelligence — "Una castaña a nivel UX/inserción"

| Síntoma | Causa raíz | Impacto |
|---|---|---|
| Insertar 1 actividad = 1 modal con 6 campos en una vista | Falta wizard por pasos (Scope → Activity → Quantity → Evidence) | Onboarding de 200 facilities = imposible |
| No hay **bulk import** (CSV/Excel) | Solo entrada manual | Banco con 50 oficinas no entra en el sistema |
| El factor picker es plano (41 factores) sin recomendación contextual | No hay sugerencia basada en scope+actividad+país | Usuario duda, escoge mal, dato malo |
| No se ve la **calidad del dato** (PCAF DQR 1–5) | No modelado en domain ni surface en UI | El número entra pero el auditor no sabe si confiar |
| El inventario no es navegable: filtros débiles, no inline-edit, no detección de duplicados/outliers | Tabla sin TanStack power | Después de 500 entries no escala |
| **No hay puente visual con el Hub**: el usuario inserta toneladas pero no ve que esto alimenta el datapoint E1-6 GHG | Falta `dataPointBinding` model | El usuario no entiende para qué sirve CI |

### 1.3 Lo que no es problema (mantener)

- Foundation, shell, design system, 1184 datapoints data, 232 materiality rows: **sólido**.
- Decisión CI nativo + ALQUID NZ embed: **correcta**, no tocar.
- TanStack Query + Zod + OpenAPI contract: **escala bien**, ya invertido.

---

## 2. Visión de referencia (qué robar de los mejores)

### De Workiva / Diligent — la columna vertebral compliance
- **Datapoint = first-class object** con: value, period, source, owner, evidence[], audit_trail[], approval_status, version.
- **"Trace this number"**: en cualquier celda de cualquier vista, click derecho → "ver linaje completo". Modal con el grafo de origen.
- **Workflow de aprobación**: Draft → Review → Approve → Lock, con role-based.
- **Evidence vault**: cada datapoint puede adjuntar docs, screenshots, formulas; el evidence pack se exporta junto con el report.
- **Side-by-side editor**: izquierda = formulario datos, derecha = preview de la disclosure renderizada en vivo.

### De Watershed / Sweep — la capa de velocidad y belleza
- **Activity entry como wizard de 3 pasos**, no formulario plano. Con factor recommendation inteligente.
- **Bulk CSV mapper**: drag CSV → mapea columnas → valida → preview → commit. Crítico para banca.
- **Quality score visible siempre**: PCAF 1–5 chip al lado de cada número, color-coded.
- **Anomaly detection inline**: "esta actividad es 3.2× el promedio del trimestre anterior" como hint contextual.
- **Charts respirables**: micro-animations, hover states densos, drill-down al hacer click en cualquier barra/punto.
- **Empty states con contenido**: "no tienes Scope 3 cat 6 todavía — la mayoría de bancos empiezan por..." con CTA.

### Lo que NO copiamos
- Workiva pesa toneladas en bundle y la UX se siente 2018. Mantenemos su rigor con la estética nuestra.
- Watershed no tiene profundidad CSRD/ESRS — ese es nuestro moat, no diluir.

---

## 3. Sprint NOW (2–3 semanas) — qué entregamos ya

> Cada item con: **ticket sugerido · acceptance criteria · effort (S/M/L) · path**

### Track A — Disclosure Hub: "Ver qué se reporta"

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
- Añadir columnas: `Value` (con unit), `Status` (chip color-coded), `Source` (badge: manual/CI/external), `Owner` (avatar), `Evidence` (icon + count), `Updated` (relative).
- Mantener virtualización TanStack (1184 filas).
- Filtro nuevo: por `status` y por `source`. El filtro "scope" actual se mantiene.
- AC: filtrar "status = empty" deja sólo datapoints sin valor; ordenar por "updated" funciona.

**A4 · Disclosure Preview mode en `/outputs`** · **M** · `apps/web/app/(shell)/disclosure-hub/outputs/`
- Click en disclosure card → no abre drawer, sino que abre **vista preview** con dos columnas:
  - Izquierda: árbol de datapoints que componen esta disclosure (con su status).
  - Derecha: render textual de la disclosure ESRS (markdown con `{{datapoint}}` resueltos al valor real, datapoints vacíos en rojo).
- Botón "Export PDF" stub (Phase 7).
- AC: una disclosure E1 muestra el texto narrativo con números intercalados; clickear un número resalta la fila izquierda.

### Track B — Carbon Intelligence: "Inserción que no duele"

**B1 · Activity entry como wizard de 3 pasos** · **M** · `apps/web/app/(shell)/disclosure-hub/carbon-intelligence/`
- Refactor del modal actual a `<ActivityEntryWizard>` con tres steps:
  1. **Scope & Category** (radios visuales: Scope 1 / 2 / 3.1–15, con icon + descripción).
  2. **Activity & Factor** (search + autocomplete sobre los 41 factores; sugerencia top-3 basada en step 1; muestra factor source MITECO/IDAE/DEFRA).
  3. **Quantity, Period, Source, Evidence** (quantity + unit + date range + source link/file + notes).
- Footer persistente: **tCO₂e preview live + uncertainty band + PCAF DQR estimado**.
- AC: completar wizard mock-data crea entrada en inventario; back/next funcionan; cmd+Enter envía.

**B2 · Inventory table con TanStack** · **M** · misma ruta, tab "Inventory"
- Reemplaza la lista actual por TanStack table sortable/filterable.
- Columnas: Scope/Cat, Activity, Quantity+Unit, Period, tCO₂e, DQR (chip color), Status (draft/approved), Evidence (icon), Actions.
- Filtros: scope, period range, DQR ≤ 3 (mala calidad), search.
- Inline-edit en quantity (con recalculo live de tCO₂e).
- AC: 500 mock entries renderizan sin jank; editar quantity actualiza tCO₂e en la celda.

**B3 · PCAF DQR model + surface** · **S** · `packages/domain/src/carbon.ts` + UI
- Modelar `DataQualityRating = 1 | 2 | 3 | 4 | 5` con descriptores PCAF.
- Heurística stub para calcular DQR según factor source + activity precision (manual=4, factor genérico=3, factor específico+evidencia=2, medido=1).
- Surface: chip en cada entry, agregado en KPI row ("Avg DQR = 2.8").
- AC: chip aparece en inventory y en activity preview; el KPI row tiene una card nueva.

**B4 · Bulk CSV import wizard** · **L** · misma ruta, botón "Import CSV"
- 4 steps: Upload → Map columns → Validate → Commit.
- Mapper inteligente: si el CSV tiene columna "kWh" mapea a quantity+unit=kWh, sugiere activity "Purchased electricity".
- Validation surface: rows con error rojas, con razón ("factor no encontrado", "unit incompatible").
- Preview de tCO₂e total antes de commit.
- AC: subir CSV de 20 rows con 2 errores → muestra los 2, deja commit de los 18 buenos. *(si no entra en sprint, parte a Next)*

### Track C — El puente (CI ↔ Hub)

**C1 · `dataPointBinding` en CI entries** · **S** · domain + UI
- Cada CI entry tiene `disclosureBindings: ESRSDatapointId[]` (e.g. `["E1-6_scope1", "E1-6_total"]`).
- En el wizard step 3, mostrar: *"Esta actividad alimentará: E1-6 GHG emissions (Scope 1)"*.
- AC: crear entrada Scope 1 → binding automático a E1-6_scope1.

**C2 · "Used in disclosures" en datapoint drawer** · **S** · `DisclosureDrawer`
- Nuevo sub-section en tab "Lineage": "Powered by X carbon-intelligence entries → link".
- Click link → navega a `/carbon-intelligence?filter=disclosure:E1-6`.
- AC: abrir E1-6 muestra "10 actividades alimentan este número" con link clicable.

---

## 4. NEXT (semanas 4–8, post-sprint)

| Iniciativa | Por qué | Effort |
|---|---|---|
| **Workflow & owners** | Draft → Review → Approve → Lock con role-based perms. Datapoint owner asignable. Sin esto no hay multi-user real. | L |
| **Evidence vault** primitive | Adjuntar docs/screenshots/formulas a datapoint o CI entry. Storage + preview. | L |
| **Audit trail global** | Tabla `events` que captura cualquier mutación (who, what, when, before/after). Surface en `/trust-center`. | M |
| **Bulk import maduro** (si quedó fuera del sprint) | CSV + xlsx, mapper persistente por template, dry-run. | M |
| **Anomaly detection** en CI | "Esta entry es 3× el promedio de Q1". Heurística simple primero (z-score), ML después. | M |
| **Output generator real** | De preview SVG mock → PDF/Word real con narrativa+datos compuestos. ESRS-compliant. | L |
| **Materiality → datapoints feedback loop** | Topic material en `/materiality` → marcar datapoints relacionados como "required". | S |
| **MSW handlers full** | Bloqueante para frontend dev sin backend up. | M |
| **Storybook en `packages/ui`** | Bloqueante para escalar el design system con más manos. | M |

---

## 5. LATER (Q3 2026 y más allá — escalabilidad real)

### Pilares de plataforma (transversales a los 6 módulos)

1. **Multi-tenant isolation** — requisito banca tier-1. Row-level security en backend, tenant context en cliente. Coordinar con backend team.
2. **Auth & session management** — SSO (SAML/OIDC), MFA, idle timeout, role granular (Viewer / Contributor / Approver / Admin / Auditor).
3. **i18n con `next-intl`** — banca pan-europea = ES/EN/DE/FR/IT mínimo. Hoy hay mix español/inglés en mockups; consolidar antes de tener clientes reales.
4. **Real-time updates** — SSE para system-online status, comments live, approval notifications. WebSocket si llega caso.
5. **Audit logging completo** — wired a Trust Center con export para reguladores.
6. **Permissions matrix** — declarar perms en domain, enforced en backend, hint en UI (botones disabled con tooltip).

### Producto

1. **Wire ALQUID NZ embed real** — sustituir placeholder en `/financed-emissions` y `/net-zero-trajectory`. Postmessage handshake + token passing.
2. **CBAM POC ingest** — cuando madure, embebe en `/sustainable-finance/cbam` como sub-ruta.
3. **Pillar III** — empezar real (hoy stub). Datapoints capital + riesgo, basado en EBA guidelines.
4. **Climate Lab** — physical/transition risk con D3 maps + scenario analysis.
5. **Data Layer real** — gestión de fuentes, ETL surface, data quality dashboard.
6. **Trust Center** — audit log viewer, control catalog (SOC2/ISO27001), evidence storage.

### Diferenciación

- **AI-assisted narrative**: redactar el texto de cada disclosure ESRS a partir de los datapoints + contexto del banco.
- **Cross-framework crosswalk** real (ya tenemos campo `crosswalk`): si reportas ESRS E1, ¿qué SASB/GRI/TCFD se llenan solos?
- **Peer benchmarking** — anonimizado, ver cómo te comparas con otros bancos en tCO₂e per €1M loans.

---

## 6. Métricas de éxito del sprint

| Métrica | Antes | Target post-sprint |
|---|---|---|
| Tiempo medio para crear 10 entries de CI | ~12 min (modal × 10) | < 3 min (wizard rápido o 1 CSV) |
| % datapoints con linaje visible | 0% | 100% (mock o real) |
| Clicks para "auditar este número" | imposible | 1 (click derecho o tab Lineage) |
| `pnpm type-check` | verde | verde (no regresiones) |
| `pnpm build` size delta | baseline | +/- 5% máx |
| Storybook stories nuevas | 0 | 6 mínimo (Wizard, Inventory, DrawerLineage, ImportCSV, etc.) — Next, no sprint |

---

## 7. Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Sprint se sale de scope con CSV import (B4) | Alta | Marcado como "*si no entra, a Next*". Empezar por B1+B2+B3+A1+A2+A3, dejar B4 + A4 para semana 3 si hay aire. |
| Backend no tiene endpoints para `lineage` ni `binding` | Alta | Mockear con MSW desde día 1. El contrato OpenAPI se acuerda en paralelo, no bloquea UI. |
| Refactor de drawer rompe Phase 5/6 (outputs, materiality) | Media | Drawer evoluciona como **superset** (nuevos props opcionales), no breaking. Cobertura con Storybook stories en Next. |
| Wizard CI feels más lento para usuarios expertos | Media | Añadir "Quick add" mode (hotkey `q`) que colapsa el wizard en single form. Postponer a Next. |
| "Los dos por igual" en 2–3 sem es ambicioso | Alta | Por eso 3 tracks paralelos pero **A1+B1+C1 son S effort**; lo pesado es A2/A3/B2 que se pueden trabajar en paralelo con dos personas. Si sólo eres tú, A1→A2→A3 → B1→B2→C1, dejando A4+B3+B4 para Next. |

---

## 8. Checklist de arranque (día 1 del sprint)

- [ ] Branch `feat/scalability-sprint` desde `main`.
- [ ] Crear issues en el tracker (uno por A1..C2). Labels: `track-a` / `track-b` / `track-c`, `effort-s/m/l`.
- [ ] A1 primero (domain types) — desbloquea A2, A3, C1.
- [ ] B3 antes que B1 (PCAF DQR) — surface en wizard depende del modelo.
- [ ] MSW handlers para `/api/datapoints/:id/lineage` y `/api/ci/entries` con fixtures mock.
- [ ] Storybook story stub para `DisclosureDrawer` con prop `lineage` (Next, pero scaffolding hoy).
- [ ] Daily 10-min review: ¿qué cae a Next?

---

## 9. Decisiones que necesito de ti antes de arrancar

1. **¿Quién owns cada track?** Si eres solo tú: secuencial A→B→C. Si hay 2 devs: A en paralelo con B, C lo cierra quien acabe antes.
2. **PCAF DQR — ¿modelamos el estándar oficial completo o heurística simple primero?** Recomiendo heurística simple ahora, estándar completo en Next.
3. **Bulk CSV — ¿xlsx desde el día 1 o sólo CSV?** Recomiendo CSV en sprint, xlsx en Next (la lib `sheetjs` añade peso, evaluar).
4. **Output preview en `/outputs` — ¿markdown puro o ya un primer paso a docx/PDF?** Recomiendo markdown puro en sprint, exporter real en Next.

---

*Plan vivo. Si después del primer wireframe del wizard CI te chirría algo, lo ajustamos antes de codear. La idea es no comprometernos a 6 meses, sino a un sprint que mueva la aguja en lo que duele hoy — y dejar el camino claro hacia la escalabilidad real cuando entre el backend.*
