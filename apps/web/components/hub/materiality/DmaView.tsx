'use client';

import { useMemo, useState } from 'react';
import { Panel } from '@e60/ui';
import type { AssessmentRow } from '@/app/actions/dma';
import { DmaMatrix } from './DmaMatrix';
import { DmaTopicList } from './DmaTopicList';
import { PeriodSwitcher } from './PeriodSwitcher';
import { ThresholdControl } from './ThresholdControl';
import { TopicScoringDrawer } from './TopicScoringDrawer';
import type { DmaContext } from './dma-types';

/**
 * Orchestrates the DMA tab: matrix (left, 2/3 width) + topic list
 * (right, 1/3 width), plus the scoring drawer mounted at the
 * root. Selection state lives here so both the matrix and the list
 * open the same drawer instance.
 */
export function DmaView({
  ctx,
  assessments,
}: {
  ctx: DmaContext;
  assessments: AssessmentRow[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedMatter = useMemo(
    () => ctx.matters.find((m) => m.id === selectedId) ?? null,
    [ctx.matters, selectedId],
  );
  const selectedScore = selectedId ? ctx.scoresByMatter[selectedId] ?? null : null;
  const selectedIros = selectedId ? ctx.irosByMatter[selectedId] ?? [] : [];
  const selectedTopicDatapoints = selectedMatter
    ? ctx.datapointsByTopic[selectedMatter.topic] ?? []
    : [];

  const scoredCount = Object.keys(ctx.scoresByMatter).length;
  const iroCount = Object.values(ctx.irosByMatter).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

  return (
    <>
      {/* Period + threshold + scored counter row */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-panel px-4 py-2.5 shadow-e60-sm">
        <div className="flex items-center gap-3">
          <div>
            <div className="mb-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
              Assessment
            </div>
            <PeriodSwitcher current={ctx.period} assessments={assessments} />
          </div>
          <div className="h-7 w-px bg-line-soft" />
          <div>
            <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
              Scored
            </div>
            <div className="font-mono text-[13px] tabular-nums text-ink-1">
              {scoredCount} / {ctx.matters.length}
            </div>
          </div>
          <div className="h-7 w-px bg-line-soft" />
          <div>
            <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
              IROs
            </div>
            <div className="font-mono text-[13px] tabular-nums text-ink-1">
              {iroCount}
            </div>
          </div>
        </div>
        <ThresholdControl
          assessmentId={ctx.assessmentId}
          initialThreshold={ctx.threshold}
        />
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-4 standard:grid-cols-1">
        <Panel>
          <Panel.Head
            title="Double materiality matrix"
            count="Impact ↑ × Financial → · 0-5 rating"
            icon={
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle cx="5" cy="11" r="1.5" />
                <circle cx="10" cy="6" r="1.5" />
                <circle cx="12" cy="11" r="1.5" />
              </svg>
            }
          />
          <Panel.Body>
            <DmaMatrix ctx={ctx} onSelect={setSelectedId} />
          </Panel.Body>
        </Panel>

        <Panel>
          <Panel.Head
            title="Sustainability matters"
            count={`${ctx.matters.length} per ESRS 1 AR16`}
            icon={
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M3 4h10M3 8h10M3 12h7" strokeLinecap="round" />
              </svg>
            }
          />
          <Panel.Body>
            <div className="h-[450px]">
              <DmaTopicList ctx={ctx} onSelect={setSelectedId} />
            </div>
          </Panel.Body>
        </Panel>
      </div>

      <TopicScoringDrawer
        open={selectedId !== null}
        matter={selectedMatter}
        existing={selectedScore}
        iros={selectedIros}
        topicDatapoints={selectedTopicDatapoints}
        assessmentId={ctx.assessmentId}
        threshold={ctx.threshold}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
