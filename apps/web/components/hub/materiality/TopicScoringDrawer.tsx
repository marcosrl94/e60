'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  computeFinancialRating,
  computeImpactRating,
  isMaterial,
  type FinancialScore,
  type ImpactScore,
  type MaterialityCategory,
  type SustainabilityMatter,
} from '@e60/domain';
import { Drawer } from '@e60/ui';
import { upsertMatterScore } from '@/app/actions/dma';
import type { MatterScoreRecord } from './dma-types';

interface TopicScoringDrawerProps {
  open: boolean;
  matter: SustainabilityMatter | null;
  existing: MatterScoreRecord | null;
  assessmentId: string;
  threshold: number;
  onClose: () => void;
}

const CATEGORY_LABEL: Record<MaterialityCategory, string> = {
  env: 'Environmental',
  soc: 'Social',
  gov: 'Governance',
};

const CATEGORY_CHIP: Record<MaterialityCategory, string> = {
  env: 'bg-nfq-greenBg text-nfq-green',
  soc: 'bg-nfq-orangeBg text-nfq-orange',
  gov: 'bg-nfq-purpleBg text-nfq-purple',
};

const DEFAULT_IMPACT: ImpactScore = {
  scale: 3,
  scope: 3,
  irremediable: 0,
  likelihood: 3,
};

const DEFAULT_FINANCIAL: FinancialScore = {
  magnitude: 3,
  likelihood: 3,
};

