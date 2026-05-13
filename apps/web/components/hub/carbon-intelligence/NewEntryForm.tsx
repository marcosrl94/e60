'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  computeTco2e,
  convertQuantity,
  derivedDisclosureBindings,
  DISCLOSURE_BINDING_LABELS,
  listCompatibleInputUnits,
  type DataQualityTier,
  type EmissionFactor,
  type FactorSource,
  type Scope,
  type Scope2Method,
} from '@e60/domain';
import { Tag, type TagVariant } from '@e60/ui';
import { createEmissionEntry } from '@/app/actions/emissions';
import {
  flattenTreeForSelect,
  type OperationalUnit,
} from '@/lib/operational-units-shared';

interface NewEntryFormProps {
  factors: EmissionFactor[];
  units: OperationalUnit[];
  onClose: () => void;
}

type WizardStep = 1 | 2 | 3;

const SCOPE_LABEL: Record<Scope, string> = {
  s1: 'Scope 1',
  s2: 'Scope 2',
  s3: 'Scope 3',
};

const SCOPE_BLURB: Record<Scope, string> = {
  s1: 'Direct emissions — fuel combustion, fleet, refrigerant leaks.',
  s2: 'Purchased energy — grid electricity, heating, steam.',
  s3: 'Value chain — categories 1-14 (financed Scope 3.15 lives in ALQUID NZ).',
};

const SCOPE_VARIANT: Record<Scope, TagVariant> = {
  s1: 'red',
  s2: 'orange',
  s3: 'blue',
};

const SOURCE_VARIANT: Record<FactorSource, TagVariant> = {
  IDAE: 'blue',
  MITECO: 'green',
  DEFRA: 'purple',
};

const STEP_TITLES: Record<WizardStep, string> = {
  1: 'Scope',
  2: 'Activity & factor',
  3: 'Quantity & context',
};

/**
 * Activity entry wizard · three steps.
 *
 * Step 1 chooses the scope (and the GHG Protocol Scope 2 method when
 * applicable); step 2 narrows the catalogue and picks the emission
 * factor; step 3 captures the activity quantity + operational scope +
 * notes and previews the disclosure bindings before save.
 *
 * The live tCO₂e preview sits in the footer so it stays visible while
 * the user moves between steps. cmd/ctrl+Enter advances forward (or
 * saves on step 3 when everything is ready); Esc closes the dialog
 * (handled by the parent button).
 */
