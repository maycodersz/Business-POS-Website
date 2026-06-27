import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { signOutAction } from "@/app/(app)/actions";
import { AppPrefetcher } from "@/components/layout/app-prefetcher";
import { AddItemButton } from "@/components/layout/add-item-button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { QuickActionMenu } from "@/components/layout/quick-action-menu";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";

type AppShellProps = {
  children: ReactNode;
  userEmail?: string;
};

export function AppShell({ children, userEmail }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <AppPrefetcher />
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 md:flex md:flex-col">
        <div>
          <p className="text-lg font-semibold tracking-tight">ResellOps</p>
          <p className="mt-1 text-xs text-slate-500">Personal operations tracker</p>
        </div>
        <SidebarNav />
        <form action={signOutAction} className="mt-4">
          <Button variant="ghost" className="w-full justify-start" type="submit">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </Button>
        </form>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-950 md:hidden">
                ResellOps
              </p>
              <p className="truncate text-xs text-slate-500">
                {userEmail ?? "Authenticated workspace"}
              </p>
            </div>
            <AddItemButton />
          </div>
        </header>

        <main className="px-4 py-6 pb-24 sm:px-6 lg:px-8 md:pb-8">
          {children}
        </main>
      </div>

      <QuickActionMenu />
      <MobileNav />
    </div>
  );
}
