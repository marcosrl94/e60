'use client';

import { create } from 'zustand';
import type {
  DatapointStatus,
  DatapointWorkflowStatus,
  EsrsTopic,
  LineageSource,
  RegulatoryCrosswalk,
} from '@e60/domain';

export type CategoryFilter = 'all' | 'environmental' | 'social' | 'governance' | 'cross';
export type ScopeFilter = 'all' | 'mandatory' | 'voluntary' | 'phased_in' | 'conditional';
export type SourceFilter = LineageSource | 'all';
export type WorkflowFilter = DatapointWorkflowStatus | 'all';

interface RepositoryFilterState {
  category: CategoryFilter;
  status: DatapointStatus | 'all';
  scope: ScopeFilter;
  crosswalk: RegulatoryCrosswalk | 'all';
  /** Lineage source (manual / computed / carbon-intel / data-layer / external). */
  source: SourceFilter;
  /** Workflow approval status (empty / draft / review / approved / locked). */
  workflowStatus: WorkflowFilter;
  /** True = restrict to datapoints feeding at least one IRO whose
   *  parent matter is declared material in the user's active DMA. */
  materialOnly: boolean;
  search: string;
  selectedId: string | null;
  setCategory: (c: CategoryFilter) => void;
  setStatus: (s: DatapointStatus | 'all') => void;
  setScope: (s: ScopeFilter) => void;
  setCrosswalk: (c: RegulatoryCrosswalk | 'all') => void;
  setSource: (s: SourceFilter) => void;
  setWorkflowStatus: (w: WorkflowFilter) => void;
  setMaterialOnly: (v: boolean) => void;
  setSearch: (q: string) => void;
  selectDatapoint: (id: string | null) => void;
  reset: () => void;
}

const TOPIC_TO_CATEGORY: Record<EsrsTopic, CategoryFilter> = {
  E1: 'environmental',
  E2: 'environmental',
  E3: 'environmental',
  E4: 'environmental',
  E5: 'environmental',
  S1: 'social',
  S2: 'social',
  S3: 'social',
  S4: 'social',
  G1: 'governance',
  GENERAL: 'cross',
};

export function topicCategory(topic: EsrsTopic): CategoryFilter {
  return TOPIC_TO_CATEGORY[topic];
}

export const useRepositoryFilters = create<RepositoryFilterState>((set) => ({
  category: 'all',
  status: 'all',
  scope: 'all',
  crosswalk: 'all',
  source: 'all',
  workflowStatus: 'all',
  materialOnly: false,
  search: '',
  selectedId: null,
  setCategory: (category) => set({ category }),
  setStatus: (status) => set({ status }),
  setScope: (scope) => set({ scope }),
  setCrosswalk: (crosswalk) => set({ crosswalk }),
  setSource: (source) => set({ source }),
  setWorkflowStatus: (workflowStatus) => set({ workflowStatus }),
  setMaterialOnly: (materialOnly) => set({ materialOnly }),
  setSearch: (search) => set({ search }),
  selectDatapoint: (selectedId) => set({ selectedId }),
  reset: () =>
    set({
      category: 'all',
      status: 'all',
      scope: 'all',
      crosswalk: 'all',
      source: 'all',
      workflowStatus: 'all',
      materialOnly: false,
      search: '',
      selectedId: null,
    }),
}));