export function NewEntryForm({ factors, units, onClose }: NewEntryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [step, setStep] = useState<WizardStep>(1);

  const [chosenScope, setChosenScope] = useState<Scope | null>(null);
  const [scope2Method, setScope2Method] = useState<Scope2Method>('location_based');

  const [search, setSearch] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const [quantityInputRaw, setQuantityInputRaw] = useState<string>('');
  const [inputUnit, setInputUnit] = useState<string>('');
  const [dataQualityTier, setDataQualityTier] = useState<DataQualityTier>(2);
  const [notes, setNotes] = useState<string>('');

  // ── Location (operational scope · D2) ─────────────────────────────────
  const flatUnits = useMemo(() => flattenTreeForSelect(units), [units]);
  const defaultUnitId = useMemo(() => {
    const facility = units.find((u) => u.kind === 'facility');
    if (facility) return facility.id;
    return units[0]?.id ?? '';
  }, [units]);
  const [operationalUnitId, setOperationalUnitId] = useState<string>(defaultUnitId);
  useEffect(() => {
    if (!operationalUnitId && defaultUnitId) setOperationalUnitId(defaultUnitId);
  }, [defaultUnitId, operationalUnitId]);

  // ── Factor list filtered by the chosen scope ──────────────────────────
  const filteredFactors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return factors.filter((f) => {
      if (chosenScope && f.scope !== chosenScope) return false;
      if (q) {
        const hay =
          `${f.activityKey} ${f.activityLabel} ${f.category} ${f.subcategory ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [factors, chosenScope, search]);

  const selectedFactor = useMemo(
    () => factors.find((f) => f.activityKey === selectedKey) ?? null,
    [factors, selectedKey],
  );

  // Clear selected factor when the user changes scope retroactively.
  useEffect(() => {
    if (selectedFactor && chosenScope && selectedFactor.scope !== chosenScope) {
      setSelectedKey(null);
      setQuantityInputRaw('');
      setInputUnit('');
    }
  }, [chosenScope, selectedFactor]);

  const compatibleUnits = useMemo(() => {
    if (!selectedFactor) return [] as string[];
    return listCompatibleInputUnits(selectedFactor.efUnit, selectedFactor.activityKey);
  }, [selectedFactor]);

  // Reset quantity + input unit when factor changes.
  useEffect(() => {
    if (selectedFactor) {
      setInputUnit(selectedFactor.efUnit);
      setQuantityInputRaw('');
    }
  }, [selectedFactor]);

  // ── Live computation ──────────────────────────────────────────────────
  const quantityInput = Number(quantityInputRaw);
  const hasQuantity =
    quantityInputRaw !== '' && !Number.isNaN(quantityInput) && quantityInput > 0;

  const conversion = useMemo(() => {
    if (!selectedFactor || !hasQuantity) return null;
    if (inputUnit === selectedFactor.efUnit) {
      return {
        value: quantityInput,
        conversion: { fromUnit: inputUnit, toUnit: selectedFactor.efUnit, factor: 1 },
      };
    }
    return convertQuantity(
      quantityInput,
      inputUnit,
      selectedFactor.efUnit,
      selectedFactor.activityKey,
    );
  }, [selectedFactor, inputUnit, quantityInput, hasQuantity]);

  const tco2e = useMemo(() => {
    if (!conversion || !selectedFactor) return null;
    return computeTco2e(conversion.value, selectedFactor.efValue);
  }, [conversion, selectedFactor]);

  const disclosureBindings = useMemo(() => {
    if (!selectedFactor) return [] as string[];
    return derivedDisclosureBindings(
      selectedFactor.scope,
      selectedFactor.scope === 's2' ? scope2Method : null,
    );
  }, [selectedFactor, scope2Method]);

  // ── Step gates ────────────────────────────────────────────────────────
  const canAdvanceFromStep1 = chosenScope !== null;
  const canAdvanceFromStep2 = selectedFactor != null;
  const canSave =
    !!selectedFactor &&
    hasQuantity &&
    conversion != null &&
    tco2e != null &&
    !!operationalUnitId;

  function goNext() {
    if (step === 1 && canAdvanceFromStep1) setStep(2);
    else if (step === 2 && canAdvanceFromStep2) setStep(3);
  }
  function goBack() {
    if (step > 1) setStep(((step - 1) as WizardStep));
  }

  function handleSubmit() {
    if (!canSave || !selectedFactor || !conversion || tco2e == null) return;
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
        disclosureBindings,
        operationalUnitId: operationalUnitId || null,
      });
      if ('error' in result) {
        setSubmitError(result.error);
        return;
      }
      onClose();
    });
  }

  // cmd/ctrl+Enter: advance or save.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'Enter') return;
      if (!(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      if (step === 3) {
        if (canSave && !isPending) handleSubmit();
      } else {
        goNext();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [step, canSave, isPending, canAdvanceFromStep1, canAdvanceFromStep2]);

  return (
    <div className="flex max-h-[90vh] flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line-soft px-5 py-3">
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            Carbon Intelligence · New entry
          </div>
          <div className="text-[15px] font-semibold text-ink-1">
            Step {step} of 3 · {STEP_TITLES[step]}
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

      {/* Step indicator */}
      <StepNav
        step={step}
        onStep={(s) => {
          // Allow jumping back; forward only if the corresponding gate is satisfied.
          if (s < step) setStep(s);
          else if (s === 2 && canAdvanceFromStep1) setStep(2);
          else if (s === 3 && canAdvanceFromStep1 && canAdvanceFromStep2) setStep(3);
        }}
        gates={{
          1: true,
          2: canAdvanceFromStep1,
          3: canAdvanceFromStep1 && canAdvanceFromStep2,
        }}
      />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {step === 1 && (
          <Step1Scope
            chosen={chosenScope}
            onChoose={setChosenScope}
            scope2Method={scope2Method}
            onScope2Method={setScope2Method}
          />
        )}
        {step === 2 && (
          <Step2Factor
            chosenScope={chosenScope!}
            search={search}
            onSearch={setSearch}
            filteredFactors={filteredFactors}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
            selectedFactor={selectedFactor}
          />
        )}
        {step === 3 && (
          <Step3Quantity
            selectedFactor={selectedFactor!}
            quantityInputRaw={quantityInputRaw}
            onQuantity={setQuantityInputRaw}
            inputUnit={inputUnit}
            onInputUnit={setInputUnit}
            compatibleUnits={compatibleUnits}
            conversion={conversion}
            tco2e={tco2e}
            dataQualityTier={dataQualityTier}
            onDataQualityTier={setDataQualityTier}
            notes={notes}
            onNotes={setNotes}
            flatUnits={flatUnits}
            operationalUnitId={operationalUnitId}
            onOperationalUnitId={setOperationalUnitId}
            disclosureBindings={disclosureBindings}
            scope2Method={scope2Method}
          />
        )}
      </div>

      {/* Footer */}
      <Footer
        step={step}
        canAdvanceFromStep1={canAdvanceFromStep1}
        canAdvanceFromStep2={canAdvanceFromStep2}
        canSave={canSave}
        isPending={isPending}
        tco2e={tco2e}
        submitError={submitError}
        onBack={goBack}
        onNext={goNext}
        onSave={handleSubmit}
        onClose={onClose}
      />
    </div>
  );
}

// ── Step nav ──────────────────────────────────────────────────────────

function StepNav({
  step,
  onStep,
  gates,
}: {
  step: WizardStep;
  onStep: (s: WizardStep) => void;
  gates: Record<WizardStep, boolean>;
}) {
  const items: WizardStep[] = [1, 2, 3];
  return (
    <nav
      role="tablist"
      aria-label="Wizard steps"
      className="flex items-center gap-1 border-b border-line-soft px-5 py-2 text-[11px] font-medium"
    >
      {items.map((n) => {
        const isActive = step === n;
        const reachable = gates[n];
        return (
          <button
            key={n}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={!reachable}
            onClick={() => onStep(n)}
            className={
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-colors ' +
              (isActive
                ? 'bg-ink-1 text-white'
                : reachable
                  ? 'text-ink-2 hover:bg-canvas hover:text-ink-1'
                  : 'cursor-not-allowed text-ink-4')
            }
          >
            <span
              className={
                'flex h-4 w-4 items-center justify-center rounded-full font-mono text-[9.5px] font-semibold ' +
                (isActive ? 'bg-white text-ink-1' : 'bg-canvas text-ink-3')
              }
            >
              {n}
            </span>
            {STEP_TITLES[n]}
          </button>
        );
      })}
    </nav>
  );
}

// ── Step 1 · Scope ────────────────────────────────────────────────────

function Step1Scope({
  chosen,
  onChoose,
  scope2Method,
  onScope2Method,
}: {
  chosen: Scope | null;
  onChoose: (s: Scope) => void;
  scope2Method: Scope2Method;
  onScope2Method: (m: Scope2Method) => void;
}) {
  const scopes: Scope[] = ['s1', 's2', 's3'];
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Which scope does this activity belong to?
        </div>
        <div className="grid grid-cols-3 gap-2 cramped:grid-cols-1">
          {scopes.map((s) => {
            const isChosen = chosen === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChoose(s)}
                className={
                  'flex flex-col items-start gap-1.5 rounded-md border px-3 py-3 text-left transition-colors ' +
                  (isChosen
                    ? 'border-ink-1 bg-ink-1/5'
                    : 'border-line bg-panel hover:border-ink-5')
                }
              >
                <Tag variant={SCOPE_VARIANT[s]}>{SCOPE_LABEL[s]}</Tag>
                <p className="text-[11.5px] leading-snug text-ink-2">
                  {SCOPE_BLURB[s]}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {chosen === 's2' && (
        <div className="rounded-md border border-nfq-blue/20 bg-nfq-blueBg/40 px-3 py-2.5">
          <label className="mb-1 block font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-nfq-blue">
            Scope 2 method (GHG Protocol Scope 2 Guidance)
          </label>
          <div className="flex gap-2">
            {(['location_based', 'market_based'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onScope2Method(m)}
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
          <p className="mt-1 font-mono text-[10px] tracking-wide text-ink-3">
            Location-based feeds E1-6_09; market-based feeds E1-6_10.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Step 2 · Factor ──────────────────────────────────────────────────

function Step2Factor({
  chosenScope,
  search,
  onSearch,
  filteredFactors,
  selectedKey,
  onSelect,
  selectedFactor,
}: {
  chosenScope: Scope;
  search: string;
  onSearch: (s: string) => void;
  filteredFactors: EmissionFactor[];
  selectedKey: string | null;
  onSelect: (k: string) => void;
  selectedFactor: EmissionFactor | null;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag variant={SCOPE_VARIANT[chosenScope]}>
          {SCOPE_LABEL[chosenScope]}
        </Tag>
        <span className="font-mono text-[10.5px] tracking-wide text-ink-3">
          {filteredFactors.length} factors in catalogue
        </span>
        <input
          type="search"
          value={search}
          placeholder="gas natural, electricidad, vuelo…"
          autoFocus
          onChange={(e) => onSearch(e.target.value)}
          className="ml-auto w-[240px] rounded-md border border-line bg-panel px-2 py-[5px] font-mono text-[11px] text-ink-1 placeholder:text-ink-4 focus:border-ink-3 focus:outline-none"
        />
      </div>
      <div className="max-h-[280px] overflow-y-auto rounded-md border border-line">
        {filteredFactors.map((f) => {
          const isSelected = f.activityKey === selectedKey;
          return (
            <button
              type="button"
              key={f.activityKey}
              onClick={() => onSelect(f.activityKey)}
              className={
                'flex w-full items-center gap-2 border-b border-line-soft px-3 py-2 text-left last:border-b-0 ' +
                (isSelected ? 'bg-nfq-blueBg/50' : 'hover:bg-panel-hover')
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
              <span className="font-mono text-[9px] text-ink-3">/{f.efUnit}</span>
            </button>
          );
        })}
        {filteredFactors.length === 0 && (
          <div className="px-3 py-6 text-center text-[12px] text-ink-3">
            No factors match. Try a different search term.
          </div>
        )}
      </div>
      {selectedFactor && (
        <div className="rounded-md border border-line-soft bg-panel-soft px-3 py-2.5">
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
              {selectedFactor.efValue.toLocaleString('en-US', {
                maximumFractionDigits: 5,
              })}
            </strong>{' '}
            kgCO₂e / {selectedFactor.efUnit}
            {selectedFactor.sourceVersion && (
              <span className="text-ink-3"> · {selectedFactor.sourceVersion}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 3 · Quantity & context ───────────────────────────────────────

interface Step3Props {
  selectedFactor: EmissionFactor;
  quantityInputRaw: string;
  onQuantity: (s: string) => void;
  inputUnit: string;
  onInputUnit: (u: string) => void;
  compatibleUnits: string[];
  conversion:
    | { value: number; conversion: { fromUnit: string; toUnit: string; factor: number; note?: string } }
    | null;
  tco2e: number | null;
  dataQualityTier: DataQualityTier;
  onDataQualityTier: (t: DataQualityTier) => void;
  notes: string;
  onNotes: (n: string) => void;
  flatUnits: Array<{ unit: OperationalUnit; depth: number }>;
  operationalUnitId: string;
  onOperationalUnitId: (id: string) => void;
  disclosureBindings: string[];
  scope2Method: Scope2Method;
}

function Step3Quantity(p: Step3Props) {
  const {
    selectedFactor,
    quantityInputRaw,
    onQuantity,
    inputUnit,
    onInputUnit,
    compatibleUnits,
    conversion,
    tco2e,
    dataQualityTier,
    onDataQualityTier,
    notes,
    onNotes,
    flatUnits,
    operationalUnitId,
    onOperationalUnitId,
    disclosureBindings,
    scope2Method,
  } = p;
  const quantityInput = Number(quantityInputRaw);
  const hasQuantity =
    quantityInputRaw !== '' && !Number.isNaN(quantityInput) && quantityInput > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_140px] gap-2">
        <div>
          <label className="mb-1 block font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            Quantity
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            value={quantityInputRaw}
            autoFocus
            onChange={(e) => onQuantity(e.target.value)}
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
            onChange={(e) => onInputUnit(e.target.value)}
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

      {hasQuantity && (
        <div className="rounded-md border border-line-soft bg-canvas px-3 py-2.5">
          <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            Live preview
          </div>
          {conversion ? (
            <>
              {conversion.conversion.factor !== 1 && (
                <div className="mt-1 font-mono text-[11px] text-nfq-blue">
                  {quantityInput.toLocaleString('en-US')} {inputUnit} ×{' '}
                  {conversion.conversion.factor.toLocaleString('en-US', {
                    maximumFractionDigits: 6,
                  })}{' '}
                  = {conversion.value.toLocaleString('en-US', { maximumFractionDigits: 4 })}{' '}
                  {selectedFactor.efUnit}
                  {conversion.conversion.note && (
                    <span className="ml-1 text-ink-3"> · {conversion.conversion.note}</span>
                  )}
                </div>
              )}
              <div className="mt-1 font-mono text-[11.5px] text-ink-1">
                {conversion.value.toLocaleString('en-US', { maximumFractionDigits: 4 })}{' '}
                {selectedFactor.efUnit} ×{' '}
                {selectedFactor.efValue.toLocaleString('en-US', { maximumFractionDigits: 5 })}{' '}
                kgCO₂e/{selectedFactor.efUnit} ÷ 1000 ={' '}
                <strong className="text-nfq-green">
                  {tco2e?.toLocaleString('en-US', { maximumFractionDigits: 4 }) ?? '—'} tCO₂e
                </strong>
              </div>
            </>
          ) : (
            <div className="mt-1 text-[11px] text-nfq-red">
              No conversion available from {inputUnit} → {selectedFactor.efUnit}.
            </div>
          )}
        </div>
      )}

      <div>
        <label className="mb-1 block font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Location · operational scope
        </label>
        <select
          value={operationalUnitId}
          onChange={(e) => onOperationalUnitId(e.target.value)}
          className="w-full rounded-md border border-line bg-panel px-2 py-[7px] text-[12px] text-ink-1 focus:border-ink-3 focus:outline-none"
        >
          {flatUnits.length === 0 && (
            <option value="">— no operational units available —</option>
          )}
          {flatUnits.map(({ unit, depth }) => (
            <option key={unit.id} value={unit.id}>
              {'  '.repeat(depth)}
              {unit.shortCode ? `[${unit.shortCode}] ` : ''}
              {unit.name}
              {unit.country ? ` · ${unit.country}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Data quality tier (GHG Protocol)
        </label>
        <div className="flex gap-2">
          {([1, 2, 3] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onDataQualityTier(t)}
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

      <div>
        <label className="mb-1 block font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotes(e.target.value)}
          rows={2}
          placeholder="Source document, period covered, anomalies…"
          className="w-full rounded-md border border-line bg-panel px-2.5 py-[7px] text-[12px] text-ink-1 placeholder:text-ink-4 focus:border-ink-3 focus:outline-none"
        />
      </div>

      {disclosureBindings.length > 0 && (
        <div className="rounded-md border border-nfq-purple/30 bg-nfq-purpleBg/40 px-3 py-2.5">
          <div className="mb-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-nfq-purple">
            Feeds disclosure
          </div>
          <p className="text-[12px] leading-relaxed text-ink-1">
            This entry will feed{' '}
            {disclosureBindings.map((id, i) => (
              <span key={id}>
                {i > 0 && (i === disclosureBindings.length - 1 ? ' and ' : ', ')}
                <strong className="font-mono text-nfq-purple">{id}</strong>{' '}
                <span className="text-ink-2">
                  {DISCLOSURE_BINDING_LABELS[id] ?? '—'}
                </span>
              </span>
            ))}
            {'.'}
          </p>
          <p className="mt-1 font-mono text-[10px] text-ink-3">
            Linked automatically from scope
            {selectedFactor.scope === 's2' && ` · ${scope2Method.replace('_', '-')}`}
            . Audit-visible from the Hub drawer.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────

function Footer({
  step,
  canAdvanceFromStep1,
  canAdvanceFromStep2,
  canSave,
  isPending,
  tco2e,
  submitError,
  onBack,
  onNext,
  onSave,
  onClose,
}: {
  step: WizardStep;
  canAdvanceFromStep1: boolean;
  canAdvanceFromStep2: boolean;
  canSave: boolean;
  isPending: boolean;
  tco2e: number | null;
  submitError: string | null;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const canAdvance =
    step === 1 ? canAdvanceFromStep1 : step === 2 ? canAdvanceFromStep2 : false;
  return (
    <div className="flex items-center gap-2 border-t border-line-soft px-5 py-3">
      <div className="mr-auto flex items-center gap-3 min-w-0">
        {tco2e != null ? (
          <span className="font-mono text-[11px] text-ink-2">
            Live ·{' '}
            <strong className="text-nfq-green tabular-nums">
              {tco2e.toLocaleString('en-US', { maximumFractionDigits: 4 })} tCO₂e
            </strong>
          </span>
        ) : (
          <span className="font-mono text-[10.5px] text-ink-3">
            tCO₂e preview appears once quantity is entered
          </span>
        )}
        {submitError && (
          <span className="text-[11px] text-nfq-red" role="alert">
            {submitError}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        disabled={isPending}
        className="rounded-md border border-line bg-panel px-3 py-1.5 text-[12px] font-medium text-ink-2 hover:border-ink-5 hover:text-ink-1 disabled:opacity-60"
      >
        Cancel
      </button>
      {step > 1 && (
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="rounded-md border border-line bg-panel px-3 py-1.5 text-[12px] font-medium text-ink-2 hover:border-ink-5 hover:text-ink-1 disabled:opacity-60"
        >
          ← Back
        </button>
      )}
      {step < 3 ? (
        <button
          type="button"
          onClick={onNext}
          disabled={!canAdvance}
          title="cmd/ctrl + Enter"
          className={
            canAdvance
              ? 'rounded-md bg-ink-1 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-black'
              : 'rounded-md bg-canvas-edge px-3 py-1.5 text-[12px] font-medium text-ink-4'
          }
        >
          Next →
        </button>
      ) : (
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave || isPending}
          title="cmd/ctrl + Enter"
          className={
            canSave && !isPending
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
      )}
    </div>
  );
}
