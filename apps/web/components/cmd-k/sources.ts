import type { Route } from 'next';
import type { Datapoint, EmissionFactor, NaceSector } from '@e60/domain';

/**
 * Search index source for the Cmd+K palette.
 *
 * Each result has a `kind` discriminator that drives the icon, the group
 * header and the activation handler in CommandPalette.tsx. Built from the
 * existing seeds + a hand-curated routes list.
 */

export type ResultKind = 'route' | 'datapoint' | 'sector' | 'factor' | 'disclosure';

interface BaseResult<K extends ResultKind> {
  kind: K;
  /** Stable id used as React key + for deduplication. */
  id: string;
  label: string;
  sublabel?: string;
}

export interface RouteResult extends BaseResult<'route'> {
  kind: 'route';
  href: Route;
}

export interface DatapointResult extends BaseResult<'datapoint'> {
  kind: 'datapoint';
  /** ESRS topic for badge color. */
  topic: Datapoint['topic'];
}

export interface SectorResult extends BaseResult<'sector'> {
  kind: 'sector';
  level: NaceSector['level'];
}

export interface FactorResult extends BaseResult<'factor'> {
  kind: 'factor';
  scope: EmissionFactor['scope'];
  source: EmissionFactor['source'];
}

export interface DisclosureResult extends BaseResult<'disclosure'> {
  kind: 'disclosure';
  framework: string;
}

export type AnyResult =
  | RouteResult
  | DatapointResult
  | SectorResult
  | FactorResult
  | DisclosureResult;

export const ROUTES: RouteResult[] = [
  { kind: 'route', id: 'r-overview', label: 'Overview', sublabel: 'Disclosure Hub · KPIs + activity', href: '/disclosure-hub/overview' },
  { kind: 'route', id: 'r-repository', label: 'Datapoint Repository', sublabel: '1,184 EFRAG datapoints', href: '/disclosure-hub/repository' },
  { kind: 'route', id: 'r-materiality', label: 'Materiality Studio', sublabel: 'Industry pre-screening heatmap', href: '/disclosure-hub/materiality' },
  { kind: 'route', id: 'r-ci', label: 'Carbon Intelligence', sublabel: 'Operational footprint · Scope 1+2+3 own', href: '/disclosure-hub/carbon-intelligence' },
  { kind: 'route', id: 'r-financed', label: 'Financed Emissions', sublabel: 'ALQUID NZ · PCAF v3', href: '/disclosure-hub/financed-emissions' },
  { kind: 'route', id: 'r-netzero', label: 'Net Zero Trajectory', sublabel: 'ALQUID NZ · SBTi 1.5°C', href: '/disclosure-hub/net-zero-trajectory' },
  { kind: 'route', id: 'r-outputs', label: 'Output Generators', sublabel: 'Disclosure catalogue · CSRD / CDP / Pillar III', href: '/disclosure-hub/outputs' },
  { kind: 'route', id: 'r-pillar', label: 'Pillar III ESG', sublabel: 'Banking ITS · TBL 1-10 · inside Disclosure Hub', href: '/disclosure-hub/pillar-iii' },
  { kind: 'route', id: 'r-climate', label: 'Climate Lab', sublabel: 'Physical + transition risk', href: '/climate-lab' },
  { kind: 'route', id: 'r-sustainable', label: 'Sustainable Finance', sublabel: 'CBAM · GAR · Taxonomy · Green Bonds', href: '/sustainable-finance' },
  { kind: 'route', id: 'r-cbam', label: 'CBAM', sublabel: 'Carbon Border Adjustment Mechanism (placeholder)', href: '/sustainable-finance/cbam' },
  { kind: 'route', id: 'r-data', label: 'Data Layer', sublabel: 'Quality · lineage · connectors', href: '/data-layer' },
  { kind: 'route', id: 'r-trust', label: 'Trust Center', sublabel: 'Audit · compliance · sign-offs', href: '/trust-center' },
];

export interface BuildIndexInput {
  datapoints: Datapoint[];
  sectors: NaceSector[];
  factors: EmissionFactor[];
}

export interface BuildIndexOutput {
  routes: RouteResult[];
  datapoints: DatapointResult[];
  sectors: SectorResult[];
  factors: FactorResult[];
  disclosures: DisclosureResult[];
}

const DISCLOSURES_STATIC: DisclosureResult[] = [
  { kind: 'disclosure', id: 'd-csrd', label: 'Estado de información sostenibilidad 2025', sublabel: 'Published · audit KPMG', framework: 'CSRD · ESRS' },
  { kind: 'disclosure', id: 'd-cdp', label: 'CDP Climate Change · response', sublabel: 'Submitted · score A−', framework: 'CDP CLIMATE 2025' },
  { kind: 'disclosure', id: 'd-pillar3', label: 'Pillar III ESG · Q4 2025', sublabel: 'In prep · CRO sign-off pending', framework: 'EBA · PILLAR III ESG' },
  { kind: 'disclosure', id: 'd-djsi', label: 'DJSI Corporate Sustainability Assessment', sublabel: 'In prep · 14/22 sections', framework: 'S&P · DJSI / CSA' },
  { kind: 'disclosure', id: 'd-prb', label: 'Principles Responsible Banking · annual', sublabel: 'Published · v2.1', framework: 'UNEP-FI · PRB' },
  { kind: 'disclosure', id: 'd-board', label: 'Board ESG Dashboard · Q1 2026', sublabel: 'Scheduled · 38 KPIs', framework: 'INTERNAL · BOARD' },
];

export function buildIndex({
  datapoints,
  sectors,
  factors,
}: BuildIndexInput): BuildIndexOutput {
  return {
    routes: ROUTES,
    datapoints: datapoints.map((d) => ({
      kind: 'datapoint' as const,
      id: `dp-${d.id}`,
      label: d.name,
      sublabel: `${d.id}${d.esrsDisclosure ? ` · ${d.esrsDisclosure}` : ''}${d.paragraph ? ` · § ${d.paragraph}` : ''}`,
      topic: d.topic,
    })),
    sectors: sectors.map((s) => ({
      kind: 'sector' as const,
      id: `sec-${s.code}`,
      label: s.labelEs,
      sublabel: `NACE ${s.code} · ${s.level === 'section' ? 'Section' : 'Division'}${s.parentCode ? ` of ${s.parentCode}` : ''}`,
      level: s.level,
    })),
    factors: factors.map((f) => ({
      kind: 'factor' as const,
      id: `f-${f.activityKey}`,
      label: f.activityLabel,
      sublabel: `${f.activityKey} · ${f.scope.toUpperCase()} · ${f.source} · ${f.region} · ${f.year}`,
      scope: f.scope,
      source: f.source,
    })),
    disclosures: DISCLOSURES_STATIC,
  };
}

/**
 * Lower-case substring match with a 3-tier ranking:
 *   3 = label or id starts with query
 *   2 = label / sublabel substring
 *   1 = id substring
 *   0 = no match
 */
export function score(query: string, r: AnyResult): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const label = r.label.toLowerCase();
  const sub = (r.sublabel ?? '').toLowerCase();
  const id = r.id.toLowerCase();
  // also score against natural identifier (strip the prefix `dp-`, `sec-`, etc.)
  const naturalId = id.replace(/^[a-z]+-/, '');
  if (label.startsWith(q) || naturalId.startsWith(q)) return 3;
  if (label.includes(q)) return 2;
  if (sub.includes(q)) return 2;
  if (naturalId.includes(q)) return 1;
  return 0;
}
