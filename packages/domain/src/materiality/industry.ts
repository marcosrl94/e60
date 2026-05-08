/**
 * Industry materiality matrix
 *
 * Sector × scope/category materiality grid used as a pre-screening tool for
 * GHG-related ESRS topics. Independent of the CSRD double-materiality scoring
 * (impact + financial) modelled in `index.ts` — this is the upstream NACE-based
 * heatmap that surfaces likely hotspots before the IRO workshop runs.
 *
 * Lifted from the legacy `nfq-carbon-intelligence` repo (see `0ld/`).
 */

import { z } from 'zod';

/** Niveles de materialidad: 0 no material, 1 potencial, 2 material, 3 alta materialidad. */
export const IndustryMaterialityLevelSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);
export type IndustryMaterialityLevel = z.infer<typeof IndustryMaterialityLevelSchema>;

/** Categorías evaluables: s1, s2, s3.cat1...s3.cat15 (15 cats GHG Protocol). */
export const ScopeCategorySchema = z.union([
  z.literal('s1'),
  z.literal('s2'),
  ...Array.from({ length: 15 }, (_, i) =>
    z.literal(`s3.cat${i + 1}` as const),
  ),
] as const);
export type ScopeCategory = z.infer<typeof ScopeCategorySchema>;

/** Frameworks de los que se deriva la materialidad sembrada. */
export const MaterialityFrameworkSchema = z.enum([
  'EFRAG_ESRS',
  'SASB',
  'GHG_Protocol',
  'NFQ_internal',
]);
export type MaterialityFramework = z.infer<typeof MaterialityFrameworkSchema>;

/** Sector NACE Rev 2.1 (sección o división). */
export const NaceSectorSchema = z.object({
  code: z.string(),
  level: z.enum(['section', 'division']),
  parentCode: z.string().nullable(),
  labelEs: z.string(),
  labelEn: z.string(),
});
export type NaceSector = z.infer<typeof NaceSectorSchema>;

/** Materialidad sembrada en catálogo por sector × scope/categoría. */
export const IndustryMaterialitySchema = z.object({
  sectorCode: z.string(),
  scopeCategory: ScopeCategorySchema,
  materiality: IndustryMaterialityLevelSchema,
  sourceFramework: MaterialityFrameworkSchema,
  notes: z.string().nullable(),
});
export type IndustryMateriality = z.infer<typeof IndustryMaterialitySchema>;

/** Override per-organization sobre la matriz industry_materiality. */
export const OrgMaterialityOverrideSchema = z.object({
  sectorCode: z.string(),
  scopeCategory: ScopeCategorySchema,
  materiality: IndustryMaterialityLevelSchema,
  justification: z.string(),
  setAt: z.string(),
});
export type OrgMaterialityOverride = z.infer<typeof OrgMaterialityOverrideSchema>;

// ── Resolver ──────────────────────────────────────────────────────────

export type MaterialitySource = 'override' | MaterialityFramework | 'inherit';

export interface ResolvedMateriality {
  level: IndustryMaterialityLevel;
  source: MaterialitySource;
  notes: string | null;
  /** Sector que aportó el valor (si fue por inheritance, será el padre). */
  resolvedFrom: string;
}

const FRAMEWORK_ORDER: MaterialityFramework[] = [
  'EFRAG_ESRS',
  'GHG_Protocol',
  'SASB',
  'NFQ_internal',
];

/**
 * Resolución de materialidad efectiva por sector × scope/categoría.
 *
 * Orden de preferencia:
 *   1. Override per-organization — siempre gana.
 *   2. Match exacto en industry_materiality (priorizando EFRAG > GHG > SASB > NFQ).
 *   3. Si el sector es una división (e.g. 'C.10'), fallback a la sección padre ('C').
 *   4. Si nada coincide, level=0, source='inherit'.
 */
export function resolveMateriality(
  sectorCode: string,
  scopeCategory: ScopeCategory,
  catalog: IndustryMateriality[],
  overrides: OrgMaterialityOverride[],
): ResolvedMateriality {
  const override = overrides.find(
    (o) => o.sectorCode === sectorCode && o.scopeCategory === scopeCategory,
  );
  if (override) {
    return {
      level: override.materiality,
      source: 'override',
      notes: override.justification,
      resolvedFrom: sectorCode,
    };
  }

  const direct = catalog.filter(
    (m) => m.sectorCode === sectorCode && m.scopeCategory === scopeCategory,
  );
  if (direct.length > 0) {
    const winner = [...direct].sort(
      (a, b) =>
        FRAMEWORK_ORDER.indexOf(a.sourceFramework) -
        FRAMEWORK_ORDER.indexOf(b.sourceFramework),
    )[0]!;
    return {
      level: winner.materiality,
      source: winner.sourceFramework,
      notes: winner.notes,
      resolvedFrom: sectorCode,
    };
  }

  if (sectorCode.includes('.')) {
    const parentCode = sectorCode.split('.')[0]!;
    const parentMatches = catalog.filter(
      (m) => m.sectorCode === parentCode && m.scopeCategory === scopeCategory,
    );
    if (parentMatches.length > 0) {
      const winner = [...parentMatches].sort(
        (a, b) =>
          FRAMEWORK_ORDER.indexOf(a.sourceFramework) -
          FRAMEWORK_ORDER.indexOf(b.sourceFramework),
      )[0]!;
      return {
        level: winner.materiality,
        source: 'inherit',
        notes: winner.notes,
        resolvedFrom: parentCode,
      };
    }
  }

  return { level: 0, source: 'inherit', notes: null, resolvedFrom: sectorCode };
}

/** Ordering canónico para mostrar en UI (10 categorías clave sembradas). */
export const SCOPE_CATEGORIES_ORDER: ScopeCategory[] = [
  's1',
  's2',
  's3.cat1',
  's3.cat3',
  's3.cat4',
  's3.cat5',
  's3.cat6',
  's3.cat7',
  's3.cat11',
  's3.cat15',
];

export const SCOPE_CATEGORY_LABELS: Record<ScopeCategory, string> = {
  s1: 'S1 · Direct',
  s2: 'S2 · Electricity',
  's3.cat1': 'S3.1 · Goods & services',
  's3.cat2': 'S3.2 · Capital goods',
  's3.cat3': 'S3.3 · Fuel & energy (WTT)',
  's3.cat4': 'S3.4 · Upstream transport',
  's3.cat5': 'S3.5 · Operational waste',
  's3.cat6': 'S3.6 · Business travel',
  's3.cat7': 'S3.7 · Employee commute',
  's3.cat8': 'S3.8 · Upstream leased',
  's3.cat9': 'S3.9 · Downstream transport',
  's3.cat10': 'S3.10 · Processing of sold products',
  's3.cat11': 'S3.11 · Use of sold products',
  's3.cat12': 'S3.12 · End-of-life',
  's3.cat13': 'S3.13 · Downstream leased',
  's3.cat14': 'S3.14 · Franchises',
  's3.cat15': 'S3.15 · Investments (PCAF)',
};
