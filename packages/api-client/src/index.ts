/**
 * E6.0 API client
 *
 * Typed client for the E6.0 backend API. The backend exposes an OpenAPI 3.1
 * specification; types are generated automatically by running:
 *
 *   pnpm --filter @e60/api-client generate
 *
 * (requires E60_OPENAPI_URL env var pointing at the backend's /openapi.json)
 *
 * The generated types live in `src/types.gen.ts` and are imported by the
 * fetcher functions below.
 *
 * For local development without a running backend, see `./mock` for MSW handlers.
 */

import type {
  Datapoint,
  Disclosure,
  MaterialTopic,
  Iro,
  Stakeholder,
  Assessment,
  FinancedEmissions,
  PortfolioMetrics,
} from '@e60/domain';

// ============================================================================
// Configuration
// ============================================================================

const BASE_URL =
  // Read from env at runtime in Next.js
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) ||
  '/api/v1';

interface FetchOptions extends RequestInit {
  /** Optional bank tenant ID for multi-tenant deployments */
  tenant?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { tenant, ...rest } = options;
  const headers = new Headers(rest.headers);
  headers.set('Content-Type', 'application/json');
  if (tenant) headers.set('X-Tenant', tenant);

  const res = await fetch(`${BASE_URL}${path}`, { ...rest, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      `API ${res.status}: ${res.statusText}`,
      res.status,
      body
    );
  }

  return (await res.json()) as T;
}

// ============================================================================
// Endpoints (placeholder shape — to be regenerated from OpenAPI when backend is ready)
// ============================================================================

export const api = {
  datapoints: {
    list: (params?: { topic?: string; status?: string }) =>
      apiFetch<{ items: Datapoint[]; total: number }>(
        `/datapoints${params ? `?${new URLSearchParams(params)}` : ''}`
      ),
    get: (id: string) => apiFetch<Datapoint>(`/datapoints/${id}`),
  },
  disclosures: {
    list: () => apiFetch<{ items: Disclosure[] }>('/disclosures'),
    get: (id: string) => apiFetch<Disclosure>(`/disclosures/${id}`),
  },
  materiality: {
    topics: (year: number) =>
      apiFetch<MaterialTopic[]>(`/materiality/topics?year=${year}`),
    iros: (params?: { topicId?: string; type?: string }) =>
      apiFetch<{ items: Iro[]; total: number }>(
        `/materiality/iros${params ? `?${new URLSearchParams(params)}` : ''}`
      ),
    stakeholders: (year: number) =>
      apiFetch<Stakeholder[]>(`/materiality/stakeholders?year=${year}`),
    currentAssessment: () => apiFetch<Assessment>('/materiality/assessment/current'),
  },
  pcaf: {
    portfolio: () => apiFetch<PortfolioMetrics>('/pcaf/portfolio'),
    counterparties: () =>
      apiFetch<{ items: FinancedEmissions[] }>('/pcaf/counterparties'),
  },
};

export { ApiError };
