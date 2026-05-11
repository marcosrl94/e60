/**
 * TanStack Query hooks per domain.
 *
 * Each hook wraps a typed fetch call against the OpenAPI-described endpoint.
 * Stable queryKeys + initialData support let the consumer hydrate from a
 * local seed (Server Component) and refetch in the background, so the SSR
 * HTML doesn't flash empty.
 *
 * Usage:
 *
 *   const { data } = useEmissionFactors({ initialData: seedFactors });
 *
 * Replaces direct seed JSON imports in client components.
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type {
  Datapoint,
  DatapointStatus,
  DatapointType,
  EmissionFactor,
  EsrsTopic,
  FrameworkMapping,
  IndustryMateriality,
  IndustryMaterialityLevel,
  MaterialityFramework,
  NaceSector,
  PhaseInYears,
  RegulatoryCrosswalk,
  ScopeCategory,
} from '@e60/domain';
import type { PillarTblSummary } from '../mock/handlers';

// ── Supabase PostgREST direct read ───────────────────────────────────
// Catalogue tables (emission_factors, datapoints, nace_sectors,
// industry_materiality, pillar_tbls) are anon-readable via RLS, so the
// publishable key is enough — no server-side proxy needed.

const SUPABASE_URL =
  typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined;
const SUPABASE_KEY =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    : undefined;

async function pgrest<T>(table: string, query: string): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase env not configured');
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase ${res.status} on ${table}: ${await res.text()}`);
  }
  return (await res.json()) as T;
}

// Supabase enforces a server-side 1000-row cap on PostgREST. For tables
// that may exceed it (e.g. 1184-row EFRAG catalogue) we paginate client-side
// with `offset` + `limit=1000` until exhausted, reading the total from the
// first response's Content-Range header.
const PAGE_SIZE = 1000;

async function pgrestPaginated<T>(
  table: string,
  query: string,
): Promise<{ rows: T[]; total: number }> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase env not configured');
  }
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    Prefer: 'count=exact',
  };

  const fetchPage = async (offset: number) => {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?${query}&limit=${PAGE_SIZE}&offset=${offset}`,
      { headers },
    );
    if (!res.ok) {
      throw new Error(`Supabase ${res.status} on ${table}: ${await res.text()}`);
    }
    const page = (await res.json()) as T[];
    const range = res.headers.get('content-range') ?? '';
    const total = Number(range.split('/')[1] ?? page.length);
    return { page, total };
  };

  const first = await fetchPage(0);
  const rows: T[] = first.page;
  const total = first.total;
  for (let offset = PAGE_SIZE; offset < total; offset += PAGE_SIZE) {
    const next = await fetchPage(offset);
    rows.push(...next.page);
  }
  return { rows, total };
}

// Row shape returned by PostgREST (snake_case Postgres columns).
type EmissionFactorRow = {
  activity_key: string;
  scope: EmissionFactor['scope'];
  category: string;
  subcategory: string | null;
  activity_label: string;
  unit: 'kgCO2e';
  ef_value: number;
  ef_unit: string;
  source: EmissionFactor['source'];
  source_version: string | null;
  year: number;
  region: string;
  citation_url: string | null;
  notes: string | null;
};

function mapEmissionFactor(row: EmissionFactorRow): EmissionFactor {
  return {
    activityKey: row.activity_key,
    scope: row.scope,
    category: row.category,
    subcategory: row.subcategory ?? undefined,
    activityLabel: row.activity_label,
    unit: row.unit,
    efValue: Number(row.ef_value),
    efUnit: row.ef_unit,
    source: row.source,
    sourceVersion: row.source_version ?? undefined,
    year: row.year,
    region: row.region,
    citationUrl: row.citation_url ?? undefined,
    notes: row.notes ?? undefined,
  };
}

type DatapointRow = {
  id: string;
  efrag_id: string | null;
  name: string;
  definition: string | null;
  topic: EsrsTopic;
  esrs_disclosure: string | null;
  paragraph: string | null;
  related_ar: string | null;
  type: DatapointType;
  unit: string | null;
  status: DatapointStatus;
  mappings: FrameworkMapping[] | null;
  crosswalk: RegulatoryCrosswalk[] | null;
  phase_in_years: PhaseInYears | null;
  conditional: boolean | null;
  may_disclose: boolean | null;
  voluntary: boolean | null;
  latest_value: string | null;
  numeric_value: number | null;
  source: Datapoint['source'] | null;
  owner: string | null;
  is_custom: boolean | null;
  tags: string[] | null;
};

function mapDatapoint(row: DatapointRow): Datapoint {
  return {
    id: row.id,
    efragId: row.efrag_id ?? undefined,
    name: row.name,
    definition: row.definition ?? undefined,
    topic: row.topic,
    esrsDisclosure: row.esrs_disclosure ?? undefined,
    paragraph: row.paragraph ?? undefined,
    relatedAr: row.related_ar ?? undefined,
    type: row.type,
    unit: row.unit ?? undefined,
    status: row.status,
    mappings: row.mappings ?? [],
    crosswalk: row.crosswalk ?? [],
    phaseInYears: row.phase_in_years ?? undefined,
    conditional: row.conditional ?? false,
    mayDisclose: row.may_disclose ?? false,
    voluntary: row.voluntary ?? false,
    latestValue: row.latest_value ?? undefined,
    numericValue: row.numeric_value ?? undefined,
    source: row.source ?? undefined,
    owner: row.owner ?? undefined,
    isCustom: row.is_custom ?? false,
    tags: row.tags ?? [],
  };
}

type NaceSectorRow = {
  code: string;
  level: 'section' | 'division';
  parent_code: string | null;
  label_es: string;
  label_en: string;
};

function mapNaceSector(row: NaceSectorRow): NaceSector {
  return {
    code: row.code,
    level: row.level,
    parentCode: row.parent_code,
    labelEs: row.label_es,
    labelEn: row.label_en,
  };
}

type IndustryMaterialityRow = {
  sector_code: string;
  scope_category: ScopeCategory;
  materiality: IndustryMaterialityLevel;
  source_framework: MaterialityFramework;
  notes: string | null;
};

function mapIndustryMateriality(row: IndustryMaterialityRow): IndustryMateriality {
  return {
    sectorCode: row.sector_code,
    scopeCategory: row.scope_category,
    materiality: row.materiality,
    sourceFramework: row.source_framework,
    notes: row.notes,
  };
}

type PillarTblRow = {
  num: number;
  code: string;
  title: string;
  summary: string | null;
  family: PillarTblSummary['family'];
  status: PillarTblSummary['status'];
  datapoint_count: number | null;
  row_count: number | null;
  narrative: string;
  feeding_datapoint_ids: string[] | null;
  signoff: PillarTblSummary['signoff'];
  deadline: string;
};

function mapPillarTbl(row: PillarTblRow): PillarTblSummary {
  return {
    num: row.num,
    code: row.code,
    title: row.title,
    summary: row.summary ?? undefined,
    family: row.family,
    status: row.status,
    datapointCount: row.datapoint_count ?? undefined,
    rowCount: row.row_count ?? undefined,
    narrative: row.narrative,
    feedingDatapointIds: row.feeding_datapoint_ids ?? [],
    signoff: row.signoff,
    deadline: row.deadline,
  };
}

// ── Stable query keys ────────────────────────────────────────────────

export const QUERY_KEYS = {
  emissionFactors: (params?: { scope?: string; source?: string }) =>
    ['emission-factors', params ?? {}] as const,
  datapoints: (params?: { topic?: string; search?: string }) =>
    ['datapoints', params ?? {}] as const,
  datapoint: (id: string) => ['datapoint', id] as const,
  naceSectors: () => ['nace-sectors'] as const,
  industryMateriality: () => ['industry-materiality'] as const,
  pillarTbls: () => ['pillar-tbls'] as const,
};

// ── Hooks ────────────────────────────────────────────────────────────

type Opts<T> = Omit<UseQueryOptions<T, Error, T>, 'queryKey' | 'queryFn'>;

export function useEmissionFactors(
  params?: { scope?: string; source?: string },
  opts?: Opts<EmissionFactor[]>,
) {
  const filters: string[] = ['select=*'];
  if (params?.scope) filters.push(`scope=eq.${encodeURIComponent(params.scope)}`);
  if (params?.source) filters.push(`source=eq.${encodeURIComponent(params.source)}`);
  filters.push('order=activity_key');
  return useQuery<EmissionFactor[], Error>({
    queryKey: QUERY_KEYS.emissionFactors(params),
    queryFn: async () => {
      const rows = await pgrest<EmissionFactorRow[]>(
        'emission_factors',
        filters.join('&'),
      );
      return rows.map(mapEmissionFactor);
    },
    staleTime: 5 * 60 * 1000,
    ...opts,
  });
}

export function useDatapoints(
  params?: { topic?: string; search?: string },
  opts?: Opts<{ items: Datapoint[]; total: number }>,
) {
  const filters: string[] = ['select=*'];
  if (params?.topic) filters.push(`topic=eq.${encodeURIComponent(params.topic)}`);
  if (params?.search) {
    // Case-insensitive substring match on name. PostgREST `ilike` needs
    // wildcards embedded in the value.
    const needle = `*${params.search.replace(/[*]/g, '')}*`;
    filters.push(`name=ilike.${encodeURIComponent(needle)}`);
  }
  filters.push('order=id');
  return useQuery<{ items: Datapoint[]; total: number }, Error>({
    queryKey: QUERY_KEYS.datapoints(params),
    queryFn: async () => {
      const { rows, total } = await pgrestPaginated<DatapointRow>(
        'datapoints',
        filters.join('&'),
      );
      return { items: rows.map(mapDatapoint), total };
    },
    staleTime: 5 * 60 * 1000,
    ...opts,
  });
}

export function useDatapoint(id: string, opts?: Opts<Datapoint>) {
  return useQuery<Datapoint, Error>({
    queryKey: QUERY_KEYS.datapoint(id),
    queryFn: async () => {
      const rows = await pgrest<DatapointRow[]>(
        'datapoints',
        `select=*&id=eq.${encodeURIComponent(id)}&limit=1`,
      );
      if (rows.length === 0) throw new Error(`Datapoint ${id} not found`);
      return mapDatapoint(rows[0]!);
    },
    enabled: !!id,
    ...opts,
  });
}

export function useNaceSectors(opts?: Opts<NaceSector[]>) {
  return useQuery<NaceSector[], Error>({
    queryKey: QUERY_KEYS.naceSectors(),
    queryFn: async () => {
      const rows = await pgrest<NaceSectorRow[]>(
        'nace_sectors',
        'select=*&order=code',
      );
      return rows.map(mapNaceSector);
    },
    staleTime: 60 * 60 * 1000,
    ...opts,
  });
}

export function useIndustryMateriality(opts?: Opts<IndustryMateriality[]>) {
  return useQuery<IndustryMateriality[], Error>({
    queryKey: QUERY_KEYS.industryMateriality(),
    queryFn: async () => {
      const rows = await pgrest<IndustryMaterialityRow[]>(
        'industry_materiality',
        'select=*&order=sector_code',
      );
      return rows.map(mapIndustryMateriality);
    },
    staleTime: 60 * 60 * 1000,
    ...opts,
  });
}

export function usePillarTbls(opts?: Opts<PillarTblSummary[]>) {
  return useQuery<PillarTblSummary[], Error>({
    queryKey: QUERY_KEYS.pillarTbls(),
    queryFn: async () => {
      const rows = await pgrest<PillarTblRow[]>(
        'pillar_tbls',
        'select=*&order=num',
      );
      return rows.map(mapPillarTbl);
    },
    staleTime: 5 * 60 * 1000,
    ...opts,
  });
}
