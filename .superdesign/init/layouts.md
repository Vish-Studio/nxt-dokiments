# Layouts
AppShell: noir chrome, left Sidebar, rounded white panel (lg:rounded-4xl) holding PageBanner (desktop, tone per page: My Documents=purple) or MobilePageHeader (phones), then content.

### `src/components/dashboard/app-shell/app-shell.tsx`
```tsx
"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { AuthGuard } from "@/components/commons/auth-guard/auth-guard";
import { Toaster } from "@/components/commons/toaster/toaster";
import { ContentContainer } from "@/components/dashboard/content-container/content-container";
import { MobilePageHeader } from "@/components/dashboard/mobile-page-header/mobile-page-header";
import { NotificationBell } from "@/components/dashboard/notification-bell/notification-bell";
import { RefreshButton } from "@/components/dashboard/refresh-button/refresh-button";
import { OnboardingLauncher } from "@/components/dashboard/onboarding-launcher/onboarding-launcher";
import type {
  PageBannerTone,
  PageBannerVariant,
} from "@/components/dashboard/page-banner/page-banner";
import { PageBanner } from "@/components/dashboard/page-banner/page-banner";
import { PromoStatusBanner } from "@/components/dashboard/promo-status-banner/promo-status-banner";
import { PublicLaunchBanner } from "@/components/dashboard/public-launch-banner/public-launch-banner";
import Sidebar from "@/components/dashboard/sidebar/sidebar";
import { VerifyEmailNotice } from "@/components/dashboard/verify-email-notice/verify-email-notice";
import { documentSharingEnabled } from "@/lib/sharing/feature-flag";
import { type PageBack, useUiStore } from "@/stores/ui-store";

export type AppShellProps = {
  activeItem?: string;
  /**
   * Sub-page routes: a back arrow before the title in the top bar, e.g.
   * `{ href: "/my-documents", label: "Companies" }`. Content can override it
   * (and the title) at runtime with `usePageHeader`.
   */
  back?: PageBack;
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
  // Black, like the app chrome, so the golden welcome card stands out below it.
  Dashboard: { tone: "noir" },
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
  back,
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
  const pageHeader = useUiStore((state) => state.pageHeader);
  const resolvedTitle = pageHeader?.title ?? title;
  const resolvedBack = pageHeader?.back ?? back;

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
      {/* Exactly one screen tall, never taller: only ContentContainer scrolls,
          so the page itself can't scroll as well (two scrolls on phones). */}
      <main className="h-dvh overflow-hidden bg-app-chrome text-nox-noir">
        <div className="flex h-dvh w-full overflow-hidden bg-app-chrome">
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
                    <div className="flex items-center gap-2">
                      <RefreshButton
                        tone={isDashboardHome ? "dark" : "light"}
                      />
                      <NotificationBell
                        tone={isDashboardHome ? "dark" : "light"}
                      />
                    </div>
                  }
                  back={resolvedBack}
                  onOpenNavigation={() => setIsMobileSidebarOpen(true)}
                  showSettingsLink
                  title={resolvedTitle}
                  tone={isDashboardHome ? "noir" : resolvedTone}
                  variant={resolvedVariant}
                />
                {showBanner ? (
                  <PageBanner
                    actions={
                      <div className="flex items-center gap-2">
                        <RefreshButton
                          tone={resolvedTone === "noir" ? "dark" : "light"}
                        />
                        <NotificationBell
                          tone={resolvedTone === "noir" ? "dark" : "light"}
                        />
                      </div>
                    }
                    className="hidden lg:flex"
                    footer={headerContent}
                    back={resolvedBack}
                    showSettingsLink
                    title={resolvedTitle}
                    tone={resolvedTone}
                    variant={resolvedVariant}
                  />
                ) : null}
                <PromoStatusBanner />
                <PublicLaunchBanner />
                {documentSharingEnabled ? <VerifyEmailNotice /> : null}
                {children}
              </ContentContainer>
              <OnboardingLauncher />
            </div>
          </section>
        </div>
      </main>
      <Toaster />
    </AuthGuard>
  );
};

export default AppShell;
```

