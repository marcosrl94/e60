'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Datapoint, EmissionFactor, NaceSector } from '@e60/domain';
import datapointsSeed from '@/data/seed/datapoints.json';
import factorsSeed from '@/data/seed/emission-factors.json';
import sectorsSeed from '@/data/seed/nace-sectors.json';
import { useRepositoryFilters } from '@/components/hub/repository/store';
import { useMaterialityStore } from '@/components/hub/materiality/store';
import {
  buildIndex,
  ROUTES,
  score,
  type AnyResult,
  type DatapointResult,
  type SectorResult,
} from './sources';

// Build the index once when this client chunk mounts.
const INDEX = buildIndex({
  datapoints: datapointsSeed as unknown as Datapoint[],
  sectors: sectorsSeed as unknown as NaceSector[],
  factors: factorsSeed as unknown as EmissionFactor[],
});

const PER_KIND_CAP: Record<AnyResult['kind'], number> = {
  route: 8,
  datapoint: 12,
  disclosure: 6,
  sector: 6,
  factor: 6,
};

const KIND_ORDER: AnyResult['kind'][] = [
  'route',
  'datapoint',
  'disclosure',
  'sector',
  'factor',
];

const KIND_LABEL: Record<AnyResult['kind'], string> = {
  route: 'Routes',
  datapoint: 'Datapoints',
  disclosure: 'Disclosures',
  sector: 'NACE sectors',
  factor: 'Emission factors',
};

const KIND_ICON_BG: Record<AnyResult['kind'], string> = {
  route: 'bg-canvas-edge text-ink-2',
  datapoint: 'bg-nfq-redBg text-nfq-red',
  disclosure: 'bg-nfq-greenBg text-nfq-green',
  sector: 'bg-nfq-purpleBg text-nfq-purple',
  factor: 'bg-nfq-blueBg text-nfq-blue',
};

const KIND_GLYPH: Record<AnyResult['kind'], string> = {
  route: '↗',
  datapoint: '·',
  disclosure: '◇',
  sector: '#',
  factor: 'ƒ',
};

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ── Search ────────────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const groups: Record<AnyResult['kind'], AnyResult[]> = {
      route: [],
      datapoint: [],
      disclosure: [],
      sector: [],
      factor: [],
    };

    if (!q) {
      // Empty query · show 8 routes as default suggestions.
      groups.route = ROUTES.slice(0, 8);
    } else {
      const all: AnyResult[] = [
        ...INDEX.routes,
        ...INDEX.datapoints,
        ...INDEX.disclosures,
        ...INDEX.sectors,
        ...INDEX.factors,
      ];
      const scored = all
        .map((r) => ({ r, s: score(query, r) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s);
      for (const { r } of scored) {
        const cap = PER_KIND_CAP[r.kind];
        if (groups[r.kind].length < cap) groups[r.kind].push(r);
      }
    }

    const flat: AnyResult[] = [];
    const sectionStarts: { kind: AnyResult['kind']; start: number; count: number }[] = [];
    for (const k of KIND_ORDER) {
      if (groups[k].length === 0) continue;
      sectionStarts.push({ kind: k, start: flat.length, count: groups[k].length });
      flat.push(...groups[k]);
    }
    return { flat, sectionStarts };
  }, [query]);

  // Keep activeIdx in range when results shrink.
  useEffect(() => {
    if (activeIdx >= grouped.flat.length) {
      setActiveIdx(Math.max(0, grouped.flat.length - 1));
    }
  }, [grouped.flat.length, activeIdx]);

  // Focus input on open + reset query/cursor
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIdx(0);
    setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  // Lock body scroll while open + Esc to close
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

  // Auto-scroll active result into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  function activate(r: AnyResult) {
    onClose();
    switch (r.kind) {
      case 'route':
        router.push(r.href);
        break;
      case 'datapoint': {
        const dpId = r.id.replace(/^dp-/, '');
        useRepositoryFilters.setState({ selectedId: dpId });
        router.push('/disclosure-hub/repository');
        break;
      }
      case 'sector': {
        const code = r.id.replace(/^sec-/, '');
        const current = useMaterialityStore.getState().orgSectors;
        if (!current.includes(code)) {
          useMaterialityStore.setState({ orgSectors: [...current, code] });
        }
        router.push('/disclosure-hub/materiality');
        break;
      }
      case 'factor':
        router.push('/disclosure-hub/carbon-intelligence');
        break;
      case 'disclosure':
        router.push('/disclosure-hub/outputs');
        break;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, grouped.flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = grouped.flat[activeIdx];
      if (r) activate(r);
    }
  }

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Command palette" className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]">
      <div
        className="absolute inset-0 bg-ink-1/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-[640px] overflow-hidden rounded-lg border border-line bg-panel shadow-e60-pop">
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-line-soft px-4 py-3">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5 text-ink-3">
            <circle cx="6" cy="6" r="4" />
            <path d="M9.5 9.5l3 3" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search routes, datapoints, sectors, factors, disclosures…"
            className="flex-1 bg-transparent font-mono text-[13px] text-ink-1 placeholder:text-ink-4 focus:outline-none"
          />
          <kbd className="rounded-[3px] border border-line bg-canvas px-1.5 py-px font-mono text-[10px] text-ink-3 tracking-wide">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-1">
          {grouped.flat.length === 0 ? (
            <div className="px-4 py-10 text-center text-[12px] text-ink-3">
              No results for <span className="font-mono text-ink-1">"{query}"</span>.
            </div>
          ) : (
            grouped.sectionStarts.map((section) => (
              <div key={section.kind}>
                <div className="px-4 pb-1 pt-2 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-4">
                  {KIND_LABEL[section.kind]}
                </div>
                {grouped.flat
                  .slice(section.start, section.start + section.count)
                  .map((r, j) => {
                    const idx = section.start + j;
                    const active = idx === activeIdx;
                    return (
                      <button
                        key={r.id}
                        data-idx={idx}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => activate(r)}
                        className={
                          'flex w-full items-center gap-2.5 px-4 py-2 text-left transition-colors ' +
                          (active ? 'bg-canvas' : 'bg-panel hover:bg-panel-hover')
                        }
                      >
                        <span
                          className={
                            'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md font-mono text-[12px] font-semibold ' +
                            KIND_ICON_BG[r.kind]
                          }
                        >
                          {KIND_GLYPH[r.kind]}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-1 text-[12.5px] text-ink-1">
                            {r.label}
                          </span>
                          {r.sublabel && (
                            <span className="line-clamp-1 font-mono text-[10px] text-ink-3 tracking-wide">
                              {r.sublabel}
                            </span>
                          )}
                        </span>
                        {active && (
                          <kbd className="rounded-[3px] border border-line bg-panel px-1.5 py-px font-mono text-[9.5px] text-ink-3 tracking-wide">
                            ↵
                          </kbd>
                        )}
                      </button>
                    );
                  })}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between border-t border-line-soft bg-panel-soft px-4 py-2 font-mono text-[10px] text-ink-3 tracking-wide">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded-[3px] border border-line bg-panel px-1.5 py-px text-ink-2">↑</kbd>
              <kbd className="rounded-[3px] border border-line bg-panel px-1.5 py-px text-ink-2">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded-[3px] border border-line bg-panel px-1.5 py-px text-ink-2">↵</kbd>
              open
            </span>
          </div>
          <span>{grouped.flat.length} results</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;

// Helpers used by the host (not exported for application-side consumers).
export type { DatapointResult, SectorResult };
