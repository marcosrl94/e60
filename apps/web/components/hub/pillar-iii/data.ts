/**
 * EBA Pillar III ESG · ITS templates
 *
 * The 10 TBLs the EBA Implementing Technical Standards require for the
 * banking-book climate disclosures. Persistent data lives in
 * `public.pillar_tbls` on Supabase; the JSON seed in
 * `apps/web/data/seed/pillar-tbls.json` is forwarded as TanStack Query
 * `initialData` so SSR HTML stays populated while the hook refetches.
 */

import type { PillarTblSummary } from '@e60/api-client';
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