### `src/components/dashboard/sidebar/sidebar.tsx`
```tsx
import { SidebarSimpleIcon, XIcon } from "@phosphor-icons/react";
import type { FunctionComponent } from "react";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import SidebarAccount from "@/components/dashboard/sidebar-account/sidebar-account";
import SidebarFeedback from "@/components/dashboard/sidebar-feedback/sidebar-feedback";
import SidebarItem from "@/components/dashboard/sidebar-item/sidebar-item";
import SidebarOnboarding from "@/components/dashboard/sidebar-onboarding/sidebar-onboarding";
import { SidebarToggleButton } from "@/components/dashboard/sidebar-toggle-button/sidebar-toggle-button";
import { sidebarItems, settingsNavigationItem } from "@/lib/dashboard-navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface Props {
  activeItem?: string;
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onToggleCollapse?: () => void;
}


const Sidebar: FunctionComponent<Props> = ({
  activeItem = "Dashboard",
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={cn(
        "sidebar fixed inset-y-0 left-0 z-70 flex w-70 shrink-0 flex-col bg-app-chrome px-5 pt-6 lg:pt-9 pb-5 text-app-chrome-content transition-all duration-300 lg:static lg:z-auto lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "lg:w-24" : "lg:w-60",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-3",
          isCollapsed && "lg:justify-center",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label={isCollapsed ? "Expand sidebar" : "Dokiments home"}
            className={cn(
              "group/expand relative size-9 shrink-0 items-center justify-center rounded-field text-app-nav transition-colors hover:bg-app-nav-hover hover:text-app-chrome-content",
              isCollapsed ? "hidden lg:flex" : "hidden",
            )}
            onClick={isCollapsed ? onToggleCollapse : undefined}
            type="button"
          >
            {/* The logo mark, swapped for the sidebar icon on hover so the
                way to expand is obvious. */}
            <Image
              alt="Dokiments icon"
              className="size-8 group-hover/expand:hidden"
              height={100}
              src={"/images/svg/icon-white.svg"}
              width={100}
            />
            <SidebarSimpleIcon
              aria-hidden
              className="hidden group-hover/expand:block"
              size={18}
              weight="bold"
            />
          </button>

          <Link
            className={cn(
              "items-center gap-3",
              isCollapsed ? "flex lg:hidden" : "flex",
            )}
            aria-label="Dokiments home"
            href="/"
          >
            {/* The wordmark is 16880×2544 (≈6.6:1). Its real ratio must be
                given here: a square 120×120 box reserved a 120px-tall gap until
                the SVG loaded, pushing the nav down (layout shift on reload). */}
            <Image
              alt="Dokiments logo"
              className="mb-1 h-[18px] w-[120px]"
              height={18}
              priority
              src={"/images/svg/logo-white.svg"}
              width={120}
            />
          </Link>
        </div>
        {!isCollapsed && onToggleCollapse ? (
          <SidebarToggleButton
            isCollapsed={false}
            onToggle={onToggleCollapse}
          />
        ) : null}
        {isMobileOpen ? (
          <ButtonIcon
            aria-label="Close navigation"
            className="border-none lg:hidden text-app-nav hover:bg-app-nav-hover hover:text-app-chrome-content"
            icon={<XIcon aria-hidden size={16} weight="bold" />}
            onClick={onCloseMobile}
            size="sm"
            variant="ghost"
          />
        ) : null}
      </div>

      <nav className="mt-10 grid gap-3">
        {sidebarItems.map((item) => (
          <SidebarItem
            {...item}
            isActive={item.label === activeItem}
            isCollapsed={isCollapsed}
            key={item.label}
            onCloseMobile={onCloseMobile}
          />
        ))}
      </nav>

      <div className="mt-auto grid gap-3 pt-8">
        <SidebarOnboarding
          isCollapsed={isCollapsed}
          onCloseMobile={onCloseMobile}
        />
        <SidebarFeedback
          isCollapsed={isCollapsed}
          onCloseMobile={onCloseMobile}
        />
        <SidebarItem
          {...settingsNavigationItem}
          isActive={activeItem === "Settings"}
          isCollapsed={isCollapsed}
          onCloseMobile={onCloseMobile}
        />
        <SidebarAccount isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
};

Sidebar.displayName = "Sidebar";
export default Sidebar;
```

