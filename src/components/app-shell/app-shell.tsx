"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { AuthGuard } from "@/components/auth-guard/auth-guard";
import { ContentContainer } from "@/components/content-container/content-container";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Topbar } from "@/components/topbar/topbar";
import { useAuthStore } from "@/stores/auth-store";
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
  description,
  pageTitle,
  title = "Dashboard",
}: AppShellProps) => {
  const user = useAuthStore((state) => state.user);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const displayName = user?.displayName ?? "Dokiments User";
  const userInitials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase())
    .join("") || "DU";

  return (
    <AuthGuard>
      <main className="min-h-dvh bg-app-chrome text-nox-noir">
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
              userInitials={userInitials}
              userName={displayName}
            />
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-app-panel lg:mr-4 lg:mb-4 lg:rounded-2xl">
              <ContentContainer>{children}</ContentContainer>
            </div>
          </section>
        </div>
      </main>
    </AuthGuard>
  );
};
