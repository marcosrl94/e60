'use client';

import { useState, useTransition } from 'react';
import type {
  DmaIro,
  DmaIroType,
  TimeHorizon,
  ValueChainScope,
} from '@e60/domain';
import { createIro, deleteIro } from '@/app/actions/iros';

const TYPE_LABEL: Record<DmaIroType, string> = {
  impact_actual: 'Actual impact',
  impact_potential: 'Potential impact',
  risk: 'Risk',
  opportunity: 'Opportunity',
};

const TYPE_CHIP: Record<DmaIroType, string> = {
  impact_actual: 'bg-nfq-redBg text-nfq-red',
  impact_potential: 'bg-nfq-orangeBg text-nfq-orange',
  risk: 'bg-canvas text-ink-2 border border-line',
  opportunity: 'bg-nfq-greenBg text-nfq-green',
};

const HORIZON_LABEL: Record<TimeHorizon, string> = {
  short: '< 1y',
  medium: '1–5y',
  long: '> 5y',
};

const SCOPE_LABEL: Record<ValueChainScope, string> = {
  own_operations: 'Own ops',
  upstream: 'Upstream',
  downstream: 'Downstream',
};

interface IrosTabProps {
  assessmentId: string;
  matterId: string;
  iros: DmaIro[];
}

export function IrosTab({ assessmentId, matterId, iros }: IrosTabProps) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="px-6 py-4">
      {/* List */}
      {iros.length === 0 ? (
        <div className="mb-3 rounded-md border border-dashed border-line bg-canvas px-3 py-6 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
            No IROs registered yet
          </div>
          <p className="mt-1 text-[11.5px] leading-relaxed text-ink-3">
            Add the specific impacts, risks and opportunities you
            identified for this matter. The list is what auditors will
            review against your scoring.
          </p>
        </div>
      ) : (
        <ul role="list" className="mb-3 space-y-2">
          {iros.map((iro) => (
            <IroRow key={iro.id} iro={iro} />
          ))}
        </ul>
      )}

      {/* Add form */}
      {adding ? (
        <AddIroForm
          assessmentId={assessmentId}
          matterId={matterId}
          onCancel={() => setAdding(false)}
          onAdded={() => setAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full rounded-md border border-line bg-panel px-3 py-2 text-[12px] font-medium text-ink-1 transition-colors hover:border-ink-5 hover:bg-canvas"
        >
          + Add IRO
        </button>
      )}
    </div>
  );
}

function IroRow({ iro }: { iro: DmaIro }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteIro(iro.id);
      if ('error' in result) setError(result.error);
    });
  }

  return (
    <li className="rounded-md border border-line-soft bg-panel px-3 py-2.5">
      <div className="mb-1 flex flex-wrap items-center gap-1.5">
        <span
          className={
            'rounded-[3px] px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-wider ' +
            TYPE_CHIP[iro.type]
          }
        >
          {TYPE_LABEL[iro.type]}
        </span>
        <span className="font-mono text-[9.5px] tracking-wide text-ink-3">
          {HORIZON_LABEL[iro.timeHorizon]} ·{' '}
          {SCOPE_LABEL[iro.valueChainLocation]}
        </span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          aria-label="Delete IRO"
          className="ml-auto rounded-md p-1 text-ink-4 transition-colors hover:bg-canvas hover:text-nfq-red disabled:opacity-60"
        >
          <svg
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-3.5 w-3.5"
          >
            <path d="M3 4h8M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4v7a1 1 0 001 1h2a1 1 0 001-1V4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <p className="text-[12px] leading-relaxed text-ink-1">
        {iro.description}
      </p>
      {iro.stakeholders.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {iro.stakeholders.map((s) => (
            <span
              key={s}
              className="rounded-[3px] bg-canvas px-1.5 py-px font-mono text-[9.5px] text-ink-2"
            >
              {s}
            </span>
          ))}
        </div>
      )}
      {error && (
        <div className="mt-1 text-[11px] text-nfq-red" role="alert">
          {error}
        </div>
      )}
    </li>
  );
}