### `src/components/dashboard/sidebar-item/sidebar-item.tsx`
```tsx
import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import type { FunctionComponent } from "react";

import { cn } from "@/lib/utils";
import { iconSize, navIconWeight } from "@/lib/icons";

interface Props {
  className?: string;
  href: string;
  icon: Icon;
  isActive?: boolean;
  isCollapsed?: boolean;
  label: string;
  onCloseMobile?: () => void;
}

/**
 * The shared look of a sidebar row.
 *
 * Exported because not every row is a link: `SidebarFeedback` opens a dialog and
 * so has to be a `<button>`, but must be indistinguishable from its neighbours.
 * Keeping the classes here means the two cannot drift apart.
 */
export const sidebarRowClassName = ({
  className,
  isActive = false,
  isCollapsed = false,
}: {
  className?: string;
  isActive?: boolean;
  isCollapsed?: boolean;
}) =>
  cn(
    "sidebar-item group flex h-10 items-center gap-3 rounded-lg px-3 font-title text-sm font-semibold transition-colors",
    isActive
      ? "bg-white text-app-active-content"
      : "text-app-nav hover:bg-app-nav-hover hover:text-app-chrome-content",
    isCollapsed && "lg:justify-center lg:px-0",
    className,
  );

/**
 * The label of a sidebar row, hidden to a screen-reader-only element when the
 * sidebar is collapsed on desktop. Shared with `SidebarFeedback` for the same
 * reason as {@link sidebarRowClassName}.
 */
export const sidebarRowLabelClassName = (isCollapsed: boolean) =>
  cn("truncate transition-opacity", isCollapsed && "lg:sr-only lg:opacity-0");

const SidebarItem: FunctionComponent<Props> = ({
  className,
  href,
  icon: Icon,
  isActive = false,
  isCollapsed = false,
  label,
  onCloseMobile,
}) => {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={sidebarRowClassName({ className, isActive, isCollapsed })}
      href={href}
      onClick={onCloseMobile}
      title={isCollapsed ? label : undefined}
    >
      <Icon
        aria-hidden
        className={cn("shrink-0", isActive && "drop-shadow-[0_0_0_currentColor]")}
        size={iconSize.nav}
        weight={navIconWeight(isActive)}
      />
      <span className={sidebarRowLabelClassName(isCollapsed)}>{label}</span>
    </Link>
  );
};

SidebarItem.displayName = "SidebarItem";
export default SidebarItem;
```

