"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { ContentContainer } from "@/components/content-container/content-container";
import { PageIntro } from "@/components/page-intro/page-intro";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Topbar } from "@/components/topbar/topbar";
import { useUiStore } from "@/stores/ui-store";

export type AppShellProps = {
  activeItem?: string;
  children?: ReactNode;
  description?: string;
  pageTitle?: string;
  title?: string;
};

export const AppShell = ({
  activeItem = "Dashboard",
  children,
  description = "Here's your overview of your documents.",
  pageTitle = "Hello, Anthony!",
  title = "Dashboard",
}: AppShellProps) => {
  const appPalette = useUiStore((state) => state.appPalette);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <main className="min-h-dvh bg-app-chrome text-nox-noir" data-palette={appPalette}>
      <div className="flex min-h-dvh w-full overflow-hidden bg-app-chrome">
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
            className="fixed inset-0 z-30 bg-app-chrome/55 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
            type="button"
          />
        ) : null}

        <section className="flex h-dvh min-w-0 flex-1 flex-col overflow-hidden bg-app-chrome">
          <Topbar
            onOpenNavigation={() => setIsMobileSidebarOpen(true)}
            title={title}
          />
          <div className="flex min-h-0 flex-1 flex-col bg-app-panel lg:mr-4 lg:mb-4 lg:rounded-2xl">
            <PageIntro description={description} title={pageTitle} />
            <ContentContainer>{children}</ContentContainer>
          </div>
        </section>
      </div>
    </main>
  );
};