export function TopicScoringDrawer({
  open,
  matter,
  existing,
  assessmentId,
  threshold,
  onClose,
}: TopicScoringDrawerProps) {
  const [impact, setImpact] = useState<ImpactScore>(DEFAULT_IMPACT);
  const [financial, setFinancial] = useState<FinancialScore>(DEFAULT_FINANCIAL);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Rehydrate form when a different matter opens
  useEffect(() => {
    if (!open) return;
    setImpact(existing?.impact ?? DEFAULT_IMPACT);
    setFinancial(existing?.financial ?? DEFAULT_FINANCIAL);
    setNotes(existing?.notes ?? '');
    setError(null);
  }, [open, matter?.id, existing]);

  const impactRating = computeImpactRating(impact);
  const financialRating = computeFinancialRating(financial);
  const material = isMaterial(impact, financial, threshold);

  function handleSave() {
    if (!matter) return;
    setError(null);
    startTransition(async () => {
      const result = await upsertMatterScore({
        assessmentId,
        matterId: matter.id,
        impact,
        financial,
        notes: notes.trim() || null,
      });
      if ('error' in result) {
        setError(result.error);
        return;
      }
      onClose();
    });
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow={matter ? `${matter.topic} · ${CATEGORY_LABEL[matter.category]}` : ''}
      title={matter?.label ?? ''}
      meta={
        matter ? (
          <span
            className={
              'rounded-[3px] px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-wider ' +
              CATEGORY_CHIP[matter.category]
            }
          >
            {CATEGORY_LABEL[matter.category]}
          </span>
        ) : null
      }
    >
      {matter ? (
        <div className="flex h-full flex-col">
          {matter.description && (
            <div className="border-b border-line-soft px-6 py-3">
              <p className="text-[12px] leading-relaxed text-ink-3">
                {matter.description}
              </p>
            </div>
          )}

          {/* Score panels */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {/* Material verdict */}
            <div
              className={
                'rounded-md border px-3 py-2 text-[12px] ' +
                (material
                  ? 'border-nfq-red/40 bg-nfq-redBg text-nfq-red'
                  : 'border-line bg-canvas text-ink-2')
              }
            >
              <div className="font-mono text-[9.5px] uppercase tracking-wider">
                {material ? 'Declared material' : 'Below threshold'}
              </div>
              <div className="mt-0.5 font-mono tabular-nums">
                Impact{' '}
                <strong className="text-ink-1">
                  {impactRating.toFixed(2)}
                </strong>{' '}
                · Financial{' '}
                <strong className="text-ink-1">
                  {financialRating.toFixed(2)}
                </strong>{' '}
                · Threshold {threshold.toFixed(1)}
              </div>
            </div>

            {/* Impact materiality */}
            <ScoreBlock title="Impact materiality" subtitle="ESRS 1 §43-44 · effects on people and environment">
              <SliderRow
                label="Scale"
                hint="severity of the effect"
                value={impact.scale}
                min={1}
                max={5}
                onChange={(v) => setImpact({ ...impact, scale: v })}
              />
              <SliderRow
                label="Scope"
                hint="breadth — how many entities/people affected"
                value={impact.scope}
                min={1}
                max={5}
                onChange={(v) => setImpact({ ...impact, scope: v })}
              />
              <SliderRow
                label="Irremediable"
                hint="irreversibility (0 = N/A on positive impacts)"
                value={impact.irremediable}
                min={0}
                max={5}
                onChange={(v) => setImpact({ ...impact, irremediable: v })}
              />
              <SliderRow
                label="Likelihood"
                hint="probability (5 = actual / already happening)"
                value={impact.likelihood}
                min={1}
                max={5}
                onChange={(v) => setImpact({ ...impact, likelihood: v })}
              />
              <div className="mt-2 rounded-md bg-canvas px-3 py-1.5 font-mono text-[11px] tabular-nums text-ink-2">
                → Impact rating{' '}
                <strong className="text-ink-1">{impactRating.toFixed(2)}</strong>
                {' '}/ 5.00
              </div>
            </ScoreBlock>

            {/* Financial materiality */}
            <ScoreBlock title="Financial materiality" subtitle="ESRS 1 §49-50 · effects on the undertaking">
              <SliderRow
                label="Magnitude"
                hint="size of the financial effect"
                value={financial.magnitude}
                min={1}
                max={5}
                onChange={(v) =>
                  setFinancial({ ...financial, magnitude: v })
                }
              />
              <SliderRow
                label="Likelihood"
                hint="probability over the assessment horizon"
                value={financial.likelihood}
                min={1}
                max={5}
                onChange={(v) =>
                  setFinancial({ ...financial, likelihood: v })
                }
              />
              <div className="mt-2 rounded-md bg-canvas px-3 py-1.5 font-mono text-[11px] tabular-nums text-ink-2">
                → Financial rating{' '}
                <strong className="text-ink-1">
                  {financialRating.toFixed(2)}
                </strong>{' '}
                / 5.00
              </div>
            </ScoreBlock>

            {/* Notes */}
            <div>
              <label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                Methodology notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Why this score? Reference the stakeholder consultation, peer benchmark, internal incident…"
                className="w-full rounded-md border border-line bg-panel px-2.5 py-2 text-[12px] text-ink-1 placeholder:text-ink-4 focus:border-ink-3 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-line-soft px-6 py-3">
            {error && (
              <span className="mr-auto text-[11px] text-nfq-red" role="alert">
                {error}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-md border border-line bg-panel px-3 py-1.5 text-[12px] font-medium text-ink-2 hover:border-ink-5 hover:text-ink-1 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className={
                isPending
                  ? 'rounded-md bg-canvas-edge px-3 py-1.5 text-[12px] font-medium text-ink-4'
                  : 'rounded-md bg-ink-1 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-black'
              }
            >
              {isPending ? 'Saving…' : existing ? 'Update score' : 'Save score'}
            </button>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

function ScoreBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-2">
        <h3 className="text-[13px] font-semibold text-ink-1">{title}</h3>
        <p className="font-mono text-[10px] tracking-wide text-ink-3">
          {subtitle}
        </p>
      </header>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function SliderRow({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-0.5 flex items-baseline justify-between gap-2">
        <div className="text-[12px] font-medium text-ink-1">
          {label}
          <span className="ml-1.5 font-mono text-[10px] font-normal text-ink-3">
            {hint}
          </span>
        </div>
        <span className="font-mono text-[12px] tabular-nums text-ink-1">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-ink-1"
        aria-label={`${label} (${min}-${max})`}
      />
    </div>
  );
}
