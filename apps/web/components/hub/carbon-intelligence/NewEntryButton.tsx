'use client';

import { useEffect, useState } from 'react';
import type { EmissionFactor } from '@e60/domain';
import type { OperationalUnit } from '@/lib/operational-units-shared';
import { NewEntryForm } from './NewEntryForm';

interface NewEntryButtonProps {
  factors: EmissionFactor[];
  units: OperationalUnit[];
}

export function NewEntryButton({ factors, units }: NewEntryButtonProps) {
  const [open, setOpen] = useState(false);

  // Close on Escape, lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md bg-ink-1 px-2.5 py-[6px] text-[11px] font-medium text-white hover:bg-black"
      >
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3 w-3">
          <path d="M6 2v8M2 6h8" strokeLinecap="round" />
        </svg>
        New entry
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <div
            className="absolute inset-0 bg-ink-1/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-[640px] rounded-lg border border-line bg-panel shadow-e60-pop">
            <NewEntryForm
              factors={factors}
              units={units}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
