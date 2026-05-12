import { cookies } from 'next/headers';
import type {
  IndustryMateriality,
  NaceSector,
  OrgMaterialityOverride,
} from '@e60/domain';
import { Panel, Tag } from '@e60/ui';
import naceSeed from '@/data/seed/nace-sectors.json';
import materialitySeed from '@/data/seed/industry-materiality.json';
import { createClient } from '@/utils/supabase/server';
import { MaterialityMatrix } from './MaterialityMatrix';
import { SectorPicker } from './SectorPicker';

// Seed payloads loaded server-side and forwarded as TanStack Query
// initialData to the client children. Once the backend ships, /materiality/
// sectors and /materiality/catalogue replace these reads transparently.
const sectorsSeed = naceSeed as unknown as NaceSector[];
const catalogSeed = materialitySeed as unknown as IndustryMateriality[];

/**
 * Materiality Studio · industry materiality heatmap.
 *
 * Pre-screening tool that runs before the IRO workshop. Given the org's
 * NACE sector(s), the matrix renders the pre-baked materiality level (0-3)
 * for each {sector × scope-category} pair, resolving via:
 *   override per-org  →  exact match  →  parent section inheritance  →  0
 *
 * Seed: 52 NACE sectors (21 sections + 31 representative divisions) and
 * 232 industry_materiality rows (210 section-level + 22 division overrides
 * for the cases where the division materially differs from its parent).
 *
 * Source frameworks: EFRAG ESRS sector standards drafts > GHG Protocol
 * supplementary > SASB Materiality Map > NFQ internal criterion. Lifted
 * from the legacy `nfq-carbon-intelligence` repo.
 */
async function fetchOverrides(): Promise<OrgMaterialityOverride[]> {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from('org_materiality_overrides')
    .select('sector_code, scope_category, materiality, justification, set_at');
  if (error || !data) return [];
  return data.map((r) => ({
    sectorCode: r.sector_code,
    scopeCategory: r.scope_category,
    materiality: r.materiality,
    justification: r.justification,
    setAt: r.set_at,
  }));
}

export async function MaterialityView() {
  const overrides = await fetchOverrides();
  return (
    <>
      {/* Greeting */}
      <div className="mb-5 flex items-start justify-between gap-6">
        <div>
          <h1 className="mb-1 flex flex-wrap items-center gap-2 text-[24px] font-semibold leading-tight tracking-tight text-ink-1">
            Materiality Studio
            <span className="rounded-md bg-nfq-purple px-2 py-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white">
              Industry pre-screening
            </span>
          </h1>
          <div className="font-mono text-[11.5px] tracking-wide text-ink-3">
            NACE sector × GHG scope/category heatmap ·{' '}
            <strong className="font-medium text-ink-1">
              EFRAG ESRS · SASB · GHG Protocol · NFQ internal
            </strong>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tag variant="green">Live</Tag>
          <span className="font-mono text-[10px] tracking-wide text-ink-2">
            {sectorsSeed.length} sectors · {catalogSeed.length} catalogue rows
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[340px_1fr] gap-4 standard:grid-cols-1">
        <Panel>
          <Panel.Head
            title="Organisation sectors"
            count="NACE Rev 2.1"
            icon={
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="2" y="2" width="5" height="5" rx="0.5" />
                <rect x="9" y="2" width="5" height="5" rx="0.5" />
                <rect x="2" y="9" width="5" height="5" rx="0.5" />
                <rect x="9" y="9" width="5" height="5" rx="0.5" />
              </svg>
            }
          />
          <Panel.Body>
            <SectorPicker initialSectors={sectorsSeed} />
          </Panel.Body>
        </Panel>

        <Panel>
          <Panel.Head
            title="Materiality heatmap"
            count="0 not material · 1 potential · 2 material · 3 high"
            icon={
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M2 13l3-3 3 2 5-7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 5h4v4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <Panel.Body flush>
            <div className="px-[18px] py-3">
              <MaterialityMatrix
                initialSectors={sectorsSeed}
                initialCatalogue={catalogSeed}
                overrides={overrides}
              />
            </div>
          </Panel.Body>
        </Panel>
      </div>
    </>
  );
}
