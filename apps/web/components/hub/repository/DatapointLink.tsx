'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@e60/ui/lib/cn';
import { useRepositoryFilters } from './store';

interface DatapointLinkProps {
  /** Datapoint id (e.g. "E1-6_05"). */
  id: string;
  /** Visible label; defaults to the id. */
  children?: React.ReactNode;
  /** Tailwind override (typography/colour scoped to the consumer). */
  className?: string;
  /** When true, navigation isn't routed: the parent will close a drawer first. */
  preventNavigation?: boolean;
}

/**
 * DatapointLink
 *
 * Click → set `selectedId` in the repository store + push to
 * `/disclosure-hub/repository`. The Repository view auto-opens the
 * DatapointDrawer on the freshly-selected id, so the click feels like
 * a deep link from any drawer / panel into the catalogue.
 *
 * Reuses the same store the ⌘K palette uses, which means the cmd-k
 * "datapoint" results, Pillar III feeding lists, Outputs disclosure
 * datapoints, CI feed lists and Repository all share one canonical
 * "open this datapoint" action.
 */
export function DatapointLink({
  id,
  children,
  className,
  preventNavigation,
}: DatapointLinkProps) {
  const router = useRouter();
  function activate(e: React.MouseEvent | React.KeyboardEvent) {
    e.preventDefault();
    e.stopPropagation();
    useRepositoryFilters.setState({ selectedId: id });
    if (!preventNavigation) router.push('/disclosure-hub/repository');
  }
  return (
    <button
      type="button"
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') activate(e);
      }}
      className={cn(
        'rounded-[3px] px-1 py-px font-mono text-[10.5px] font-semibold tracking-wide text-ink-1',
        'transition-colors hover:bg-nfq-blueBg hover:text-nfq-blue',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-nfq-blue/40',
        className,
      )}
      title={`Open ${id} in Datapoint Repository`}
      data-datapoint-link={id}
    >
      {children ?? id}
    </button>
  );
}
