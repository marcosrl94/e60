'use client';

import { useState, useTransition } from 'react';
import { updateAssessmentThreshold } from '@/app/actions/dma';

interface ThresholdControlProps {
  assessmentId: string;
  initialThreshold: number;
}

/**
 * Slider for the assessment's materiality cut-off. Optimistic UI:
 * we show the new value immediately, then run the server action.
 * On error we roll back to the previous value and surface the
 * message inline.
 */
export function ThresholdControl({
  assessmentId,
  initialThreshold,
}: ThresholdControlProps) {
  const [value, setValue] = useState(initialThreshold);
  const [committed, setCommitted] = useState(initialThreshold);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function commit(next: number) {
    setError(null);
    setValue(next);
    startTransition(async () => {
      const result = await updateAssessmentThreshold(assessmentId, next);
      if ('error' in result) {
        setError(result.error);
        setValue(committed);
        return;
      }
      setCommitted(next);
    });
  }

  return (
    <div className="flex items-center gap-2.5">
      <label
        htmlFor="threshold-slider"
        className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3"
      >
        Threshold
      </label>
      <input
        id="threshold-slider"
        type="range"
        min={0}
        max={5}
        step={0.5}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onMouseUp={(e) => commit(Number((e.target as HTMLInputElement).value))}
        onTouchEnd={(e) =>
          commit(Number((e.target as HTMLInputElement).value))
        }
        className="h-1 w-36 accent-nfq-red"
        aria-label="Materiality threshold"
      />
      <span
        className={
          'font-mono text-[12px] tabular-nums ' +
          (isPending ? 'text-ink-3' : 'text-ink-1')
        }
      >
        {value.toFixed(1)}
      </span>
      {error && (
        <span className="text-[11px] text-nfq-red" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
