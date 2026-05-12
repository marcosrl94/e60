'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  resolveMateriality,
  SCOPE_CATEGORY_LABELS,
  type IndustryMateriality,
  type IndustryMaterialityLevel,
  type NaceSector,
  type OrgMaterialityOverride,
  type ScopeCategory,
} from '@e60/domain';
import {
  deleteMaterialityOverride,
  upsertMaterialityOverride,
} from '@/app/actions/materiality';

interface OverrideModalProps {
  sectorCode: string;
  scopeCategory: ScopeCategory;
  sectors: NaceSector[];
  catalog: IndustryMateriality[];
  /** Persisted user overrides — fetched server-side, refreshed by
   * revalidatePath after each mutation. */
  overrides: OrgMaterialityOverride[];
  onClose: () => void;
}

const LEVEL_LABEL: Record<IndustryMaterialityLevel, string> = {
  0: 'Not material',
  1: 'Potential',
  2: 'Material',
  3: 'High',
};

export function OverrideModal({
  sectorCode,
  scopeCategory,
  sectors,
  catalog,
  overrides,
  onClose,
}: OverrideModalProps) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const sector = useMemo(
    () => sectors.find((s) => s.code === sectorCode),
    [sectors, sectorCode],
  );

  const existing = useMemo(
    () =>
      overrides.find(
        (o) => o.sectorCode === sectorCode && o.scopeCategory === scopeCategory,
      ),
    [overrides, sectorCode, scopeCategory],
  );

  const baseline = useMemo(
    () => resolveMateriality(sectorCode, scopeCategory, catalog, []),
    [sectorCode, scopeCategory, catalog],
  );

  const [level, setLevel] = useState<IndustryMaterialityLevel>(
    existing?.materiality ?? baseline.level,
  );
  const [justification, setJustification] = useState<string>(
    existing?.justification ?? '',
  );

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const canSave = justification.trim().length >= 10 && level !== baseline.level;

  function handleSave() {
    if (!canSave) return;
    setSubmitError(null);
    startTransition(async () => {
      const result = await upsertMaterialityOverride({
        sectorCode,
        scopeCategory,
        materiality: level,
        justification: justification.trim(),
      });
      if ('error' in result) {
        setSubmitError(result.error);
        return;
      }
      onClose();
    });
  }

  function handleClear() {
    setSubmitError(null);
    startTransition(async () => {
      const result = await deleteMaterialityOverride(sectorCode, scopeCategory);
      if ('error' in result) {
        setSubmitError(result.error);
        return;
      }
      onClose();
    });
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-ink-1/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-[560px] rounded-lg border border-line bg-panel shadow-e60-pop">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line-soft px-5 py-3">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
              Materiality override
            </div>
            <div className="text-[15px] font-semibold text-ink-1">
              {sector?.labelEs ?? sectorCode} · {SCOPE_CATEGORY_LABELS[scopeCategory]}
            </div>
            <div className="mt-0.5 font-mono text-[10.5px] text-ink-3">
              {sectorCode} × {scopeCategory}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-3 hover:bg-canvas hover:text-ink-1"
          >
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
              <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4">
          {/* Baseline card */}
          <div className="mb-4 rounded-md border border-line-soft bg-panel-soft px-3 py-2.5">
            <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
              Catalogue baseline
            </div>
            <div className="mt-1 text-[13px] text-ink-1">
              <strong>{baseline.level}</strong> · {LEVEL_LABEL[baseline.level]}
              <span className="ml-2 font-mono text-[10.5px] text-ink-3">
                via {baseline.source}
                {baseline.resolvedFrom !== sectorCode && ` (inherited from ${baseline.resolvedFrom})`}
              </span>
            </div>
            {baseline.notes && (
              <p className="mt-1 text-[11px] leading-relaxed text-ink-3">
                {baseline.notes}
              </p>
            )}
          </div>

          {/* Level picker */}
          <label className="mb-1 block font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            Override level
          </label>
          <div className="mb-3 grid grid-cols-4 gap-2">
            {([0, 1, 2, 3] as const).map((v) => {
              const active = level === v;
              const baseColors: Record<IndustryMaterialityLevel, string> = {
                0: 'border-line text-ink-2',
                1: 'border-nfq-green text-nfq-green',
                2: 'border-nfq-orange text-nfq-orange',
                3: 'border-nfq-red text-nfq-red',
              };
              const activeBg: Record<IndustryMaterialityLevel, string> = {
                0: 'bg-canvas',
                1: 'bg-nfq-greenBg',
                2: 'bg-nfq-orangeBg',
                3: 'bg-nfq-redBg',
              };
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setLevel(v)}
                  className={
                    'flex flex-col items-center gap-0.5 rounded-md border-2 px-2 py-2 transition-colors ' +
                    baseColors[v] +
                    ' ' +
                    (active ? activeBg[v] + ' shadow-e60-sm' : 'bg-panel hover:bg-canvas')
                  }
                >
                  <div className="text-[18px] font-semibold">{v}</div>
                  <div className="font-mono text-[9px] uppercase tracking-wide">
                    {LEVEL_LABEL[v]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Justification */}
          <label className="mb-1 block font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            Justification (required, ≥ 10 chars · auditable trail)
          </label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows={3}
            placeholder="Por qué nos apartamos del catálogo: cliente, sede, metodología, evidencia interna…"
            className="w-full rounded-md border border-line bg-panel px-2.5 py-[7px] text-[12px] text-ink-1 placeholder:text-ink-4 focus:border-ink-3 focus:outline-none"
          />
          <div className="mt-1 font-mono text-[9.5px] text-ink-3">
            {justification.trim().length} / 10 minimum
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-line-soft px-5 py-3">
          {existing ? (
            <button
              type="button"
              onClick={handleClear}
              disabled={isPending}
              className="rounded-md border border-line bg-panel px-3 py-1.5 text-[12px] font-medium text-nfq-red hover:border-nfq-red disabled:opacity-60"
            >
              ↺ Reset to baseline
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            {submitError ? (
              <span className="text-[11px] text-nfq-red" role="alert">
                {submitError}
              </span>
            ) : null}
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
              disabled={!canSave || isPending}
              className={
                canSave && !isPending
                  ? 'rounded-md bg-ink-1 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-black'
                  : 'rounded-md bg-canvas-edge px-3 py-1.5 text-[12px] font-medium text-ink-4'
              }
            >
              {isPending ? 'Saving…' : 'Save override'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
