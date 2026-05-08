'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

/** Custom DOM event other components dispatch to open the palette without a direct ref. */
export const CMD_K_OPEN_EVENT = 'e60:open-cmd-k';

/** Helper for components that want to open the palette imperatively. */
export function openCommandPalette() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CMD_K_OPEN_EVENT));
  }
}

/**
 * CommandPaletteHost
 *
 * Tiny client component that lives in the shell layout. Listens for
 * Cmd+K / Ctrl+K (and Meta+/ as a fallback some browsers use) and lazy-loads
 * the heavy CommandPalette component on first activation. Once loaded, it
 * stays in memory for the rest of the session.
 *
 * The dynamic import keeps the seeds (1184 datapoints, 41 factors, 52
 * sectors) out of the shared route bundle until someone opens the palette.
 */

const CommandPalette = dynamic(
  () => import('./CommandPalette').then((m) => m.CommandPalette),
  { ssr: false },
);

export function CommandPaletteHost() {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      // Cmd+K / Ctrl+K (also accept Meta+/ which some users prefer).
      if (isMod && (e.key === 'k' || e.key === 'K' || e.key === '/')) {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) setEverOpened(true);
          return !prev;
        });
      }
    }
    function handleOpenEvent() {
      setEverOpened(true);
      setOpen(true);
    }
    document.addEventListener('keydown', handleKey);
    window.addEventListener(CMD_K_OPEN_EVENT, handleOpenEvent);
    return () => {
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener(CMD_K_OPEN_EVENT, handleOpenEvent);
    };
  }, []);

  if (!everOpened) return null;
  return <CommandPalette open={open} onClose={() => setOpen(false)} />;
}
