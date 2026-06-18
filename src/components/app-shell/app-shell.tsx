"use client";

import { useState } from "react";

import { ContentContainer } from "@/components/content-container/content-container";
import { PageIntro } from "@/components/page-intro/page-intro";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Topbar } from "@/components/topbar/topbar";
import { useDashboardLayoutStore } from "@/stores/dashboard-layout-store";

export type AppShellProps = {
  activeItem?: string;
  description?: string;
  pageTitle?: string;
  title?: string;
};

export function AppShell({
  activeItem = "Dashboard",
  description = "Here's your overview of your documents.",
  pageTitle = "Hello, Anthony!",
  title = "Dashboard",
}: AppShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isSidebarCollapsed = useDashboardLayoutStore(
    (state) => state.isSidebarCollapsed,
  );
  const toggleSidebar = useDashboardLayoutStore((state) => state.toggleSidebar);

  return (
    <main className="min-h-dvh bg-nox-noir text-nox-noir">
      <div className="flex min-h-dvh w-full overflow-hidden bg-nox-noir">
        <Sidebar
          activeItem={activeItem}
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

        <section className="flex h-dvh min-w-0 flex-1 flex-col overflow-hidden bg-nox-noir">
          <Topbar
            onOpenNavigation={() => setIsMobileSidebarOpen(true)}
            title={title}
          />
          <div className="flex min-h-0 flex-1 flex-col bg-background lg:mr-4 lg:mb-4 lg:rounded-[2rem]">
            <PageIntro description={description} title={pageTitle} />
            <ContentContainer />
          </div>
        </section>
      </div>
    </main>
  );
}
