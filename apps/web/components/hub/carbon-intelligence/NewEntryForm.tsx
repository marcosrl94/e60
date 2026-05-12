'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  computeTco2e,
  convertQuantity,
  listCompatibleInputUnits,
  type DataQualityTier,
  type EmissionFactor,
  type FactorSource,
  type Scope,
  type Scope2Method,
} from '@e60/domain';
import { Tag } from '@e60/ui';
import { createEmissionEntry } from '@/app/actions/emissions';

interface NewEntryFormProps {
  factors: EmissionFactor[];
  onClose: () => void;
}

const SCOPE_LABEL: Record<Scope, string> = {
  s1: 'Scope 1',
  s2: 'Scope 2',
  s3: 'Scope 3',
};

const SCOPE_VARIANT: Record<Scope, 'red' | 'orange' | 'blue'> = {
  s1: 'red',
  s2: 'orange',
  s3: 'blue',
};

const SOURCE_VARIANT: Record<FactorSource, 'green' | 'blue' | 'purple'> = {
  IDAE: 'blue',
  MITECO: 'green',
  DEFRA: 'purple',
};

type ScopeFilter = Scope | 'all';

export function NewEntryForm({ factors, onClose }: NewEntryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Picker state ───────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // ── Form state ─────────────────────────────────────────────────────────
  const [quantityInputRaw, setQuantityInputRaw] = useState<string>('');
  const [inputUnit, setInputUnit] = useState<string>('');
  const [scope2Method, setScope2Method] = useState<Scope2Method>('location_based');
  const [dataQualityTier, setDataQualityTier] = useState<DataQualityTier>(2);
  const [notes, setNotes] = useState<string>('');

  const filteredFactors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return factors.filter((f) => {
      if (scopeFilter !== 'all' && f.scope !== scopeFilter) return false;
      if (q) {
        const hay =
          `${f.activityKey} ${f.activityLabel} ${f.category} ${f.subcategory ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [factors, scopeFilter, search]);

  const selectedFactor = useMemo(
    () => factors.find((f) => f.activityKey === selectedKey) ?? null,
    [factors, selectedKey],
  );

  const compatibleUnits = useMemo(() => {
    if (!selectedFactor) return [] as string[];
    return listCompatibleInputUnits(selectedFactor.efUnit, selectedFactor.activityKey);
  }, [selectedFactor]);

  // Reset quantity & input unit when factor changes
  useEffect(() => {
    if (selectedFactor) {
      setInputUnit(selectedFactor.efUnit);
      setQuantityInputRaw('');
    }
  }, [selectedFactor]);

  // ── Live computation ──────────────────────────────────────────────────
  const quantityInput = Number(quantityInputRaw);
  const hasQuantity = quantityInputRaw !== '' && !Number.isNaN(quantityInput) && quantityInput > 0;

  const conversion = useMemo(() => {
    if (!selectedFactor || !hasQuantity) return null;
    if (inputUnit === selectedFactor.efUnit) {
      return { value: quantityInput, conversion: { fromUnit: inputUnit, toUnit: selectedFactor.efUnit, factor: 1 } };
    }
    return convertQuantity(quantityInput, inputUnit, selectedFactor.efUnit, selectedFactor.activityKey);
  }, [selectedFactor, inputUnit, quantityInput, hasQuantity]);

  const tco2e = useMemo(() => {
    if (!conversion || !selectedFactor) return null;
    return computeTco2e(conversion.value, selectedFactor.efValue);
  }, [conversion, selectedFactor]);

  const canSubmit = !!selectedFactor && hasQuantity && conversion != null && tco2e != null;

  function handleSubmit() {
    if (!canSubmit || !selectedFactor || !conversion || tco2e == null) return;
    setSubmitError(null);
    startTransition(async () => {
      const result = await createEmissionEntry({
        inventoryYear: new Date().getFullYear(),
        scope: selectedFactor.scope,
        scope2Method: selectedFactor.scope === 's2' ? scope2Method : null,
        activityKey: selectedFactor.activityKey,
        activityLabel: selectedFactor.activityLabel,
        category: selectedFactor.category,
        factorSource: selectedFactor.source,
        efValue: selectedFactor.efValue,
        efUnit: selectedFactor.efUnit,
        quantity: conversion.value,
        quantityInput,
        quantityInputUnit: inputUnit,
        conversionFactor: conversion.conversion.factor,
        tco2e,
        dataQualityTier,
        notes: notes.trim() || null,
      });
      if ('error' in result) {
        setSubmitError(result.error);
        return;
      }
      onClose();
    });
  }

  return (
    <div className="flex max-h-[90vh] flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line-soft px-5 py-3">
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            Carbon Intelligence
          </div>
          <div className="text-[15px] font-semibold text-ink-1">New inventory entry</div>
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

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* ── Step 1 · pick factor ───────────────────────────────── */}
        <div className="mb-4">
          <label className="mb-1.5 block font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            1 · Activity (emission factor)
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {(['all', 's1', 's2', 's3'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScopeFilter(s)}
                className={
                  scopeFilter === s
                    ? 'rounded-md border border-ink-1 bg-ink-1 px-2.5 py-[5px] text-[11px] font-medium text-white'
                    : 'rounded-md border border-line bg-panel px-2.5 py-[5px] text-[11px] font-medium text-ink-2 hover:border-ink-5 hover:text-ink-1'
                }
              >
                {s === 'all' ? 'All scopes' : SCOPE_LABEL[s as Scope]}
              </button>
            ))}
            <input
              type="search"
              value={search}
              placeholder="gas natural, coche, vuelo…"
              onChange={(e) => setSearch(e.target.value)}
              className="ml-1 w-full rounded-md border border-line bg-panel px-2 py-[5px] font-mono text-[11px] text-ink-1 placeholder:text-ink-4 focus:border-ink-3 focus:outline-none"
            />
          </div>
          <div className="mt-2 max-h-[200px] overflow-y-auto rounded-md border border-line">
            {filteredFactors.map((f) => {
              const isSelected = f.activityKey === selectedKey;
              return (
                <button
                  type="button"
                  key={f.activityKey}
                  onClick={() => setSelectedKey(f.activityKey)}
                  className={
                    'flex w-full items-center gap-2 border-b border-line-soft px-3 py-2 text-left last:border-b-0 ' +
                    (isSelected
                      ? 'bg-nfq-blueBg/50'
                      : 'hover:bg-panel-hover')
                  }
                >
                  <Tag variant={SCOPE_VARIANT[f.scope]}>{SCOPE_LABEL[f.scope]}</Tag>
                  <div className="flex-1 min-w-0">
                    <div className="line-clamp-1 text-[12px] text-ink-1">
                      {f.activityLabel}
                    </div>
                    <div className="line-clamp-1 font-mono text-[9.5px] text-ink-3 tracking-wide">
                      {f.category}
                      {f.subcategory && ` · ${f.subcategory}`}
                      {' · '}
                      {f.region} · {f.year}
                    </div>
                  </div>
                  <span className="font-mono text-[10.5px] tabular-nums text-ink-2">
                    {f.efValue.toLocaleString('en-US', { maximumFractionDigits: 5 })}
                  </span>
                  <span className="font-mono text-[9px] text-ink-3">
                    /{f.efUnit}
                  </span>
                </button>
              );
            })}
            {filteredFactors.length === 0 && (
              <div className="px-3 py-6 text-center text-[12px] text-ink-3">
                No factors match.
              </div>
            )}
          </div>
        </div>

        {/* ── Step 2 · selected factor card ──────────────────────── */}
        {selectedFactor && (
          <>
            <div className="mb-4 rounded-md border border-line-soft bg-panel-soft px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <Tag variant={SCOPE_VARIANT[selectedFactor.scope]}>
                  {SCOPE_LABEL[selectedFactor.scope]}
                </Tag>
                <Tag variant={SOURCE_VARIANT[selectedFactor.source]}>
                  {selectedFactor.source}
                </Tag>
                <span className="font-mono text-[9.5px] text-ink-3 tracking-wide">
                  {selectedFactor.region} · {selectedFactor.year}
                </span>
              </div>
              <div className="mt-1 text-[13px] font-semibold text-ink-1">
                {selectedFactor.activityLabel}
              </div>
              <div className="mt-0.5 font-mono text-[10.5px] text-ink-2">
                ef ={' '}
                <strong className="text-ink-1">
                  {selectedFactor.efValue.toLocaleString('en-US', { maximumFractionDigits: 5 })}
                </strong>{' '}
                kgCO₂e / {selectedFactor.efUnit}
                {selectedFactor.sourceVersion && (
                  <span className="text-ink-3"> · {selectedFactor.sourceVersion}</span>
                )}
              </div>
              {selectedFactor.notes && (
                <div className="mt-1 text-[11px] leading-relaxed text-ink-3">
                  {selectedFactor.notes}
                </div>
              )}
            </div>

            {/* ── Step 3 · quantity + unit ───────────────────────── */}
            <div className="mb-4 grid grid-cols-[1fr_140px] gap-2">
              <div>
                <label className="mb-1 block font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                  2 · Quantity
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  value={quantityInputRaw}
                  onChange={(e) => setQuantityInputRaw(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-md border border-line bg-panel px-2.5 py-[7px] font-mono text-[13px] text-ink-1 placeholder:text-ink-4 focus:border-ink-3 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                  Unit
                </label>
                <select
                  value={inputUnit}
                  onChange={(e) => setInputUnit(e.target.value)}
                  className="w-full rounded-md border border-line bg-panel px-2 py-[7px] font-mono text-[12px] text-ink-1 focus:border-ink-3 focus:outline-none"
                >
                  {compatibleUnits.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Live preview ───────────────────────────────────── */}
            {hasQuantity && (
              <div className="mb-4 rounded-md border border-line-soft bg-canvas px-3 py-2.5">
                <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                  Live preview
                </div>
                {conversion ? (
                  <>
                    {conversion.conversion.factor !== 1 && (
                      <div className="mt-1 font-mono text-[11px] text-nfq-blue">
                        {quantityInput.toLocaleString('en-US')} {inputUnit} ×{' '}
                        {conversion.conversion.factor.toLocaleString('en-US', { maximumFractionDigits: 6 })}{' '}
                        = {conversion.value.toLocaleString('en-US', { maximumFractionDigits: 4 })} {selectedFactor.efUnit}
                        {conversion.conversion.note && (
                          <span className="ml-1 text-ink-3"> · {conversion.conversion.note}</span>
                        )}
                      </div>
                    )}
                    <div className="mt-1 font-mono text-[11.5px] text-ink-1">
                      {conversion.value.toLocaleString('en-US', { maximumFractionDigits: 4 })} {selectedFactor.efUnit} ×{' '}
                      {selectedFactor.efValue.toLocaleString('en-US', { maximumFractionDigits: 5 })} kgCO₂e/{selectedFactor.efUnit} ÷ 1000 ={' '}
                      <strong className="text-nfq-green">
                        {tco2e?.toLocaleString('en-US', { maximumFractionDigits: 4 }) ?? '—'} tCO₂e
                      </strong>
                    </div>
                  </>
                ) : (
                  <div className="mt-1 text-[11px] text-nfq-red">
                    No hay conversión disponible de {inputUnit} → {selectedFactor.efUnit} para esta actividad.
                  </div>
                )}
              </div>
            )}

            {/* ── Scope 2 method (sólo s2) ───────────────────────── */}
            {selectedFactor.scope === 's2' && (
              <div className="mb-4 rounded-md border border-nfq-blue/20 bg-nfq-blueBg/40 px-3 py-2.5">
                <label className="mb-1 block font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-nfq-blue">
                  Scope 2 method (GHG Protocol Scope 2 Guidance)
                </label>
                <div className="flex gap-2">
                  {(['location_based', 'market_based'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setScope2Method(m)}
                      className={
                        scope2Method === m
                          ? 'flex-1 rounded-md border border-nfq-blue bg-nfq-blue px-2 py-1.5 text-[11px] font-medium text-white'
                          : 'flex-1 rounded-md border border-line bg-panel px-2 py-1.5 text-[11px] font-medium text-ink-2 hover:border-nfq-blue'
                      }
                    >
                      {m === 'location_based' ? 'Location-based' : 'Market-based'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── DQ tier ────────────────────────────────────────── */}
            <div className="mb-4">
              <label className="mb-1.5 block font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                3 · Data quality tier
              </label>
              <div className="flex gap-2">
                {([1, 2, 3] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDataQualityTier(t)}
                    className={
                      dataQualityTier === t
                        ? 'flex-1 rounded-md border border-ink-1 bg-ink-1 px-2 py-2 text-[11px] font-medium text-white'
                        : 'flex-1 rounded-md border border-line bg-panel px-2 py-2 text-[11px] font-medium text-ink-2 hover:border-ink-5 hover:text-ink-1'
                    }
                  >
                    <div className="font-semibold">T{t}</div>
                    <div className="font-mono text-[9px] tracking-wide opacity-80">
                      {t === 1 && 'Primary measured'}
                      {t === 2 && 'Activity-based'}
                      {t === 3 && 'Spend / proxy'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Notes ──────────────────────────────────────────── */}
            <div className="mb-4">
              <label className="mb-1 block font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                4 · Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Source document, period covered, anomalies…"
                className="w-full rounded-md border border-line bg-panel px-2.5 py-[7px] text-[12px] text-ink-1 placeholder:text-ink-4 focus:border-ink-3 focus:outline-none"
              />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-line-soft px-5 py-3">
        {submitError ? (
          <div className="mr-auto text-[11px] text-nfq-red" role="alert">
            {submitError}
          </div>
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
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className={
            canSubmit && !isPending
              ? 'rounded-md bg-ink-1 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-black'
              : 'rounded-md bg-canvas-edge px-3 py-1.5 text-[12px] font-medium text-ink-4'
          }
        >
          {isPending
            ? 'Saving…'
            : tco2e != null
              ? `Save · ${tco2e.toLocaleString('en-US', { maximumFractionDigits: 4 })} tCO₂e`
              : 'Save'}
        </button>
      </div>
    </div>
  );
}
