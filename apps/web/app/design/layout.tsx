import Link from 'next/link';

/**
 * /design layout
 *
 * Stand-alone layout (outside the (shell)/ route group) so the design
 * reference renders without the sidebar / topbar chrome and is suitable
 * for screenshots, auditor walkthroughs and embed in slide decks.
 */

const SECTIONS: { id: string; label: string }[] = [
  { id: 'tokens-color', label: 'Color tokens' },
  { id: 'tokens-type', label: 'Typography' },
  { id: 'tokens-shadow', label: 'Shadows' },
  { id: 'tag', label: 'Tag' },
  { id: 'framework-chip', label: 'FrameworkChip' },
  { id: 'kpi-card', label: 'KpiCard' },
  { id: 'sparkline', label: 'Sparkline' },
  { id: 'panel', label: 'Panel' },
  { id: 'activity-column', label: 'ActivityColumn' },
  { id: 'donut-card', label: 'DonutCard' },
  { id: 'skeleton', label: 'Skeleton' },
  { id: 'drawer', label: 'Drawer' },
  { id: 'coming-soon', label: 'ComingSoon' },
];

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[220px_1fr] bg-canvas">
      <aside className="sticky top-0 h-screen overflow-y-auto border-r border-line bg-panel px-3 py-4">
        <Link
          href="/disclosure-hub/overview"
          className="mb-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 hover:text-ink-1"
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3 w-3">
            <path d="M7 3l-3 3 3 3" strokeLinecap="round" />
          </svg>
          Back to app
        </Link>
        <div className="mb-3 px-2 text-[14px] font-semibold tracking-tight text-ink-1">
          E6.0 · Design system
        </div>
        <div className="mb-3 px-2 font-mono text-[9.5px] tracking-wide text-ink-3">
          Tokens + 10 primitives from <code className="rounded bg-canvas px-1 py-px">@e60/ui</code>.
        </div>
        <nav className="space-y-px">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="block rounded-md px-2 py-1.5 text-[12.5px] text-ink-2 transition-colors hover:bg-canvas hover:text-ink-1"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </aside>
      <main className="overflow-x-hidden px-10 py-10">{children}</main>
    </div>
  );
}
