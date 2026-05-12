import { formatNumber, formatTco2e, type Scope } from '@e60/domain';
import { ActivityColumn, type ActivityItem } from '@e60/ui';

/**
 * Recent inventory entries column.
 *
 * Receives the user's persisted entries (from public.emission_entries) as
 * a prop, formats them as ActivityItems, and prepends them to the seed
 * mocks. Server-rendered — no client store needed since the parent
 * server component refreshes on `revalidatePath` after each mutation.
 */
export interface PersistedEmissionEntry {
  id: string;
  scope: Scope;
  scope2Method: 'location_based' | 'market_based' | null;
  activityLabel: string;
  category: string;
  factorSource: 'MITECO' | 'IDAE' | 'DEFRA';
  efUnit: string;
  quantity: number;
  quantityInput: number;
  quantityInputUnit: string;
  conversionFactor: number;
  tco2e: number;
  dataQualityTier: 1 | 2 | 3;
  createdAt: string;
}

interface RecentEntriesColumnProps {
  /** Seed mocks rendered after live entries. */
  seedItems: ActivityItem[];
  /** User-owned entries fetched server-side. */
  liveEntries: PersistedEmissionEntry[];
}

const SCOPE_LABEL: Record<Scope, string> = {
  s1: 'Scope 1',
  s2: 'Scope 2',
  s3: 'Scope 3',
};

function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.max(0, Math.round((now - then) / 1000));
  if (sec < 60) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day} d ago`;
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

function entryToActivityItem(e: PersistedEmissionEntry): ActivityItem {
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
    date: relativeDate(e.createdAt),
  };
}

export function RecentEntriesColumn({
  seedItems,
  liveEntries,
}: RecentEntriesColumnProps) {
  const livePrepended = liveEntries.map(entryToActivityItem);
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
