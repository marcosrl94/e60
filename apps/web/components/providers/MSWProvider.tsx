'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type {
  Datapoint,
  EmissionFactor,
  IndustryMateriality,
  NaceSector,
} from '@e60/domain';
import datapointsSeed from '@/data/seed/datapoints.json';
import factorsSeed from '@/data/seed/emission-factors.json';
import sectorsSeed from '@/data/seed/nace-sectors.json';
import materialitySeed from '@/data/seed/industry-materiality.json';
import { TBLS } from '@/components/hub/pillar-iii/data';
import {
  applyDemoOverlay,
} from '@/components/hub/repository/demo-overlay';

/**
 * MSWProvider
 *
 * Wraps children with a one-shot MSW v2 browser worker bootstrap. Starts
 * once on mount, registers handlers built from the existing seed JSONs,
 * then renders children. Until the worker is ready, children render
 * normally — TanStack Query hooks fall back to `initialData` (the seed),
 * so the SSR/hydration window has no flash.
 *
 * Disabled when `NEXT_PUBLIC_API_BASE_URL` is set to an absolute URL
 * (i.e. real backend connected) — in that case we want real network calls.
 */
export function MSWProvider({ children }: { children: ReactNode }) {
  const [_ready, setReady] = useState(false);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    // Only intercept when the API base is the relative dev default.
    const shouldMock = !apiBase || apiBase.startsWith('/');
    if (!shouldMock) {
      setReady(true);
      return;
    }

    let cancelled = false;
    (async () => {
      const { setupWorker } = await import('msw/browser');
      const { buildHandlers } = await import('@e60/api-client/mock');

      const seed = {
        emissionFactors: factorsSeed as unknown as EmissionFactor[],
        datapoints: applyDemoOverlay(datapointsSeed as unknown as Datapoint[]),
        naceSectors: sectorsSeed as unknown as NaceSector[],
        industryMateriality: materialitySeed as unknown as IndustryMateriality[],
        // TBLS already matches PillarTblSummary 1:1 (lifted to JSON seed
        // and re-typed in `pillar-iii/data.ts`).
        pillarTbls: TBLS,
      };

      const worker = setupWorker(...buildHandlers(seed));
      try {
        await worker.start({
          onUnhandledRequest: 'bypass',
          serviceWorker: { url: '/mockServiceWorker.js' },
        });
      } catch (err) {
        // Service worker registration can fail in some browsers / private
        // tabs; we just bypass and let the network do its thing.
        console.warn('[MSW] worker did not start', err);
      }
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return <>{children}</>;
}
