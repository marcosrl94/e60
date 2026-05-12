import { cookies } from 'next/headers';
import { SidebarPrimary } from '@/components/shell/SidebarPrimary';
import { Topbar } from '@/components/shell/Topbar';
import { SidebarSecondary } from '@/components/shell/SidebarSecondary';
import { AiLauncher } from '@/components/shell/AiLauncher';
import { CommandPaletteHost } from '@/components/cmd-k/CommandPaletteHost';
import { createClient } from '@/utils/supabase/server';
import type { UserMenuUser } from '@/components/shell/UserMenu';

/**
 * Shell layout
 *
 * Wraps every route inside (shell)/. Composed of:
 *   - SidebarPrimary    · 64px column with module icons
 *   - SidebarSecondary  · 220px column with the active module's tree (collapsible)
 *   - Topbar            · 52px header with search + status + user menu
 *   - AI launcher       · floating bottom-right
 *
 * The middleware guarantees we only land here with a session, but we
 * still resolve the user so the Topbar can render the avatar + email
 * without a client-side round-trip.
 */
export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const menuUser: UserMenuUser | null = user
    ? {
        email: user.email ?? 'anonymous',
        fullName:
          (user.user_metadata?.full_name as string | undefined) ??
          (user.user_metadata?.name as string | undefined),
        avatarUrl:
          (user.user_metadata?.avatar_url as string | undefined) ??
          (user.user_metadata?.picture as string | undefined),
      }
    : null;

  return (
    <div className="grid h-screen grid-cols-[64px_220px_1fr]">
      <SidebarPrimary />
      <SidebarSecondary />
      <main className="flex flex-col overflow-hidden">
        <Topbar user={menuUser} />
        <div className="flex-1 overflow-y-auto px-7 pb-14 pt-[18px]">
          {children}
        </div>
      </main>
      <AiLauncher />
      <CommandPaletteHost />
    </div>
  );
}
