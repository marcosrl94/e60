/**
 * Disclosure → datapoint mapping
 *
 * Per-disclosure curated list of ESRS datapoint codes (matching ids in the
 * EFRAG IG3 seed at apps/web/data/seed/datapoints.json). The drawer uses
 * this to render the Datapoints tab grouped by ESRS topic.
 *
 * Replace this hand-curated mapping with a server query against the
 * disclosures.datapoint_ids relation when the backend is ready.
 */

export const DISCLOSURE_DATAPOINTS: Record<string, string[]> = {
  csrd: [
    // ESRS 2 general (always)
    'BP-1_01', 'BP-1_02', 'BP-2_01', 'GOV-1_01', 'GOV-2_01', 'SBM-1_01',
    'SBM-2_01', 'SBM-3_01',
    // E1 climate
    'E1.GOV-3_01', 'E1.GOV-3_02', 'E1-1_01', 'E1-3_01', 'E1-4_01',
    'E1-5_01', 'E1-6_01', 'E1-6_02', 'E1-7_01', 'E1-8_01', 'E1-9_01',
    // E2 pollution (high-level only)
    'E2.IRO-1_01', 'E2-1_01',
    // E3 water
    'E3.IRO-1_01', 'E3-4_01',
    // E4 biodiversity
    'E4.SBM-3_01', 'E4-1_01',
    // E5 resources
    'E5.IRO-1_01', 'E5-1_01',
    // S1 own workforce
    'S1.SBM-3_01', 'S1-1_01', 'S1-9_01', 'S1-14_01',
    // S2 value chain workers
    'S2.SBM-3_01',
    // G1 governance
    'G1.GOV-1_01', 'G1-1_01', 'G1-3_01',
  ],
  cdp: [
    // CDP Climate covers the full E1 set + parts of governance
    'GOV-1_01', 'GOV-2_01', 'SBM-3_01',
    'E1.GOV-3_01', 'E1-1_01', 'E1-3_01', 'E1-4_01',
    'E1-5_01', 'E1-6_01', 'E1-6_02', 'E1-7_01', 'E1-9_01',
  ],
  pillar3: [
    // EBA Pillar III ESG TBL — climate-only banking exposures
    'E1-1_01', 'E1-4_01', 'E1-6_01', 'E1-9_01',
  ],
  djsi: [
    // DJSI / S&P CSA — strong Governance + S + E weighting
    'GOV-1_01', 'GOV-2_01',
    'E1-1_01', 'E1-4_01', 'E1-6_01',
    'S1-9_01', 'S1-14_01',
    'G1.GOV-1_01', 'G1-1_01',
  ],
  prb: [
    // UNEP-FI Principles for Responsible Banking annual template
    'GOV-1_01', 'SBM-1_01',
    'E1-1_01', 'E1-4_01', 'E1-6_01',
    'S1-9_01',
  ],
  board: [
    // Internal Board ESG dashboard — top-level KPIs only
    'E1-6_01', 'E1-4_01',
    'S1-9_01', 'S1-14_01',
    'G1-1_01',
  ],
};
