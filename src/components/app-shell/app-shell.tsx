"use client";

import {
  CreditCardIcon,
  FileTextIcon,
  GearSixIcon,
  HouseIcon,
  LayoutIcon,
  ListIcon,
  StorefrontIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { useState } from "react";
import type { ReactNode } from "react";

import { AuthGuard } from "@/components/auth-guard/auth-guard";
import { ButtonIcon } from "@/components/button-icon/button-icon";
import { ContentContainer } from "@/components/content-container/content-container";
import { PageBanner } from "@/components/page-banner/page-banner";
import type { PageBannerTone, PageBannerVariant } from "@/components/page-banner/page-banner";
import { Sidebar } from "@/components/sidebar/sidebar";
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

const pageThemes: Record<string, { Icon: Icon; tone: PageBannerTone; variant?: PageBannerVariant }> = {
  Dashboard: { Icon: HouseIcon, tone: "bloodwood" },
  Documents: { Icon: FileTextIcon, tone: "blue" },
  "My Templates": { Icon: LayoutIcon, tone: "pink" },
  Marketplace: { Icon: StorefrontIcon, tone: "golden" },
  Subscription: { Icon: CreditCardIcon, tone: "purple" },
  Settings: { Icon: GearSixIcon, tone: "teal" },
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
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  const theme = pageThemes[activeItem] ?? { Icon: HouseIcon, tone: "golden" as PageBannerTone };
  const resolvedTone = bannerTone ?? theme.tone;
  const resolvedVariant = bannerVariant ?? theme.variant ?? "solid";

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
              <ContentContainer>
                {showBanner ? (
                  <PageBanner
                    description={description}
                    icon={theme.Icon}
                    onOpenNavigation={() => setIsMobileSidebarOpen(true)}
                    title={title}
                    tone={resolvedTone}
                    variant={resolvedVariant}
                  />
                ) : (
                  <ButtonIcon
                    aria-label="Open navigation"
                    className="border border-steel-mist text-nox-noir hover:bg-base-200 lg:hidden"
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
