'use client';

import { create } from 'zustand';

/**
 * Materiality client-only UI state.
 *
 * `orgSectors` is the analyst's working set in the picker — purely a
 * navigation/filter concern, doesn't need persistence across sessions.
 * Persistent overrides live in `public.org_materiality_overrides`
 * (server-fetched, mutated via /app/actions/materiality.ts).
 */
interface MaterialityState {
  orgSectors: string[];
  setOrgSectors: (codes: string[]) => void;
  toggleSector: (code: string) => void;
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
}));
