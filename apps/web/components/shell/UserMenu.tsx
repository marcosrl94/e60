'use client';

import { useEffect, useRef, useState } from 'react';
import { signOut } from '@/app/auth/actions';

export interface UserMenuUser {
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

function initialsFor(user: UserMenuUser): string {
  if (user.fullName) {
    const parts = user.fullName.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
  }
  const handle = user.email.split('@')[0] ?? '';
  return (handle.slice(0, 2) || '?').toUpperCase();
}

/**
 * Topbar user pill. Shows initials (or Google avatar) and opens a
 * dropdown with the signed-in email + a sign-out form action.
 */
export function UserMenu({ user }: { user: UserMenuUser }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const initials = initialsFor(user);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-line bg-panel py-1 pl-1 pr-2.5 shadow-e60-sm transition-colors hover:border-nfq-blue/60"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="h-6 w-6 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10.5px] font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #f04e3e, #ff8c2d)' }}
          >
            {initials}
          </span>
        )}
        <span className="max-w-[160px] truncate font-mono text-[10px] tracking-wide text-ink-2">
          {user.email}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-30 w-[240px] rounded-lg border border-line bg-panel shadow-e60-lg"
        >
          <div className="border-b border-line px-3 py-2.5">
            <div className="truncate text-[12px] font-medium text-ink-1">
              {user.fullName ?? user.email}
            </div>
            {user.fullName ? (
              <div className="truncate text-[11px] text-ink-3">
                {user.email}
              </div>
            ) : null}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="block w-full px-3 py-2 text-left text-[12px] text-ink-1 transition-colors hover:bg-canvas"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
