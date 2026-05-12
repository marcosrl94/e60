'use client';

/**
 * Shell-level error boundary
 *
 * Next.js convention: any uncaught error inside an (shell)/ route bubbles
 * here. Renders an opinionated fallback (no white-screen) with a Retry that
 * calls `reset()` and a link to the Hub Overview as escape hatch.
 *
 * Production builds also drop `digest` (set by Next) to the console so the
 * incident can be cross-referenced with platform logs without leaking it
 * to the user-visible UI.
 */

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ShellError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[shell error boundary]', error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nfq-redBg text-nfq-red">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
          <circle cx="9" cy="9" r="7" />
          <path d="M9 5.5v4M9 12v.1" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="text-[18px] font-semibold tracking-tight text-ink-1">
        Something went wrong on this view
      </h2>
      <p className="max-w-[460px] text-[12.5px] leading-relaxed text-ink-3">
        The error has been logged. You can retry — most issues are transient
        — or jump back to the Hub Overview to keep working.
      </p>
      {error.digest && (
        <div className="font-mono text-[10px] tracking-wide text-ink-4">
          ref · {error.digest}
        </div>
      )}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-ink-1 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-black"
        >
          Retry
        </button>
        <Link
          href="/disclosure-hub/overview"
          className="rounded-md border border-line bg-panel px-3 py-1.5 text-[12px] font-medium text-ink-2 hover:border-ink-5 hover:text-ink-1"
        >
          Hub Overview
        </Link>
      </div>
    </div>
  );
}