### `src/components/dashboard/mobile-page-header/mobile-page-header.tsx`
```tsx
"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { ListIcon, UserIcon } from "@phosphor-icons/react";
import Link from "next/link";

import {
  ButtonIcon,
  buttonIconClasses,
} from "@/components/commons/button-icon/button-icon";
import type {
  PageBannerTone,
  PageBannerVariant,
} from "@/components/dashboard/page-banner/page-banner";
import { toneClasses as notificationToneClasses } from "@/components/dashboard/notification-bell/notification-bell";
import { PageBackButton } from "@/components/dashboard/page-back-button/page-back-button";
import { cn } from "@/lib/utils";
import type { PageBack } from "@/stores/ui-store";

export interface MobilePageHeaderProps {
  /** Sub-pages: replaces the menu button with a back arrow (see `usePageHeader`). */
  back?: PageBack;
  /** Rendered beside the settings link, e.g. the notification bell. */
  actions?: ReactNode;
  onOpenNavigation: () => void;
  showSettingsLink?: boolean;
  title: string;
  tone?: PageBannerTone;
  variant?: PageBannerVariant;
}

type ToneStyle = {
  container: Record<PageBannerVariant, string>;
  title: string;
  toggle: string;
};

const toneStyles: Record<PageBannerTone, ToneStyle> = {
  golden: {
    container: {
      solid: "bg-golden-harvest",
      soft: "border border-golden-harvest/40 bg-golden-harvest/18",
      outline: "border border-golden-harvest bg-transparent",
    },
    title: "text-nox-noir",
    toggle: "border-nox-noir/20 text-nox-noir hover:bg-nox-noir/10",
  },
  pink: {
    container: {
      solid: "bg-play-pink",
      soft: "border border-play-pink bg-play-pink/45",
      outline: "border border-play-pink bg-transparent",
    },
    title: "text-nox-noir",
    toggle: "border-nox-noir/20 text-nox-noir hover:bg-nox-noir/10",
  },
  teal: {
    container: {
      solid: "bg-play-teal",
      soft: "border border-play-teal bg-play-teal/35",
      outline: "border border-play-teal bg-transparent",
    },
    title: "text-nox-noir",
    toggle: "border-nox-noir/20 text-nox-noir hover:bg-nox-noir/10",
  },
  purple: {
    container: {
      solid: "bg-play-purple",
      soft: "border border-play-purple bg-play-purple/40",
      outline: "border border-play-purple bg-transparent",
    },
    title: "text-nox-noir",
    toggle: "border-nox-noir/20 text-nox-noir hover:bg-nox-noir/10",
  },
  blue: {
    container: {
      solid: "bg-play-blue",
      soft: "border border-play-blue bg-play-blue/35",
      outline: "border border-play-blue bg-transparent",
    },
    title: "text-nox-noir",
    toggle: "border-nox-noir/20 text-nox-noir hover:bg-nox-noir/10",
  },
  noir: {
    container: {
      solid: "bg-nox-noir",
      soft: "border border-nox-noir/15 bg-nox-noir/6",
      outline: "border border-nox-noir bg-transparent",
    },
    title:
      "text-white group-data-[variant=soft]:text-nox-noir group-data-[variant=outline]:text-nox-noir",
    toggle: "border-white/20 text-white hover:bg-white/10",
  },
  mist: {
    container: {
      solid: "bg-steel-mist",
      soft: "border border-steel-mist bg-base-200",
      outline: "border border-steel-mist bg-transparent",
    },
    title: "text-nox-noir",
    toggle: "border-white/25 text-white hover:bg-white/10",
  },
};

export const MobilePageHeader = ({
  actions,
  back,
  onOpenNavigation,
  showSettingsLink = false,
  title,
  tone = "golden",
  variant = "solid",
}: MobilePageHeaderProps) => {
  const style = toneStyles[tone];
  // Same treatment as the notification bell, so every header control's hover matches.
  const controlClassName =
    notificationToneClasses[tone === "noir" ? "dark" : "light"];
  const headerRef = useRef<HTMLElement>(null);

  // Publishes the header's height as `--mobile-page-header-height`, so a page
  // can pin its own bar (the My Documents tabs) right under this sticky header,
  // whatever its height on that page.
  useEffect(() => {
    const header = headerRef.current;
    if (!header || typeof ResizeObserver === "undefined") return;

    const root = document.documentElement;
    const observer = new ResizeObserver(([entry]) => {
      root.style.setProperty(
        "--mobile-page-header-height",
        `${Math.round(entry.borderBoxSize?.[0]?.blockSize ?? header.offsetHeight)}px`,
      );
    });
    observer.observe(header);

    return () => {
      observer.disconnect();
      root.style.removeProperty("--mobile-page-header-height");
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        "mobile-page-header shrink-0 sticky top-0 z-50 min-h-16 rounded-box p-2 px-4 shadow-[0_12px_30px_rgb(20_20_20/0.10)] lg:hidden",
        style.container[variant],
      )}
      data-variant={variant}
    >
      <div className="flex min-h-12 items-center gap-3">
        {/* On a sub-page the back arrow takes the menu's place, as in native apps. */}
        {back ? (
          <PageBackButton
            back={back}
            className={controlClassName}
          />
        ) : (
          <ButtonIcon
            aria-label="Open navigation"
            className={cn("size-9! min-h-9! shrink-0", controlClassName)}
            icon={
              <ListIcon
                aria-hidden
                size={15}
                weight="bold"
              />
            }
            onClick={onOpenNavigation}
            size="sm"
            variant="ghost"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center">
            <h1
              className={cn(
                "truncate font-title text-xl font-bold leading-tight",
                style.title,
              )}
            >
              {title}
            </h1>
          </div>
        </div>

        {actions}
        {showSettingsLink ? (
          <Link
            aria-label="Open settings"
            className={cn(
              "shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
              buttonIconClasses({
                className: cn("size-9! min-h-9!", controlClassName),
                size: "sm",
                variant: "ghost",
              }),
            )}
            href="/settings"
          >
            <UserIcon
              aria-hidden
              size={15}
              weight="bold"
            />
          </Link>
        ) : null}
      </div>
      <div
        className="mobile-page-header-controls mt-3 empty:hidden [&_.collection-toolbar_.input]:border-transparent! [&_.collection-toolbar_.input]:bg-white/45! [&_.collection-toolbar_.input]:text-nox-noir! [&_.collection-toolbar_.input::placeholder]:text-nox-noir/50! [&_.collection-toolbar_.input:focus]:border-nox-noir/25! [&_.collection-toolbar_.btn]:border-nox-noir/15! [&_.collection-toolbar_.btn]:bg-white/45! [&_.collection-toolbar_.btn]:text-nox-noir! [&_.collection-toolbar_.btn:hover]:border-nox-noir/25! [&_.collection-toolbar_.btn:hover]:bg-white/65!"
        id="mobile-page-header-controls"
      />
    </header>
  );
};

export default MobilePageHeader;
```

