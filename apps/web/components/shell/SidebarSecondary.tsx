'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@e60/ui/lib/cn';

/**
 * Secondary sidebar (220px wide column).
 *
 * Shows the active module's tree. Currently only the Disclosure Hub
 * tree is implemented; other modules will get their own structure when
 * they're picked.
 *
 * Collapsible via the [ keyboard shortcut.
 */

interface SubItem {
  href: Route;
  label: string;
  icon: React.ReactNode;
  badge?: 'NZ' | 'CI' | 'EBA';
  soon?: boolean;
}

interface Section {
  label: string;
  items: SubItem[];
}

const HUB_TREE: Section[] = [
  {
    label: '',
    items: [
      {
        href: '/disclosure-hub/overview',
        label: 'Overview',
        icon: (
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="2" width="4" height="4" rx="0.5" />
            <rect x="8" y="2" width="4" height="4" rx="0.5" />
            <rect x="2" y="8" width="4" height="4" rx="0.5" />
            <rect x="8" y="8" width="4" height="4" rx="0.5" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Calculation engines',
    items: [
      {
        href: '/disclosure-hub/carbon-intelligence',
        label: 'Carbon Intelligence',
        icon: (
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 2c1.7 1.7 2.5 3.3 2.5 5a2.5 2.5 0 11-5 0c0-1.7.8-3.3 2.5-5z" strokeLinejoin="round" />
          </svg>
        ),
        badge: 'CI',
      },
      {
        href: '/disclosure-hub/financed-emissions',
        label: 'Financed Emissions',
        icon: (
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 9l3-3 2 2 5-5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 3h3v3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        badge: 'NZ',
      },
      {
        href: '/disclosure-hub/net-zero-trajectory',
        label: 'Net Zero Trajectory',
        icon: (
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="5" />
            <circle cx="7" cy="7" r="2.5" />
            <path d="M7 1.5v3M7 9.5v3M1.5 7h3M9.5 7h3" strokeLinecap="round" />
          </svg>
        ),
        badge: 'NZ',
      },
    ],
  },
  {
    label: 'Catalogue & methodology',
    items: [
      {
        href: '/disclosure-hub/repository',
        label: 'Datapoint Repository',
        icon: (
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 3h10v8H2z" strokeLinejoin="round" />
            <path d="M2 6h10M5 3v8" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        href: '/disclosure-hub/materiality',
        label: 'Materiality Studio',
        icon: (
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="2" width="10" height="10" rx="1" />
            <path d="M2 7h10M7 2v10" strokeLinecap="round" />
            <circle cx="9.5" cy="4.5" r="1" fill="currentColor" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Output',
    items: [
      {
        href: '/disclosure-hub/outputs',
        label: 'Output Generators',
        icon: (
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 1.5h6l2 2v9H3z" />
            <path d="M9 1.5v2h2M5 7h4M5 9.5h4" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        href: '/disclosure-hub/pillar-iii',
        label: 'Pillar III ESG',
        icon: (
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 1.5l5 2v3.6c0 3-2 5.2-5 5.9-3-.7-5-2.9-5-5.9V3.5z" strokeLinejoin="round" />
          </svg>
        ),
        badge: 'EBA',
      },
    ],
  },
];

export function SidebarSecondary() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Listen for [ keyboard shortcut to toggle
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
      if (e.key === '[' && !e.metaKey && !e.ctrlKey) {
        setCollapsed((c) => !c);
        e.preventDefault();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Only show hub tree when we're inside /disclosure-hub
  const isInHub = pathname.startsWith('/disclosure-hub');
  if (!isInHub) {
    // For other modules we haven't built their tree yet — render an empty column.
    return <aside className="border-r border-line bg-panel" />;
  }

  return (
    <aside
      className={cn(
        'flex flex-col overflow-hidden border-r border-line bg-panel transition-[width,opacity]',
        collapsed && 'w-0 opacity-0'
      )}
    >
      {/* Head */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-line-soft px-3.5 py-2.5">
        <div className="flex items-center gap-1.5 text-[13px] font-semibold tracking-tight text-ink-1">
          <span
            className="flex h-[22px] w-[22px] items-center justify-center rounded-sm text-white"
            style={{ background: 'linear-gradient(135deg, #7a4cf0, #9d77f5)' }}
          >
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3 w-3">
              <path d="M2.5 1.5h5l2 2v7h-7z" strokeLinejoin="round" />
              <path
                d="M7.5 1.5v2h2M4 6h4M4 7.5h4M4 9h2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          Disclosure Hub
        </div>
        <button
          className="flex h-[22px] w-[22px] items-center justify-center rounded-sm text-ink-3 transition hover:bg-canvas hover:text-ink-1"
          onClick={() => setCollapsed(true)}
          title="Colapsar [ "
          aria-label="Collapse sidebar"
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3 w-3">
            <path d="M7.5 3l-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-2 pb-3.5 pt-2.5">
        {HUB_TREE.map((section, sIdx) => (
          <div key={sIdx} className="mb-3.5">
            {section.label && (
              <div className="px-2.5 pb-1 pt-2 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-4">
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative mb-px flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12.5px] transition',
                    isActive
                      ? 'bg-nfq-redBg font-medium text-nfq-red'
                      : 'text-ink-2 hover:bg-canvas hover:text-ink-1'
                  )}
                >
                  {isActive && (
                    <span className="absolute -left-2 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-sm bg-nfq-red" />
                  )}
                  <span className="h-3.5 w-3.5 flex-shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'rounded-[3px] px-1.5 py-px font-mono text-[8.5px] font-semibold uppercase tracking-wide',
                        item.badge === 'CI' && 'bg-nfq-purpleBg text-nfq-purple',
                        item.badge === 'NZ' && 'bg-nfq-orangeBg text-nfq-orange',
                        item.badge === 'EBA' && 'bg-nfq-redBg text-nfq-red',
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.soon && (
                    <span className="rounded-[3px] bg-canvas px-1.5 py-px font-mono text-[8.5px] font-semibold uppercase tracking-wide text-ink-4">
                      soon
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Foot */}
      <div className="flex-shrink-0 border-t border-line-soft px-3.5 py-3">
        <div className="flex items-center gap-1.5 font-mono text-[9.5px] tracking-wide text-ink-3">
          <kbd className="rounded-[3px] border border-line bg-canvas px-1.5 py-px text-ink-2">[</kbd>
          <span>collapse</span>
          <span className="px-1">·</span>
          <kbd className="rounded-[3px] border border-line bg-canvas px-1.5 py-px text-ink-2">⌘K</kbd>
          <span>search</span>
        </div>
      </div>
    </aside>
  );
}
