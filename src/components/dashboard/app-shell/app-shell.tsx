"use client";

import {
  ChartLineUpIcon,
  CreditCardIcon,
  FilePlusIcon,
  FolderSimpleStarIcon,
  GearSixIcon,
  HouseIcon,
  ListIcon,
  StorefrontIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { useState } from "react";
import type { UIEvent } from "react";
import type { ReactNode } from "react";

import { AuthGuard } from "@/components/commons/auth-guard/auth-guard";
import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { ContentContainer } from "@/components/dashboard/content-container/content-container";
import { MobilePageHeader } from "@/components/dashboard/mobile-page-header/mobile-page-header";
import { PageBanner } from "@/components/dashboard/page-banner/page-banner";
import type { PageBannerTone, PageBannerVariant } from "@/components/dashboard/page-banner/page-banner";
import type { PageHeaderVisualVariant } from "@/components/dashboard/page-header-visual/page-header-visual";
import Sidebar from "@/components/dashboard/sidebar/sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { useSyncSavedTemplates } from "@/stores/templates-store";
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
  Icon: Icon;
  tone: PageBannerTone;
  variant?: PageBannerVariant;
  visual?: PageHeaderVisualVariant;
};

const pageThemes: Record<string, PageTheme> = {
  Dashboard: { Icon: ChartLineUpIcon, tone: "golden" },
  Documents: { Icon: FilePlusIcon, tone: "purple", visual: "documents" },
  "My Templates": { Icon: FolderSimpleStarIcon, tone: "pink", visual: "templates" },
  Marketplace: { Icon: StorefrontIcon, tone: "teal", visual: "marketplace" },
  Subscription: { Icon: CreditCardIcon, tone: "purple", visual: "subscription" },
  Settings: { Icon: GearSixIcon, tone: "golden", visual: "settings" },
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
  useSyncSavedTemplates();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isContentScrolled, setIsContentScrolled] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  const theme = pageThemes[activeItem] ?? { Icon: HouseIcon, tone: "golden" as PageBannerTone };
  const resolvedTone = bannerTone ?? theme.tone;
  const resolvedVariant = bannerVariant ?? theme.variant ?? "solid";
  const firstName = (user?.displayName ?? "there").split(" ")[0];
  const mobileTitle =
    activeItem === "Dashboard" && isContentScrolled ? `Welcome back, ${firstName}` : title;
  const mobileDescription = showBanner ? description : undefined;

  const handleContentScroll = (event: UIEvent<HTMLDivElement>) => {
    const nextScrolled = event.currentTarget.scrollTop > 24;
    setIsContentScrolled((previous) => (previous === nextScrolled ? previous : nextScrolled));
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
              className="fixed inset-0 z-30 bg-app-chrome/55 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
              type="button"
            />
          ) : null}

          <section className="flex h-dvh min-w-0 flex-1 flex-col overflow-hidden bg-app-chrome">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-app-panel lg:mr-4 lg:mb-4 lg:mt-4 lg:rounded-4xl">
              <ContentContainer onScroll={handleContentScroll}>
                <MobilePageHeader
                  description={mobileDescription}
                  icon={showBanner ? theme.Icon : undefined}
                  isCompact={isContentScrolled}
                  onOpenNavigation={() => setIsMobileSidebarOpen(true)}
                  title={mobileTitle}
                  tone={resolvedTone}
                  variant={resolvedVariant}
                  visualVariant={showBanner ? theme.visual : undefined}
                />
                {showBanner ? (
                  <PageBanner
                    className="hidden lg:flex"
                    description={description}
                    icon={theme.Icon}
                    title={title}
                    tone={resolvedTone}
                    variant={resolvedVariant}
                    visualVariant={theme.visual}
                  />
                ) : (
                  <ButtonIcon
                    aria-label="Open navigation"
                    className="hidden border border-steel-mist text-nox-noir hover:bg-base-200"
                    icon={<ListIcon aria-hidden size={18} weight="bold" />}
                    onClick={() => setIsMobileSidebarOpen(true)}
                    variant="ghost"
                  />
                )}
                {children}
              </ContentContainer>
            </div>
          </section>
        </div>
      </main>
    </AuthGuard>
  );
};
