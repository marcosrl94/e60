'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** Header title — bold ink-1. */
  title: ReactNode;
  /** Small monospace caption above the title (eyebrow). */
  eyebrow?: ReactNode;
  /** Right-aligned chips/badges next to the close button. */
  meta?: ReactNode;
  children: ReactNode;
  /** Pixel width when open. Defaults to the design-token drawer width (720). */
  width?: number;
  className?: string;
}

/**
 * Drawer
 *
 * Right-side slide-in panel used to deep-edit a single object (a disclosure,
 * a datapoint, an IRO…) without leaving the underlying page. Width 720px by
 * default; backdrop dims and blurs the rest of the surface; Esc / backdrop
 * click closes; body scroll locks while open.
 *
 * Animation: a transform-only slide via tailwind transition utilities to
 * stay GPU-friendly and avoid layout thrash.
 */
export function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  meta,
  children,
  width = 720,
  className,
}: DrawerProps) {
  // We render the drawer at all times so the slide-out animation can play.
  // `mounted` controls whether we keep it in the tree at all (after the
  // close animation finishes, we unmount to free the DOM).
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50"
      onTransitionEnd={() => {
        if (!open) setMounted(false);
      }}
    >
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-ink-1/40 backdrop-blur-[2px] transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <aside
        style={{ width }}
        className={cn(
          'absolute right-0 top-0 flex h-full max-w-[100vw] flex-col border-l border-line bg-panel shadow-e60-pop transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
          className,
        )}
      >
        <div className="flex flex-shrink-0 items-start justify-between border-b border-line-soft px-5 py-3.5">
          <div className="min-w-0">
            {eyebrow && (
              <div className="mb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                {eyebrow}
              </div>
            )}
            <div className="text-[16px] font-semibold leading-snug text-ink-1">
              {title}
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2 pl-4">
            {meta}
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
        </div>
        <div className="flex-1 overflow-hidden">{children}</div>
      </aside>
    </div>
  );
}

// ── Tabs subcomponent ─────────────────────────────────────────────────────

export interface DrawerTabsSection {
  id: string;
  label: string;
  /** Optional small count rendered after the label. */
  count?: string | number;
  content: ReactNode;
}

interface DrawerTabsProps {
  sections: DrawerTabsSection[];
  defaultId?: string;
  className?: string;
}

/**
 * Drawer.Tabs · horizontal tab nav scoped to a Drawer body. Underline style,
 * sticky at the top of the drawer body so the tabs stay visible while the
 * content scrolls.
 */
function DrawerTabs({ sections, defaultId, className }: DrawerTabsProps) {
  const [activeId, setActiveId] = useState<string>(
    defaultId ?? sections[0]!.id,
  );
  const current = sections.find((s) => s.id === activeId) ?? sections[0]!;
  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <nav
        role="tablist"
        className="flex flex-shrink-0 items-center gap-1 border-b border-line px-5"
      >
        {sections.map((s) => {
          const isActive = s.id === activeId;
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(s.id)}
              className={cn(
                '-mb-px inline-flex items-center gap-1.5 border-b-2 px-2.5 py-2 text-[12px] font-medium tracking-tight transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-1 focus-visible:rounded-sm',
                isActive
                  ? 'border-ink-1 text-ink-1'
                  : 'border-transparent text-ink-3 hover:text-ink-1',
              )}
            >
              {s.label}
              {s.count != null && (
                <span
                  className={cn(
                    'rounded-[3px] px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-wide',
                    isActive ? 'bg-ink-1 text-white' : 'bg-canvas text-ink-3',
                  )}
                >
                  {s.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto">
        {current.content}
      </div>
    </div>
  );
}

Drawer.Tabs = DrawerTabs;
