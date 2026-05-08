'use client';

import { useState } from 'react';
import { Drawer, Tag } from '@e60/ui';

/**
 * Interactive Drawer demo for the design system page. Renders the trigger
 * + a small sample drawer with three tabs so reviewers can see the slide,
 * the tab subcomponent and the close behavior in one click.
 */
export function DrawerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-ink-1 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-black"
      >
        Open sample drawer
      </button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="DESIGN SYSTEM"
        title="Sample drawer"
        meta={<Tag variant="green">Demo</Tag>}
      >
        <Drawer.Tabs
          sections={[
            {
              id: 'overview',
              label: 'Overview',
              content: (
                <div className="px-5 py-4 text-[12.5px] text-ink-2">
                  This is what a Drawer.Tabs section looks like. The tab nav
                  stays sticky inside the drawer body; this content scrolls.
                </div>
              ),
            },
            {
              id: 'detail',
              label: 'Detail',
              count: 3,
              content: (
                <div className="px-5 py-4 text-[12.5px] text-ink-2">
                  Sections take a label, an optional count badge that flips
                  color when active, and a ReactNode content slot. Server-
                  rendered content survives the boundary just fine.
                </div>
              ),
            },
            {
              id: 'history',
              label: 'History',
              content: (
                <div className="px-5 py-4 text-[12.5px] text-ink-2">
                  Esc closes, backdrop closes, the × button closes. Body
                  scroll is locked while open.
                </div>
              ),
            },
          ]}
        />
      </Drawer>
    </>
  );
}
