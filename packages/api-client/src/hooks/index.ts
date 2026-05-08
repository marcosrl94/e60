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
  EmissionFactor,
  IndustryMateriality,
  NaceSector,
} from '@e60/domain';
import type { PillarTblSummary } from '../mock/handlers';

const BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) ||
  '/api/v1';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API ${res.status} on ${path}`);
  }
  return (await res.json()) as T;
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
  const qs = new URLSearchParams();
  if (params?.scope) qs.set('scope', params.scope);
  if (params?.source) qs.set('source', params.source);
  return useQuery<EmissionFactor[], Error>({
    queryKey: QUERY_KEYS.emissionFactors(params),
    queryFn: () => get<EmissionFactor[]>(`/emission-factors${qs.size ? `?${qs}` : ''}`),
    staleTime: 5 * 60 * 1000,
    ...opts,
  });
}

export function useDatapoints(
  params?: { topic?: string; search?: string },
  opts?: Opts<{ items: Datapoint[]; total: number }>,
) {
  const qs = new URLSearchParams();
  if (params?.topic) qs.set('topic', params.topic);
  if (params?.search) qs.set('search', params.search);
  return useQuery<{ items: Datapoint[]; total: number }, Error>({
    queryKey: QUERY_KEYS.datapoints(params),
    queryFn: () =>
      get<{ items: Datapoint[]; total: number }>(
        `/datapoints${qs.size ? `?${qs}` : ''}`,
      ),
    staleTime: 5 * 60 * 1000,
    ...opts,
  });
}

export function useDatapoint(id: string, opts?: Opts<Datapoint>) {
  return useQuery<Datapoint, Error>({
    queryKey: QUERY_KEYS.datapoint(id),
    queryFn: () => get<Datapoint>(`/datapoints/${id}`),
    enabled: !!id,
    ...opts,
  });
}

export function useNaceSectors(opts?: Opts<NaceSector[]>) {
  return useQuery<NaceSector[], Error>({
    queryKey: QUERY_KEYS.naceSectors(),
    queryFn: () => get<NaceSector[]>('/materiality/sectors'),
    staleTime: 60 * 60 * 1000,
    ...opts,
  });
}

export function useIndustryMateriality(opts?: Opts<IndustryMateriality[]>) {
  return useQuery<IndustryMateriality[], Error>({
    queryKey: QUERY_KEYS.industryMateriality(),
    queryFn: () => get<IndustryMateriality[]>('/materiality/catalogue'),
    staleTime: 60 * 60 * 1000,
    ...opts,
  });
}

export function usePillarTbls(opts?: Opts<PillarTblSummary[]>) {
  return useQuery<PillarTblSummary[], Error>({
    queryKey: QUERY_KEYS.pillarTbls(),
    queryFn: () => get<PillarTblSummary[]>('/pillar-iii/tbls'),
    staleTime: 5 * 60 * 1000,
    ...opts,
  });
}
