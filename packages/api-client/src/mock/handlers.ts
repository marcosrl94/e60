/**
 * MSW v2 handlers
 *
 * Each handler matches a path declared in `openapi.yaml` and returns the
 * data the production backend will return. The seed payloads are imported
 * from the consumer app via the registration helper (see `register.ts`)
 * to avoid duplicating the JSON files inside the package — keeps the
 * package portable.
 *
 * Each handler accepts a `getSeed()` function that lazy-resolves the data,
 * so the package itself stays free of seed JSON imports.
 */

import { http, HttpResponse, type RequestHandler } from 'msw';
import type {
  Datapoint,
  EmissionFactor,
  IndustryMateriality,
  NaceSector,
} from '@e60/domain';

export interface MockSeed {
  emissionFactors: EmissionFactor[];
  datapoints: Datapoint[];
  naceSectors: NaceSector[];
  industryMateriality: IndustryMateriality[];
  pillarTbls: PillarTblSummary[];
}

/** Full TBL template shape returned by /pillar-iii/tbls. Carries everything
 * the gallery cards and the detail drawer need — drawer no longer reads
 * from a local const. */
export interface PillarTblSummary {
  num: number;
  code: string;
  title: string;
  summary?: string;
  family: 'transition' | 'physical' | 'taxonomy' | 'mitigation';
  status: 'live' | 'in_prep' | 'methodology_gap' | 'scheduled';
  datapointCount?: number;
  rowCount?: number;
  narrative: string;
  feedingDatapointIds: string[];
  signoff: {
    cro: 'signed' | 'pending' | 'na';
    cso: 'signed' | 'pending' | 'na';
    auditor: 'signed' | 'pending' | 'na';
  };
  deadline: string;
}

const BASE = '/api/v1';

export function buildHandlers(seed: MockSeed): RequestHandler[] {
  return [
    // ── Emission factors ────────────────────────────────────────────
    http.get(`${BASE}/emission-factors`, ({ request }) => {
      const url = new URL(request.url);
      const scope = url.searchParams.get('scope');
      const source = url.searchParams.get('source');
      let result = seed.emissionFactors;
      if (scope) result = result.filter((f) => f.scope === scope);
      if (source) result = result.filter((f) => f.source === source);
      return HttpResponse.json(result);
    }),

    // ── Datapoints ──────────────────────────────────────────────────
    http.get(`${BASE}/datapoints`, ({ request }) => {
      const url = new URL(request.url);
      const topic = url.searchParams.get('topic');
      const search = url.searchParams.get('search')?.toLowerCase() ?? '';
      let items = seed.datapoints;
      if (topic) items = items.filter((d) => d.topic === topic);
      if (search) {
        items = items.filter((d) =>
          `${d.id} ${d.name} ${d.esrsDisclosure ?? ''}`
            .toLowerCase()
            .includes(search),
        );
      }
      return HttpResponse.json({ items, total: items.length });
    }),

    http.get(`${BASE}/datapoints/:id`, ({ params }) => {
      const id = params.id as string;
      const dp = seed.datapoints.find((d) => d.id === id);
      if (!dp) return new HttpResponse(null, { status: 404 });
      return HttpResponse.json(dp);
    }),

    // ── Materiality ─────────────────────────────────────────────────
    http.get(`${BASE}/materiality/sectors`, () =>
      HttpResponse.json(seed.naceSectors),
    ),

    http.get(`${BASE}/materiality/catalogue`, () =>
      HttpResponse.json(seed.industryMateriality),
    ),

    // ── Pillar III ──────────────────────────────────────────────────
    http.get(`${BASE}/pillar-iii/tbls`, () =>
      HttpResponse.json(seed.pillarTbls),
    ),
  ];
}
