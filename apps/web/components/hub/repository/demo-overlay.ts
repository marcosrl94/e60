import type { Datapoint, DatapointStatus, FrameworkMapping } from '@e60/domain';

/**
 * Demo overlay
 *
 * The EFRAG seed in `apps/web/data/seed/datapoints.json` is a pure dictionary
 * (1184 datapoints, no statuses, no values). To make the Repository view look
 * alive without reaching the real backend, this module overlays a deterministic
 * "Pilot Bank Iberia" status + value + framework-mapping snapshot.
 *
 * The mapping is keyed off the datapoint id so the same seed always produces
 * the same demo state. When the real API is wired up, replace this with the
 * server response.
 */

// Deterministic hash so we don't depend on Math.random
function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Curated highlights — these match the entries shown in the mockup and the
// KPI row on the Hub Overview page so the demo feels coherent across views.
const HIGHLIGHTS: Record<
  string,
  Partial<Pick<Datapoint, 'status' | 'latestValue' | 'numericValue' | 'unit' | 'mappings' | 'source' | 'owner'>>
> = {
  'E1-6_01': {
    status: 'live',
    latestValue: '23,447',
    numericValue: 23447,
    unit: 'tCO₂e',
    owner: 'CSO Office · Marta Cabrera',
    source: {
      type: 'engine',
      identifier: 'carbon_intelligence',
      lastSync: '2026-05-08T14:23:00Z',
      dataQualityScore: 2,
    },
    mappings: [
      { framework: 'CSRD', externalCode: 'ESRS E1-6', authoritative: true },
      { framework: 'GRI', externalCode: 'GRI 305-1+2+3', authoritative: true },
      { framework: 'CDP', externalCode: 'C6.1', authoritative: true },
      { framework: 'SBTI', externalCode: 'annual', authoritative: false },
      { framework: 'UNEP_FI_PRB', externalCode: 'PRB', authoritative: false },
    ],
  },
  'E1-6_02': {
    status: 'live',
    latestValue: '487',
    numericValue: 487,
    unit: 't',
    source: {
      type: 'engine',
      identifier: 'carbon_intelligence',
      lastSync: '2026-05-08T14:23:00Z',
      dataQualityScore: 2,
    },
    mappings: [
      { framework: 'CSRD', externalCode: 'ESRS E1-6', authoritative: true },
      { framework: 'GRI', externalCode: 'GRI 305-1', authoritative: true },
      { framework: 'CDP', externalCode: 'C6.1a', authoritative: true },
    ],
  },
  'E1-7_01': {
    status: 'live',
    latestValue: '142',
    numericValue: 142,
    unit: 'tCO₂e',
    owner: 'CSO Office',
    source: {
      type: 'manual',
      identifier: 'cso_office',
      lastSync: '2026-05-07T11:08:00Z',
    },
    mappings: [
      { framework: 'CSRD', externalCode: 'ESRS E1-7', authoritative: true },
      { framework: 'CDP', externalCode: 'C11', authoritative: true },
    ],
  },
};

// PCAF-style activity bias: certain ESRS DRs are typically captured by the
// engines (live), others are pending workshops/data gaps (blocked).
function statusForDr(dr: string | undefined): DatapointStatus | undefined {
  if (!dr) return undefined;
  // Climate (E1) — heavy engine coverage
  if (/^E1-(6|7|8)/.test(dr)) return 'live';
  if (/^E1-9/.test(dr)) return 'partial';
  // Workforce (S1) — live via HR
  if (/^S1-(9|10|13|14|15|16)/.test(dr)) return 'live';
  // Value chain (S2) — gap
  if (/^S2-/.test(dr)) return 'blocked';
  // Governance (G1) — live via compliance
  if (/^G1-(1|2|3)/.test(dr)) return 'live';
  return undefined;
}

const ALL_STATUSES: DatapointStatus[] = ['live', 'partial', 'pending', 'pending', 'pending'];

const COMMON_MAPPINGS = (
  topic: string,
  dr: string | undefined,
): FrameworkMapping[] => {
  const out: FrameworkMapping[] = [
    { framework: 'CSRD', externalCode: dr ? `ESRS ${dr}` : 'ESRS', authoritative: true },
  ];
  if (topic.startsWith('E1') || topic === 'E1') {
    out.push({ framework: 'TCFD', externalCode: 'metrics', authoritative: false });
  }
  if (topic.startsWith('S')) {
    out.push({ framework: 'GRI', externalCode: 'GRI 4xx', authoritative: false });
  }
  if (topic === 'G1') {
    out.push({ framework: 'GRI', externalCode: 'GRI 205', authoritative: true });
  }
  return out;
};

export function applyDemoOverlay(seed: Datapoint[]): Datapoint[] {
  return seed.map((dp) => {
    const highlight = HIGHLIGHTS[dp.id];
    if (highlight) {
      return { ...dp, ...highlight };
    }
    const drStatus = statusForDr(dp.esrsDisclosure);
    const fallback = ALL_STATUSES[hash(dp.id) % ALL_STATUSES.length];
    const status = drStatus ?? fallback;
    const mappings =
      dp.mappings.length > 0 ? dp.mappings : COMMON_MAPPINGS(dp.topic, dp.esrsDisclosure);
    return { ...dp, status, mappings };
  });
}

export interface RepositoryStats {
  total: number;
  live: number;
  partial: number;
  pending: number;
  blocked: number;
  byCategory: {
    environmental: number;
    social: number;
    governance: number;
    cross: number;
  };
  capturedByCategory: {
    environmental: number;
    social: number;
    governance: number;
    cross: number;
  };
}

export function statsFor(datapoints: Datapoint[]): RepositoryStats {
  const stats: RepositoryStats = {
    total: datapoints.length,
    live: 0,
    partial: 0,
    pending: 0,
    blocked: 0,
    byCategory: { environmental: 0, social: 0, governance: 0, cross: 0 },
    capturedByCategory: { environmental: 0, social: 0, governance: 0, cross: 0 },
  };
  for (const dp of datapoints) {
    if (dp.status === 'live') stats.live++;
    else if (dp.status === 'partial') stats.partial++;
    else if (dp.status === 'blocked') stats.blocked++;
    else stats.pending++;
    const cat: keyof RepositoryStats['byCategory'] =
      dp.topic === 'GENERAL'
        ? 'cross'
        : dp.topic.startsWith('E')
          ? 'environmental'
          : dp.topic.startsWith('S')
            ? 'social'
            : 'governance';
    stats.byCategory[cat]++;
    if (dp.status === 'live' || dp.status === 'partial') {
      stats.capturedByCategory[cat]++;
    }
  }
  return stats;
}
