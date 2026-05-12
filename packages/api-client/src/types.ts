/**
 * Public types for `@e60/api-client`.
 *
 * Types here describe API response shapes that aren't generated yet from
 * OpenAPI (or that the UI uses without round-tripping through generated
 * client code). When the FastAPI team publishes the canonical openapi.yaml
 * and we regenerate, prefer importing from `./types.gen` instead.
 */

/**
 * Full TBL template shape returned by /pillar-iii/tbls (and stored in
 * `public.pillar_tbls`). Carries everything the gallery cards and the
 * detail drawer need — drawer no longer reads from a local const.
 */
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