### `src/components/dashboard/page-banner/page-banner.tsx`
```tsx
"use client";

import type { ReactNode } from "react";

import { ListIcon, UserIcon } from "@phosphor-icons/react";
import Link from "next/link";

import {
  ButtonIcon,
  buttonIconClasses,
} from "@/components/commons/button-icon/button-icon";
import { toneClasses as notificationToneClasses } from "@/components/dashboard/notification-bell/notification-bell";
import { PageBackButton } from "@/components/dashboard/page-back-button/page-back-button";
import { cn } from "@/lib/utils";
import type { PageBack } from "@/stores/ui-store";

export type PageBannerTone =
  | "golden"
  | "noir"
  | "pink"
  | "teal"
  | "purple"
  | "blue"
  | "mist";
export type PageBannerVariant = "solid" | "soft" | "outline";

export type PageBannerProps = {
  /** Sub-pages: a back arrow before the title (see `usePageHeader`). */
  back?: PageBack;
  className?: string;
  footer?: ReactNode;
  onOpenNavigation?: () => void;
  /** Rendered beside the settings link, e.g. the notification bell. */
  actions?: ReactNode;
  showSettingsLink?: boolean;
  title: string;
  tone?: PageBannerTone;
  variant?: PageBannerVariant;
};

type ToneStyle = {
  container: Record<PageBannerVariant, string>;
  title: string;
  toggle: string;
};

const toneStyles: Record<PageBannerTone, ToneStyle> = {
  golden: {
    container: {
      solid: "bg-golden-harvest",
      soft: "border border-golden-harvest/40 bg-golden-harvest/18",
      outline: "border border-golden-harvest bg-transparent",
    },
    title: "text-nox-noir",
    toggle: "border-nox-noir/20 text-nox-noir hover:bg-nox-noir/10",
  },
  pink: {
    container: {
      solid: "bg-play-pink",
      soft: "border border-play-pink bg-play-pink/45",
      outline: "border border-play-pink bg-transparent",
    },
    title: "text-nox-noir",
    toggle: "border-nox-noir/20 text-nox-noir hover:bg-nox-noir/10",
  },
  teal: {
    container: {
      solid: "bg-play-teal",
      soft: "border border-play-teal bg-play-teal/35",
      outline: "border border-play-teal bg-transparent",
    },
    title: "text-nox-noir",
    toggle: "border-nox-noir/20 text-nox-noir hover:bg-nox-noir/10",
  },
  purple: {
    container: {
      solid: "bg-play-purple",
      soft: "border border-play-purple bg-play-purple/40",
      outline: "border border-play-purple bg-transparent",
    },
    title: "text-nox-noir",
    toggle: "border-nox-noir/20 text-nox-noir hover:bg-nox-noir/10",
  },
  blue: {
    container: {
      solid: "bg-play-blue",
      soft: "border border-play-blue bg-play-blue/35",
      outline: "border border-play-blue bg-transparent",
    },
    title: "text-nox-noir",
    toggle: "border-nox-noir/20 text-nox-noir hover:bg-nox-noir/10",
  },
  noir: {
    container: {
      solid: "bg-nox-noir",
      soft: "border border-nox-noir/15 bg-nox-noir/6",
      outline: "border border-nox-noir bg-transparent",
    },
    title:
      "text-white group-data-[variant=soft]:text-nox-noir group-data-[variant=outline]:text-nox-noir",
    toggle: "border-white/20 text-white hover:bg-white/10",
  },
  mist: {
    container: {
      solid: "bg-steel-mist",
      soft: "border border-steel-mist bg-base-200",
      outline: "border border-steel-mist bg-transparent",
    },
    title: "text-nox-noir",
    toggle: "border-white/25 text-white hover:bg-white/10",
  },
};

export const PageBanner = ({
  actions,
  back,
  className,
  footer,
  onOpenNavigation,
  showSettingsLink = false,
  title,
  tone = "golden",
  variant = "solid",
}: PageBannerProps) => {
  const style = toneStyles[tone];
  // Every top-bar control (menu, back, settings) wears exactly the
  // notification bell's treatment, so their hover states always match.
  const desktopControlClassName =
    notificationToneClasses[tone === "noir" ? "dark" : "light"];

  return (
    <section
      className={cn(
        "page-banner group relative flex shrink-0 flex-wrap items-center gap-4 rounded-box p-6 sm:p-8 lg:sticky lg:top-0 lg:z-40 lg:grid lg:min-h-20 lg:grid-cols-[minmax(0,1fr)_24rem_minmax(0,1fr)] lg:items-center lg:px-4 lg:py-4",
        style.container[variant],
        className,
      )}
      data-variant={variant}
    >
      {/* Sub-pages show only the back arrow: no menu button. */}
      {onOpenNavigation && !back ? (
        <ButtonIcon
          aria-label="Open navigation"
          className={cn("bg-transparent lg:hidden", style.toggle)}
          icon={
            <ListIcon
              aria-hidden
              size={18}
              weight="bold"
            />
          }
          onClick={onOpenNavigation}
          variant="ghost"
        />
      ) : null}

      <div className="flex min-w-0 items-center gap-3 lg:col-start-1 lg:row-start-1">
        {back ? (
          <PageBackButton
            back={back}
            className={desktopControlClassName}
          />
        ) : null}
        <h2 className={cn("truncate font-title text-2xl font-bold", style.title)}>
          {title}
        </h2>
      </div>

      <div
        className="hidden min-w-0 lg:col-start-2 lg:row-start-1 lg:block lg:w-full"
        id="page-header-controls"
      >
        {footer}
      </div>

      {actions || showSettingsLink ? (
        <div className="hidden items-center gap-2 lg:col-start-3 lg:row-start-1 lg:flex lg:justify-self-end">
          {actions}
          {showSettingsLink ? (
            <Link
              aria-label="Open settings"
              className={cn(
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
                buttonIconClasses({
                  className: cn("size-9! min-h-9!", desktopControlClassName),
                  size: "sm",
                  variant: "ghost",
                }),
              )}
              href="/settings"
            >
              <UserIcon
                aria-hidden
                size={15}
                weight="bold"
              />
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

export default PageBanner;
```

### `src/components/dashboard/content-container/content-container.tsx`
```tsx
import type { ReactNode, UIEventHandler } from "react";

export type ContentContainerProps = {
  children?: ReactNode;
  onScroll?: UIEventHandler<HTMLDivElement>;
};

/**
 * The page's only scroll area: everything below the shell's frame scrolls here,
 * never the document. `overscroll-y-contain` stops a scroll that reaches the
 * end from chaining to the page behind it (the "two scrolls" on phones).
 */
export const ContentContainer = ({
  children,
  onScroll,
}: ContentContainerProps) => {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-y-contain p-4 lg:p-6 [overflow-anchor:none]"
      data-testid="content-surface"
      onScroll={onScroll}
    >
      {children}
    </div>
  );
};
```
