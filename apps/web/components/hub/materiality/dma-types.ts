/**
 * Shared shapes for the DMA view, used by the orchestrator and the
 * matrix/drawer/list children. We keep them in a tiny module so all
 * three client components import from the same canonical place
 * without going through @e60/api-client.
 */

import type {
  DmaIro,
  EsrsTopic,
  FinancialScore,
  ImpactScore,
  SustainabilityMatter,
} from '@e60/domain';

/** Compact datapoint shape for the IRO picker (id + name + topic). */
export interface DatapointPickerOption {
  id: string;
  name: string;
  topic: EsrsTopic;
}

export interface MatterScoreRecord {
  matterId: string;
  impact: ImpactScore | null;
  financial: FinancialScore | null;
  notes: string | null;
  updatedAt: string;
}

export interface DmaContext {
  assessmentId: string;
  period: string;
  threshold: number;
  matters: SustainabilityMatter[];
  /** Keyed by matterId for O(1) lookup; missing keys mean unscored. */
  scoresByMatter: Record<string, MatterScoreRecord>;
  /** Keyed by matterId. Missing keys mean no IROs registered yet. */
  irosByMatter: Record<string, DmaIro[]>;
  /**
   * Catalogue of EFRAG datapoints grouped by ESRS topic, supplied
   * pre-filtered to the topics that have matters (so the picker only
   * loads the ~50-150 relevant DPs instead of the full 1184 set).
   */
  datapointsByTopic: Record<string, DatapointPickerOption[]>;
}
