import { cookies } from 'next/headers';
import type {
  DmaIro,
  FinancialScore,
  ImpactScore,
  IndustryMateriality,
  NaceSector,
  OrgMaterialityOverride,
  SustainabilityMatter,
} from '@e60/domain';
import { Panel, Tag } from '@e60/ui';
import naceSeed from '@/data/seed/nace-sectors.json';
import materialitySeed from '@/data/seed/industry-materiality.json';
import { listAssessments, resolveActiveAssessment } from '@/app/actions/dma';
import { createClient } from '@/utils/supabase/server';
import { SubTabs } from '@/components/hub/carbon-intelligence/SubTabs';
import { MaterialityMatrix } from './MaterialityMatrix';
import { SectorPicker } from './SectorPicker';
import { DmaView } from './DmaView';
import type { DmaContext, MatterScoreRecord } from './dma-types';

const sectorsSeed = naceSeed as unknown as NaceSector[];
const catalogSeed = materialitySeed as unknown as IndustryMateriality[];

/**
 * Materiality Studio v2.
 *
 *   Tab 1 · Double Materiality  (default)
 *     - 32-matter ESRS 1 AR16 bubble matrix (impact ↑ × financial →)
 *     - Per-matter scoring drawer with 4 impact + 2 financial dims
 *     - Threshold slider
 *     - Multi-period ready (one assessment per user × period; M2 wires
 *       a default 'FY2026' row automatically — manual period switcher
 *       lands in M3)
 *
 *   Tab 2 · Sector pre-screen (subordinated)
 *     - Legacy industry heatmap NACE × scope/category, used as a
 *       heuristic input to scoring E1 in the DMA above. Untouched
 *       from the previous version of this view.
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

async function fetchMatters(): Promise<SustainabilityMatter[]> {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from('sustainability_matters')
    .select('id, topic, category, label, description, sort_order')
    .order('sort_order');
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    topic: r.topic,
    category: r.category,
    label: r.label,
    description: r.description,
    sortOrder: r.sort_order,
  }));
}

async function fetchIros(
  assessmentId: string,
): Promise<Record<string, DmaIro[]>> {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from('iros')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: true });
  if (error || !data) return {};
  const out: Record<string, DmaIro[]> = {};
  for (const r of data) {
    const iro: DmaIro = {
      id: r.id,
      assessmentId: r.assessment_id,
      matterId: r.matter_id,
      type: r.type,
      description: r.description,
      timeHorizon: r.time_horizon,
      valueChainLocation: r.value_chain_location,
      stakeholders: r.stakeholders ?? [],
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
    (out[iro.matterId] ??= []).push(iro);
  }
  return out;
}

async function fetchScores(
  assessmentId: string,
): Promise<Record<string, MatterScoreRecord>> {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from('materiality_scores')
    .select('*')
    .eq('assessment_id', assessmentId);
  if (error || !data) return {};
  const out: Record<string, MatterScoreRecord> = {};
  for (const r of data) {
    const impact: ImpactScore | null =
      r.impact_scale != null &&
      r.impact_scope != null &&
      r.impact_likelihood != null
        ? {
            scale: r.impact_scale,
            scope: r.impact_scope,
            irremediable: r.impact_irremediable ?? 0,
            likelihood: r.impact_likelihood,
          }
        : null;
    const financial: FinancialScore | null =
      r.financial_magnitude != null && r.financial_likelihood != null
        ? {
            magnitude: r.financial_magnitude,
            likelihood: r.financial_likelihood,
          }
        : null;
    out[r.matter_id] = {
      matterId: r.matter_id,
      impact,
      financial,
      notes: r.notes,
      updatedAt: r.updated_at,
    };
  }
  return out;
}

export async function MaterialityView({ period }: { period?: string }) {
  const [overrides, matters, assessment, assessments] = await Promise.all([
    fetchOverrides(),
    fetchMatters(),
    resolveActiveAssessment(period),
    listAssessments(),
  ]);
  const [scoresByMatter, irosByMatter] = await Promise.all([
    fetchScores(assessment.id),
    fetchIros(assessment.id),
  ]);

  // listAssessments fires before the resolve possibly created a new
  // row — make sure the active one shows up in the switcher list.
  const allAssessments = assessments.find((a) => a.id === assessment.id)
    ? assessments
    : [assessment, ...assessments];

  const ctx: DmaContext = {
    assessmentId: assessment.id,
    period: assessment.period,
    threshold: assessment.threshold,
    matters,
    scoresByMatter,
    irosByMatter,
  };

  return (
    <>
      {/* Greeting */}
      <div className="mb-5 flex items-start justify-between gap-6">
        <div>
          <h1 className="mb-1 flex flex-wrap items-center gap-2 text-[24px] font-semibold leading-tight tracking-tight text-ink-1">
            Materiality Studio
            <span className="rounded-md bg-nfq-purple px-2 py-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white">
              Double materiality
            </span>
          </h1>
          <div className="font-mono text-[11.5px] tracking-wide text-ink-3">
            EFRAG ESRS 1 · impact ↑ × financial → · 32 sustainability
            matters ·{' '}
            <strong className="font-medium text-ink-1">
              IROs land in M3
            </strong>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tag variant="green">Live</Tag>
          <span className="font-mono text-[10px] tracking-wide text-ink-2">
            {matters.length} matters · {Object.keys(scoresByMatter).length}{' '}
            scored
          </span>
        </div>
      </div>

      <SubTabs
        sections={[
          {
            id: 'dma',
            label: 'Double materiality',
            count: matters.length,
            content: (
              <DmaView ctx={ctx} assessments={allAssessments} />
            ),
          },
          {
            id: 'sector',
            label: 'Sector pre-screen',
            count: sectorsSeed.length,
            content: (
              <div className="grid grid-cols-[340px_1fr] gap-4 standard:grid-cols-1">
                <Panel>
                  <Panel.Head
                    title="Organisation sectors"
                    count="NACE Rev 2.1"
                    icon={
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      >
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
                    title="Industry materiality heatmap"
                    count="Heuristic · 0-3 catalogue scale"
                    icon={
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      >
                        <path
                          d="M2 13l3-3 3 2 5-7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 5h4v4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
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
            ),
          },
        ]}
      />
    </>
  );
}
