'use client';

import { create } from 'zustand';
import type { OrgMaterialityOverride, ScopeCategory } from '@e60/domain';

interface MaterialityState {
  /** Active sectors selected for the demo organisation. */
  orgSectors: string[];
  setOrgSectors: (codes: string[]) => void;
  toggleSector: (code: string) => void;

  /** Manual overrides applied by the analyst (in-memory; persist later). */
  overrides: OrgMaterialityOverride[];
  upsertOverride: (sectorCode: string, scopeCategory: ScopeCategory, materiality: 0 | 1 | 2 | 3, justification: string) => void;
  clearOverride: (sectorCode: string, scopeCategory: ScopeCategory) => void;
}

const DEFAULT_DEMO_SECTORS = ['K.64', 'L.68'];

export const useMaterialityStore = create<MaterialityState>((set) => ({
  orgSectors: DEFAULT_DEMO_SECTORS,
  setOrgSectors: (codes) => set({ orgSectors: codes }),
  toggleSector: (code) =>
    set((s) => ({
      orgSectors: s.orgSectors.includes(code)
        ? s.orgSectors.filter((c) => c !== code)
        : [...s.orgSectors, code],
    })),

  overrides: [],
  upsertOverride: (sectorCode, scopeCategory, materiality, justification) =>
    set((s) => {
      const without = s.overrides.filter(
        (o) => !(o.sectorCode === sectorCode && o.scopeCategory === scopeCategory),
      );
      return {
        overrides: [
          ...without,
          {
            sectorCode,
            scopeCategory,
            materiality,
            justification,
            setAt: new Date().toISOString(),
          },
        ],
      };
    }),
  clearOverride: (sectorCode, scopeCategory) =>
    set((s) => ({
      overrides: s.overrides.filter(
        (o) => !(o.sectorCode === sectorCode && o.scopeCategory === scopeCategory),
      ),
    })),
}));
