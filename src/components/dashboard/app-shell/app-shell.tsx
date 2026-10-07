"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { AuthGuard } from "@/components/commons/auth-guard/auth-guard";
import { ContentContainer } from "@/components/dashboard/content-container/content-container";
import { MobilePageHeader } from "@/components/dashboard/mobile-page-header/mobile-page-header";
import { NotificationBell } from "@/components/dashboard/notification-bell/notification-bell";
import type {
  PageBannerTone,
  PageBannerVariant,
} from "@/components/dashboard/page-banner/page-banner";
import { PageBanner } from "@/components/dashboard/page-banner/page-banner";
import { PromoStatusBanner } from "@/components/dashboard/promo-status-banner/promo-status-banner";
import { PublicLaunchBanner } from "@/components/dashboard/public-launch-banner/public-launch-banner";
import Sidebar from "@/components/dashboard/sidebar/sidebar";
import { useUiStore } from "@/stores/ui-store";

export type AppShellProps = {
  activeItem?: string;
  children?: ReactNode;
  headerContent?: ReactNode;
  description?: string;
  bannerTone?: PageBannerTone;
  bannerVariant?: PageBannerVariant;
  showBanner?: boolean;
  title?: string;
};

type PageTheme = {
  tone: PageBannerTone;
  variant?: PageBannerVariant;
};

const pageThemes: Record<string, PageTheme> = {
  Dashboard: { tone: "golden" },
  "My Documents": { tone: "purple" },
  "My Templates": {
    tone: "pink",
  },
  "My Clients": { tone: "blue" },
  Marketplace: { tone: "teal" },
  Subscription: {
    tone: "purple",
  },
  Settings: { tone: "golden" },
};

export const AppShell = ({
  activeItem = "Dashboard",
  bannerTone,
  bannerVariant,
  children,
  headerContent,
  showBanner = true,
  title = "Dashboard",
}: AppShellProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  const theme = pageThemes[activeItem] ?? {
    tone: "golden" as PageBannerTone,
  };
  const resolvedTone = bannerTone ?? theme.tone;
  const resolvedVariant = bannerVariant ?? theme.variant ?? "solid";
  const isDashboardHome = activeItem === "Dashboard";

  useEffect(() => {
    const themeColor = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    const previousThemeColor = themeColor?.content;
    const previousHtmlBackground =
      document.documentElement.style.backgroundColor;
    const previousBodyBackground = document.body.style.backgroundColor;
    const colors = getComputedStyle(document.documentElement);
    const nextColor = colors
      .getPropertyValue(
        isMobileSidebarOpen ? "--color-nox-noir" : "--color-app-panel",
      )
      .trim();

    if (themeColor) {
      themeColor.content = nextColor;
    }
    document.documentElement.style.backgroundColor = nextColor;
    document.body.style.backgroundColor = nextColor;

    return () => {
      if (themeColor && previousThemeColor) {
        themeColor.content = previousThemeColor;
      }
      document.documentElement.style.backgroundColor = previousHtmlBackground;
      document.body.style.backgroundColor = previousBodyBackground;
    };
  }, [isMobileSidebarOpen]);

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
              className="fixed inset-0 z-60 bg-app-chrome/55 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
              type="button"
            />
          ) : null}

          <section className="flex h-dvh min-w-0 flex-1 flex-col overflow-hidden bg-app-chrome">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-app-panel lg:mr-4 lg:mb-4 lg:mt-4 lg:rounded-4xl">
              <ContentContainer>
                <MobilePageHeader
                  actions={
                    <NotificationBell
                      tone={isDashboardHome ? "dark" : "light"}
                    />
                  }
                  onOpenNavigation={() => setIsMobileSidebarOpen(true)}
                  showSettingsLink
                  title={title}
                  tone={isDashboardHome ? "noir" : resolvedTone}
                  variant={resolvedVariant}
                />
                {showBanner ? (
                  <PageBanner
                    actions={
                      <NotificationBell
                        tone={resolvedTone === "noir" ? "dark" : "light"}
                      />
                    }
                    className="hidden lg:flex"
                    footer={headerContent}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebar={toggleSidebar}
                    showSettingsLink
                    title={title}
                    tone={resolvedTone}
                    variant={resolvedVariant}
                  />
                ) : null}
                <PromoStatusBanner />
                <PublicLaunchBanner />
                {children}
              </ContentContainer>
            </div>
          </section>
        </div>
      </main>
    </AuthGuard>
  );
};

export default AppShell;
