'use client';

import { openCommandPalette } from '@/components/cmd-k/CommandPaletteHost';

/**
 * Topbar (52px tall).
 *
 * Search box · user pill · system status · help/notifications icons.
 * Stays consistent across all routes.
 *
 * The "search" affordance is a button that opens the global Cmd+K palette
 * — there's no inline search input. The palette indexes routes, datapoints,
 * sectors, factors and disclosures.
 */

export function Topbar() {
  return (
    <header className="flex h-[52px] flex-shrink-0 items-center gap-4 border-b border-canvas-edge bg-canvas px-6">
      {/* Search trigger */}
      <button
        type="button"
        onClick={() => openCommandPalette()}
        aria-label="Open search palette"
        className="flex h-8 w-[280px] items-center gap-2 rounded-md border border-line bg-panel px-2.5 text-left shadow-e60-sm transition-colors hover:border-nfq-blue/60 focus:border-nfq-blue focus:outline-none focus:ring-2 focus:ring-nfq-blue/20"
      >
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3 flex-shrink-0 text-ink-3">
          <circle cx="6" cy="6" r="4.5" />
          <path d="M9.5 9.5l3 3" strokeLinecap="round" />
        </svg>
        <span className="flex-1 text-[12.5px] text-ink-4">
          Buscar datapoint, framework, contraparte…
        </span>
        <kbd className="rounded-[3px] bg-canvas-edge px-1.5 py-px font-mono text-[10px] tracking-wide text-ink-3">
          ⌘K
        </kbd>
      </button>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2.5">
        {/* User pill */}
        <div className="flex items-center gap-2 rounded-full border border-line bg-panel py-1 pl-1 pr-2.5 shadow-e60-sm">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10.5px] font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #f04e3e, #ff8c2d)' }}
          >
            MC
          </span>
          <span className="font-mono text-[10px] tracking-wide text-ink-2">CRO · 1 ONLINE</span>
        </div>

        {/* System status */}
        <div className="flex items-center gap-1.5 rounded-full bg-nfq-greenBg px-2.5 py-[5px] font-mono text-[10px] font-semibold uppercase tracking-wider text-nfq-green">
          <span
            className="h-1.5 w-1.5 rounded-full bg-nfq-green"
            style={{ boxShadow: '0 0 0 3px rgba(26, 165, 106, 0.18)' }}
          />
          SYSTEM ONLINE
        </div>

        {/* Icon buttons (help / notifications) */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-panel text-ink-3 shadow-e60-sm transition-colors hover:text-ink-1"
          aria-label="Help"
        >
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
            <circle cx="7" cy="7" r="5.5" />
            <path d="M5.5 5.5a1.5 1.5 0 113 0c0 1-1.5 1.5-1.5 2.5M7 10v.1" strokeLinecap="round" />
          </svg>
        </button>

        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-md border border-line bg-panel text-ink-3 shadow-e60-sm transition-colors hover:text-ink-1"
          aria-label="Notifications"
        >
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
            <path d="M11 9.5V6a4 4 0 00-8 0v3.5L2 11h10z" strokeLinejoin="round" />
            <path d="M5.5 12.5h3" strokeLinecap="round" />
          </svg>
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border-[1.5px] border-panel bg-nfq-red" />
        </button>
      </div>
    </header>
  );
}
