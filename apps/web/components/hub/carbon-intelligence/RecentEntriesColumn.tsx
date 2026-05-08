'use client';

import { formatNumber, formatTco2e } from '@e60/domain';
import { ActivityColumn, type ActivityItem } from '@e60/ui';
import { useCarbonIntelligenceStore, type CarbonEntry } from './store';

interface RecentEntriesColumnProps {
  /** Seed mocks rendered when there are no live additions. */
  seedItems: ActivityItem[];
}

const SCOPE_LABEL: Record<CarbonEntry['scope'], string> = {
  s1: 'Scope 1',
  s2: 'Scope 2',
  s3: 'Scope 3',
};

function entryToActivityItem(e: CarbonEntry): ActivityItem {
  const scopeBadge =
    e.scope === 's2' && e.scope2Method === 'market_based'
      ? 'Scope 2 (MB)'
      : e.scope === 's2'
        ? 'Scope 2 (LB)'
        : SCOPE_LABEL[e.scope];

  const tier = `T${e.dataQualityTier}`;
  const conversionNote =
    e.conversionFactor !== 1
      ? ` · ${e.quantityInput} ${e.quantityInputUnit} → ${formatNumber(e.quantity, { decimals: 4 })} ${e.efUnit}`
      : '';

  const t = formatTco2e(e.tco2e);
  const formattedTco2e = `${t.value} ${t.unit}`;

  return {
    title: (
      <>
        <strong className="font-semibold">{e.activityLabel}</strong> · {e.category}
      </>
    ),
    sub: `${scopeBadge} · ${e.factorSource} · ${tier}${conversionNote}`,
    value: formattedTco2e,
    date: 'just now',
  };
}

export function RecentEntriesColumn({ seedItems }: RecentEntriesColumnProps) {
  const addedEntries = useCarbonIntelligenceStore((s) => s.addedEntries);
  const livePrepended = addedEntries.map(entryToActivityItem);
  const items = [...livePrepended, ...seedItems];

  return (
    <ActivityColumn
      tone="created"
      title="Recent inventory entries"
      count={items.length}
      items={items}
      icon={
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M7 3v8M3 7h8" strokeLinecap="round" />
        </svg>
      }
    />
  );
}
