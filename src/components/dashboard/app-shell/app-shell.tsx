"use client";

import { ListIcon } from "@phosphor-icons/react";
import type { ReactNode, UIEvent } from "react";
import { useRef, useState } from "react";

import { AuthGuard } from "@/components/commons/auth-guard/auth-guard";
import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { ContentContainer } from "@/components/dashboard/content-container/content-container";
import { MobilePageHeader } from "@/components/dashboard/mobile-page-header/mobile-page-header";
import type {
  PageBannerTone,
  PageBannerVariant,
} from "@/components/dashboard/page-banner/page-banner";
import { PageBanner } from "@/components/dashboard/page-banner/page-banner";
import type { PageHeaderVisualVariant } from "@/components/dashboard/page-header-visual/page-header-visual";
import { PromoStatusBanner } from "@/components/dashboard/promo-status-banner/promo-status-banner";
import { PublicLaunchBanner } from "@/components/dashboard/public-launch-banner/public-launch-banner";
import Sidebar from "@/components/dashboard/sidebar/sidebar";
import { getPageIcon } from "@/lib/dashboard-navigation";
import { useUiStore } from "@/stores/ui-store";

export type AppShellProps = {
  activeItem?: string;
  children?: ReactNode;
  description?: string;
  bannerTone?: PageBannerTone;
  bannerVariant?: PageBannerVariant;
  showBanner?: boolean;
  title?: string;
};

type PageTheme = {
  tone: PageBannerTone;
  variant?: PageBannerVariant;
  visual?: PageHeaderVisualVariant;
};

// Two separate thresholds create hysteresis: the header won't flicker between
// compact/expanded when the user scrolls right at the boundary.
const SCROLL_COMPACT_ON_THRESHOLD = 32;
const SCROLL_COMPACT_OFF_THRESHOLD = 16;

const pageThemes: Record<string, PageTheme> = {
  Dashboard: { tone: "golden" },
  Documents: { tone: "purple", visual: "documents" },
  "My Templates": {
    tone: "pink",
    visual: "templates",
  },
  "My Clients": { tone: "golden" },
  Marketplace: { tone: "teal", visual: "marketplace" },
  Subscription: {
    tone: "purple",
    visual: "subscription",
  },
  Settings: { tone: "golden", visual: "settings" },
};

export const AppShell = ({
  activeItem = "Dashboard",
  bannerTone,
  bannerVariant,
  children,
  description,
  showBanner = true,
  title = "Dashboard",
}: AppShellProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isContentScrolled, setIsContentScrolled] = useState(false);
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const scrollRafRef = useRef<number | null>(null);
  const latestScrollTopRef = useRef(0);

  const theme = pageThemes[activeItem] ?? {
    tone: "golden" as PageBannerTone,
  };
  const pageIcon = getPageIcon(activeItem);
  const resolvedTone = bannerTone ?? theme.tone;
  const resolvedVariant = bannerVariant ?? theme.variant ?? "solid";
  const isDashboardHome = activeItem === "Dashboard";
  const mobileDescription =
    showBanner && !isContentScrolled && !isDashboardHome ? description : undefined;

  const handleContentScroll = (event: UIEvent<HTMLDivElement>) => {
    // Always capture the latest scroll position so the RAF callback uses a
    // fresh value even if many scroll events fired while it was queued.
    latestScrollTopRef.current = event.currentTarget.scrollTop;

    // Skip if a frame is already scheduled — one RAF per paint is enough and
    // prevents queuing up dozens of state updates during fast scrolling.
    if (scrollRafRef.current !== null) {
      return;
    }

    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const scrollTop = latestScrollTopRef.current;
      setIsContentScrolled((previous) => {
        if (!previous && scrollTop > SCROLL_COMPACT_ON_THRESHOLD) {
          return true;
        }
        if (previous && scrollTop < SCROLL_COMPACT_OFF_THRESHOLD) {
          return false;
        }
        return previous;
      });
    });
  };

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
              <ContentContainer onScroll={handleContentScroll}>
                <MobilePageHeader
                  alignTitleWithNavigation={isDashboardHome}
                  description={mobileDescription}
                  icon={showBanner ? pageIcon : undefined}
                  isCompact={isContentScrolled}
                  onOpenNavigation={() => setIsMobileSidebarOpen(true)}
                  showSettingsLink={isDashboardHome}
                  title={title}
                  tone={isDashboardHome ? "noir" : resolvedTone}
                  variant={resolvedVariant}
                  visualVariant={showBanner ? theme.visual : undefined}
                />
                {showBanner ? (
                  <PageBanner
                    className="hidden lg:flex"
                    description={description}
                    icon={pageIcon}
                    title={title}
                    tone={resolvedTone}
                    variant={resolvedVariant}
                    visualVariant={theme.visual}
                  />
                ) : (
                  <ButtonIcon
                    aria-label="Open navigation"
                    className="hidden border border-steel-mist text-nox-noir hover:bg-base-200"
                    icon={
                      <ListIcon
                        aria-hidden
                        size={18}
                        weight="bold"
                      />
                    }
                    onClick={() => setIsMobileSidebarOpen(true)}
                    variant="ghost"
                  />
                )}
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
