'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@e60/ui/lib/cn';

export interface SubTabSection {
  id: string;
  label: string;
  /** Optional small count rendered after the label (e.g. "41"). */
  count?: string | number;
  /** Pre-rendered content (server component output is fine — it's already serialised). */
  content: ReactNode;
}

interface SubTabsProps {
  sections: SubTabSection[];
  /** Default active tab id. Falls back to sections[0].id. */
  defaultId?: string;
}

/**
 * SubTabs
 *
 * Underline-style horizontal tab nav. The Carbon Intelligence module uses it
 * to split its long single-page layout into Overview / Inventory / Factor
 * catalogue / Disclosure feed.
 *
 * State is in-memory only — switching tabs re-mounts content, so a tab's
 * internal state (search text, scroll position) resets on switch. That's
 * fine for the demo; persist via URL ?tab= when needed.
 */
export function SubTabs({ sections, defaultId }: SubTabsProps) {
  const [activeId, setActiveId] = useState<string>(
    defaultId ?? sections[0]!.id,
  );
  const current =
    sections.find((s) => s.id === activeId) ?? sections[0]!;

  return (
    <div role="tablist" aria-label="Carbon Intelligence sections">
      <nav className="mb-4 flex items-center gap-1 border-b border-line">
        {sections.map((s) => {
          const isActive = s.id === activeId;
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`subtab-panel-${s.id}`}
              id={`subtab-${s.id}`}
              onClick={() => setActiveId(s.id)}
              className={cn(
                '-mb-px inline-flex items-center gap-1.5 border-b-2 px-3.5 py-2 text-[12.5px] font-medium tracking-tight transition-colors',
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
                    isActive
                      ? 'bg-ink-1 text-white'
                      : 'bg-canvas text-ink-3',
                  )}
                >
                  {s.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div
        role="tabpanel"
        id={`subtab-panel-${current.id}`}
        aria-labelledby={`subtab-${current.id}`}
      >
        {current.content}
      </div>
    </div>
  );
}
