'use client';

import { useState } from 'react';
import { ConnectorCard } from './ConnectorCard';
import { ConnectCsvDrawer } from './ConnectCsvDrawer';
import type { Connector } from './connectors';

/**
 * Client wrapper around `ConnectorCard` for the Portfolio CSV upload
 * connector. Owns the drawer open state; the rest of the card visuals
 * are delegated to the universal `ConnectorCard`.
 */
export function ConnectCsvCard({ connector }: { connector: Connector }) {
  const [open, setOpen] = useState(false);
  const label = connector.status === 'not_connected' ? 'Connect →' : 'Sync again';
  return (
    <>
      <ConnectorCard
        connector={connector}
        actionSlot={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded border border-ink-1 bg-ink-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-ink-1/90"
          >
            {label}
          </button>
        }
      />
      <ConnectCsvDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
