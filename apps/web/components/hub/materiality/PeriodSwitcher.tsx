'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { createAssessment, type AssessmentRow } from '@/app/actions/dma';

interface PeriodSwitcherProps {
  current: string;
  assessments: AssessmentRow[];
}

/**
 * Period switcher · dropdown of all the user's assessments + a
 * "+ New period" inline form. Clicking another period navigates to
 * `/disclosure-hub/materiality?period=<X>` (driven by the server
 * component's searchParams).
 */
export function PeriodSwitcher({
  current,
  assessments,
}: PeriodSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setAdding(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        setAdding(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  function selectPeriod(p: string) {
    setOpen(false);
    if (p === current) return;
    router.push(
      `/disclosure-hub/materiality?period=${encodeURIComponent(p)}` as Route,
    );
  }

  function handleCreate() {
    setError(null);
    if (!draft.trim()) {
      setError('Period name is required.');
      return;
    }
    startTransition(async () => {
      const result = await createAssessment(draft);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      setDraft('');
      setAdding(false);
      setOpen(false);
      router.push(
        `/disclosure-hub/materiality?period=${encodeURIComponent(result.period)}` as Route,
      );
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md border border-line bg-canvas px-2 py-1 transition-colors hover:border-ink-5"
      >
        <span className="font-mono text-[13px] font-semibold text-ink-1">
          {current}
        </span>
        <svg
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          className="h-2.5 w-2.5 text-ink-3"
        >
          <path d="M2 4l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+4px)] z-30 w-[240px] rounded-lg border border-line bg-panel shadow-e60-lg"
        >
          <div className="max-h-[200px] overflow-y-auto py-1">
            {assessments.map((a) => {
              const isCurrent = a.id === assessments.find((x) => x.period === current)?.id || a.period === current;
              return (
                <button
                  key={a.id}
                  type="button"
                  role="option"
                  aria-selected={isCurrent}
                  onClick={() => selectPeriod(a.period)}
                  className={
                    'flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-[12px] transition-colors ' +
                    (isCurrent
                      ? 'bg-canvas text-ink-1'
                      : 'text-ink-2 hover:bg-canvas hover:text-ink-1')
                  }
                >
                  <span className="font-mono font-semibold">{a.period}</span>
                  <span className="font-mono text-[9.5px] tabular-nums text-ink-3">
                    T={a.threshold.toFixed(1)}
                  </span>
                </button>
              );
            })}
            {assessments.length === 0 && (
              <div className="px-3 py-2 text-[11.5px] text-ink-3">
                No assessments yet.
              </div>
            )}
          </div>

          <div className="border-t border-line-soft p-2">
            {adding ? (
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="e.g. FY2027 · Q1-2026"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                  }}
                  className="w-full rounded-md border border-line bg-canvas px-2 py-1 font-mono text-[12px] text-ink-1 placeholder:text-ink-4 focus:border-ink-3 focus:outline-none"
                />
                {error && (
                  <div className="text-[10.5px] text-nfq-red" role="alert">
                    {error}
                  </div>
                )}
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAdding(false);
                      setDraft('');
                      setError(null);
                    }}
                    disabled={isPending}
                    className="rounded-md border border-line bg-panel px-2 py-1 text-[10.5px] font-medium text-ink-2 hover:border-ink-5 hover:text-ink-1 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={isPending || !draft.trim()}
                    className={
                      isPending || !draft.trim()
                        ? 'rounded-md bg-canvas-edge px-2 py-1 text-[10.5px] font-medium text-ink-4'
                        : 'rounded-md bg-ink-1 px-2 py-1 text-[10.5px] font-medium text-white hover:bg-black'
                    }
                  >
                    {isPending ? 'Creating…' : 'Create'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="w-full rounded-md px-2 py-1 text-left text-[11.5px] font-medium text-nfq-blue transition-colors hover:bg-canvas"
              >
                + New period
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
