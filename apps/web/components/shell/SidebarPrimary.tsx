'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@e60/ui/lib/cn';
import { openCommandPalette } from '@/components/cmd-k/CommandPaletteHost';

/**
 * Primary sidebar (64px wide column with module icons).
 *
 * Each icon represents one of the 6 product families. The active family
 * shows a red bar at its left edge. Tooltips appear on hover.
 *
 * `match` is the URL prefix used for active-state detection; `href` is the
 * actual destination (the default leaf route inside the module). They differ
 * for modules whose root path has no `page.tsx` (e.g. Disclosure Hub).
 */

interface ModuleEntry {
  href: Route;
  match: string;
  label: string;
  icon: ReactNode;
}

const MODULES: ModuleEntry[] = [
  {
    href: '/climate-lab',
    match: '/climate-lab',
    label: 'Climate & Nature Lab',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="9" r="7" />
        <path d="M2 9h14M9 2c2.5 2 4 4.5 4 7s-1.5 5-4 7M9 2c-2.5 2-4 4.5-4 7s1.5 5 4 7" />
      </svg>
    ),
  },
  {
    href: '/sustainable-finance',
    match: '/sustainable-finance',
    label: 'Sustainable Finance',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="4" cy="4" r="2" />
        <circle cx="14" cy="9" r="2" />
        <circle cx="4" cy="14" r="2" />
        <path d="M5.8 5l6.4 3M5.8 13l6.4-3" />
      </svg>
    ),
  },
  {
    href: '/disclosure-hub/overview',
    match: '/disclosure-hub',
    label: 'Disclosure Hub',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 2h7l3 3v11H4z" strokeLinejoin="round" />
        <path d="M11 2v3h3M6.5 9h5M6.5 11.5h5M6.5 14h3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/data-layer',
    match: '/data-layer',
    label: 'Data Layer',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 2.5l7 3.5-7 3.5-7-3.5z" strokeLinejoin="round" />
        <path d="M2 11l7 3.5 7-3.5" />
      </svg>
    ),
  },
  {
    href: '/trust-center',
    match: '/trust-center',
    label: 'Trust Center',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="8" width="10" height="7" rx="1.5" />
        <path d="M6 8V6a3 3 0 016 0v2" />
      </svg>
    ),
  },
];

export function SidebarPrimary() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col items-center bg-side-bg border-r border-side-border py-3">
      {/* Brand */}
      <Link
        href={'/disclosure-hub/overview' satisfies Route}
        className="mb-[18px] flex h-10 w-10 items-center justify-center rounded-[10px] shadow-[0_4px_10px_rgba(240,78,62,0.25)]"
        style={{
          background: 'linear-gradient(135deg, #f04e3e 0%, #ff8c2d 100%)',
        }}
      >
        <span className="text-[12.5px] font-bold tracking-tight text-white">E6.0</span>
      </Link>

      {/* Search shortcut */}
      <button
        onClick={() => openCommandPalette()}
        className="mb-3 flex h-7 w-10 items-center justify-center rounded-md text-side-icon transition hover:bg-canvas-edge hover:text-ink-1"
        title="Buscar (⌘K)"
        aria-label="Search"
      >
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
          <circle cx="6" cy="6" r="4.5" />
          <path d="M9.5 9.5l3 3" strokeLinecap="round" />
        </svg>
      </button>

      {/* Nav */}
      <nav className="flex w-full flex-1 flex-col items-center gap-0.5 px-2">
        {MODULES.map((m) => {
          const isActive = pathname.startsWith(m.match);
          return (
            <Link
              key={m.href}
              href={m.href}
              className={cn(
                'group relative flex h-10 w-10 items-center justify-center rounded-[10px]',
                'transition-colors',
                isActive
                  ? 'bg-side-activeBg text-ink-1 shadow-e60-md border border-side-activeBorder'
                  : 'text-side-icon hover:bg-canvas-edge hover:text-side-iconHover'
              )}
              title={m.label}
              aria-label={m.label}
            >
              {isActive && (
                <span className="absolute -left-2 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-r-sm bg-nfq-red" />
              )}
              <span className="h-[18px] w-[18px]">{m.icon}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
