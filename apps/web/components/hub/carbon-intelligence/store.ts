'use client';

import { create } from 'zustand';
import type {
  DataQualityTier,
  EmissionFactor,
  Scope,
  Scope2Method,
} from '@e60/domain';

/**
 * Locally-added inventory entries from the "+ New entry" modal.
 * Persists only in browser memory — when the backend is wired, replace
 * this with a server action that writes to `emission_entries` and revalidates.
 */
export interface CarbonEntry {
  id: string;
  scope: Scope;
  scope2Method: Scope2Method | null;
  activityKey: string;
  activityLabel: string;
  category: string;
  factorSource: EmissionFactor['source'];
  /** kgCO₂e per 1 efUnit. */
  efValue: number;
  /** Denominator unit of the factor. */
  efUnit: string;
  /** Cantidad ya normalizada a `efUnit`. */
  quantity: number;
  /** Cantidad tal cual la introdujo el usuario, antes de conversión. */
  quantityInput: number;
  /** Unidad introducida por el usuario. */
  quantityInputUnit: string;
  /** Multiplicador aplicado para llegar de quantityInput → quantity (1 si no aplica). */
  conversionFactor: number;
  /** tCO₂e = quantity × efValue / 1000. */
  tco2e: number;
  dataQualityTier: DataQualityTier;
  notes: string | null;
  /** ISO timestamp de creación. */
  createdAt: string;
}

interface CarbonIntelligenceState {
  addedEntries: CarbonEntry[];
  addEntry: (entry: CarbonEntry) => void;
  reset: () => void;
}

export const useCarbonIntelligenceStore = create<CarbonIntelligenceState>(
  (set) => ({
    addedEntries: [],
    addEntry: (entry) =>
      set((s) => ({ addedEntries: [entry, ...s.addedEntries] })),
    reset: () => set({ addedEntries: [] }),
  }),
);
