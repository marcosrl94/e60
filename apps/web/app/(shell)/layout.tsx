import { SidebarPrimary } from '@/components/shell/SidebarPrimary';
import { Topbar } from '@/components/shell/Topbar';
import { SidebarSecondary } from '@/components/shell/SidebarSecondary';
import { AiLauncher } from '@/components/shell/AiLauncher';
import { CommandPaletteHost } from '@/components/cmd-k/CommandPaletteHost';

/**
 * Shell layout
 *
 * Wraps every route inside (shell)/. Composed of:
 *   - SidebarPrimary    · 64px column with module icons
 *   - SidebarSecondary  · 220px column with the active module's tree (collapsible)
 *   - Topbar            · 52px header with search + status + user
 *   - AI launcher       · floating bottom-right
 *
 * The SidebarSecondary content is route-aware (read from the URL).
 */
export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-screen grid-cols-[64px_220px_1fr]">
      <SidebarPrimary />
      <SidebarSecondary />
      <main className="flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto px-7 pb-14 pt-[18px]">
          {children}
        </div>
      </main>
      <AiLauncher />
      <CommandPaletteHost />
    </div>
  );
}
