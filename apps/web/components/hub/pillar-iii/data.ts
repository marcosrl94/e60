/**
 * EBA Pillar III ESG · ITS templates
 *
 * The 10 TBLs the EBA Implementing Technical Standards require for the
 * banking-book climate disclosures. The TBL records live in
 * `apps/web/data/seed/pillar-tbls.json` (forwarded by MSWProvider as the
 * `/pillar-iii/tbls` endpoint payload); this file just declares the typed
 * shape and re-exports the seed for server components and the MSW seed
 * builder.
 */

import type { PillarTblSummary } from '@e60/api-client/mock';
import seed from '@/data/seed/pillar-tbls.json';

/** Re-export the API-level shape under the app-friendly name. The full
 * template (narrative, feedingDatapointIds, signoff…) is what the
 * /pillar-iii/tbls endpoint returns; cards + drawer share that single shape. */
export type TblTemplate = PillarTblSummary;
export type TblStatus = TblTemplate['status'];

export const TBLS = seed as unknown as TblTemplate[];

export const STATUS_LABEL: Record<TblStatus, string> = {
  live: 'Live',
  in_prep: 'In prep',
  methodology_gap: 'Methodology gap',
  scheduled: 'Scheduled',
};

export const FAMILY_LABEL: Record<TblTemplate['family'], string> = {
  transition: 'Transition risk',
  physical: 'Physical risk',
  taxonomy: 'Taxonomy KPI',
  mitigation: 'Mitigating action',
};
