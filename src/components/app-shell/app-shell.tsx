"use client";

import { useState } from "react";

import { ContentContainer } from "@/components/content-container/content-container";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Topbar } from "@/components/topbar/topbar";
import { useDashboardLayoutStore } from "@/stores/dashboard-layout-store";

export function AppShell() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isSidebarCollapsed = useDashboardLayoutStore(
    (state) => state.isSidebarCollapsed,
  );
  const toggleSidebar = useDashboardLayoutStore((state) => state.toggleSidebar);

  return (
    <main className="min-h-dvh bg-nox-noir text-nox-noir">
      <div className="flex min-h-dvh w-full overflow-hidden bg-nox-noir">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onToggleCollapse={toggleSidebar}
        />

        {isMobileSidebarOpen ? (
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-nox-noir/55 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
            type="button"
          />
        ) : null}

        <section className="flex h-dvh min-w-0 flex-1 flex-col overflow-hidden bg-background lg:my-4 lg:mr-4 lg:h-auto lg:min-h-[calc(100dvh-2rem)] lg:rounded-[2rem]">
          <Topbar onOpenNavigation={() => setIsMobileSidebarOpen(true)} />
          <ContentContainer />
        </section>
      </div>
    </main>
  );
}