function AddIroForm({
  assessmentId,
  matterId,
  onCancel,
  onAdded,
}: {
  assessmentId: string;
  matterId: string;
  onCancel: () => void;
  onAdded: () => void;
}) {
  const [type, setType] = useState<DmaIroType>('impact_potential');
  const [description, setDescription] = useState('');
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('medium');
  const [valueChain, setValueChain] = useState<ValueChainScope>('own_operations');
  const [stakeholdersRaw, setStakeholdersRaw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    const stakeholders = stakeholdersRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    startTransition(async () => {
      const result = await createIro({
        assessmentId,
        matterId,
        type,
        description,
        timeHorizon,
        valueChainLocation: valueChain,
        stakeholders,
      });
      if ('error' in result) {
        setError(result.error);
        return;
      }
      // Reset
      setDescription('');
      setStakeholdersRaw('');
      onAdded();
    });
  }

  return (
    <div className="rounded-md border border-ink-1 bg-canvas px-3 py-3 space-y-2.5">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
        Add IRO
      </div>

      {/* Type */}
      <FieldRow label="Type">
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              'impact_actual',
              'impact_potential',
              'risk',
              'opportunity',
            ] as const
          ).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={type === t}
              onClick={() => setType(t)}
              className={
                'rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors ' +
                (type === t
                  ? 'border-ink-1 bg-ink-1 text-white'
                  : 'border-line bg-panel text-ink-2 hover:border-ink-5 hover:text-ink-1')
              }
            >
              {TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      </FieldRow>

      {/* Description */}
      <FieldRow label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="e.g. Increased frequency of flooding at the Madrid data centre disrupts continuity (potential impact)."
          className="w-full rounded-md border border-line bg-panel px-2.5 py-1.5 text-[12px] text-ink-1 placeholder:text-ink-4 focus:border-ink-3 focus:outline-none"
        />
      </FieldRow>

      {/* Time horizon */}
      <FieldRow label="Time horizon">
        <div className="grid grid-cols-3 gap-1.5">
          {(['short', 'medium', 'long'] as const).map((h) => (
            <button
              key={h}
              type="button"
              role="radio"
              aria-checked={timeHorizon === h}
              onClick={() => setTimeHorizon(h)}
              className={
                'rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors ' +
                (timeHorizon === h
                  ? 'border-ink-1 bg-ink-1 text-white'
                  : 'border-line bg-panel text-ink-2 hover:border-ink-5 hover:text-ink-1')
              }
            >
              {HORIZON_LABEL[h]}
            </button>
          ))}
        </div>
      </FieldRow>

      {/* Value chain location */}
      <FieldRow label="Value chain location">
        <div className="grid grid-cols-3 gap-1.5">
          {(['own_operations', 'upstream', 'downstream'] as const).map(
            (v) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={valueChain === v}
                onClick={() => setValueChain(v)}
                className={
                  'rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors ' +
                  (valueChain === v
                    ? 'border-ink-1 bg-ink-1 text-white'
                    : 'border-line bg-panel text-ink-2 hover:border-ink-5 hover:text-ink-1')
                }
              >
                {SCOPE_LABEL[v]}
              </button>
            ),
          )}
        </div>
      </FieldRow>

      {/* Stakeholders */}
      <FieldRow
        label="Stakeholders"
        hint="comma-separated · e.g. Local communities, ECB, internal CRO"
      >
        <input
          type="text"
          value={stakeholdersRaw}
          onChange={(e) => setStakeholdersRaw(e.target.value)}
          placeholder="Stakeholder A, Stakeholder B"
          className="w-full rounded-md border border-line bg-panel px-2.5 py-1.5 text-[12px] text-ink-1 placeholder:text-ink-4 focus:border-ink-3 focus:outline-none"
        />
      </FieldRow>

      {error && (
        <div className="text-[11px] text-nfq-red" role="alert">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-md border border-line bg-panel px-3 py-1.5 text-[11.5px] font-medium text-ink-2 hover:border-ink-5 hover:text-ink-1 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || description.trim().length < 3}
          className={
            isPending || description.trim().length < 3
              ? 'rounded-md bg-canvas-edge px-3 py-1.5 text-[11.5px] font-medium text-ink-4'
              : 'rounded-md bg-ink-1 px-3 py-1.5 text-[11.5px] font-medium text-white hover:bg-black'
          }
        >
          {isPending ? 'Saving…' : 'Add IRO'}
        </button>
      </div>
    </div>
  );
}

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-3">
        {label}
        {hint && (
          <span className="ml-1.5 font-normal normal-case tracking-normal text-ink-4">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
