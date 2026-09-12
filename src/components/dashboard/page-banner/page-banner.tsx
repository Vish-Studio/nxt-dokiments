"use client";

import type { ReactNode } from "react";

import { ListIcon, UserIcon } from "@phosphor-icons/react";
import Link from "next/link";

import {
  ButtonIcon,
  buttonIconClasses,
} from "@/components/commons/button-icon/button-icon";
import { cn } from "@/lib/utils";

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
  className?: string;
  footer?: ReactNode;
  onOpenNavigation?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
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
    title: "text-white group-data-[variant=soft]:text-nox-noir group-data-[variant=outline]:text-nox-noir",
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
  className,
  footer,
  isSidebarCollapsed = false,
  onOpenNavigation,
  onToggleSidebar,
  showSettingsLink = false,
  title,
  tone = "golden",
  variant = "solid",
}: PageBannerProps) => {
  const style = toneStyles[tone];
  const desktopControlClassName =
    tone === "noir"
      ? "bg-white/10 text-white hover:bg-white/20"
      : "border-none bg-white/45 text-nox-noir hover:bg-white/65";

  return (
    <section
      className={cn(
        "page-banner group relative flex shrink-0 flex-wrap items-center gap-4 rounded-box p-6 sm:p-8 lg:sticky lg:top-0 lg:z-40 lg:grid lg:min-h-20 lg:grid-cols-[minmax(0,1fr)_24rem_minmax(0,1fr)] lg:items-center lg:px-4 lg:py-4",
        style.container[variant],
        className,
      )}
      data-variant={variant}
    >
      {onOpenNavigation ? (
        <ButtonIcon
          aria-label="Open navigation"
          className={cn("bg-transparent lg:hidden", style.toggle)}
          icon={<ListIcon aria-hidden size={18} weight="bold" />}
          onClick={onOpenNavigation}
          variant="ghost"
        />
      ) : null}

      <div className="flex min-w-0 items-center gap-3 lg:col-start-1 lg:row-start-1">
        {onToggleSidebar ? (
          <ButtonIcon
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn("hidden !size-9 !min-h-9 lg:inline-flex", desktopControlClassName)}
            icon={<ListIcon aria-hidden size={15} weight="bold" />}
            onClick={onToggleSidebar}
            size="sm"
            variant="ghost"
          />
        ) : null}
        <h2 className={cn("font-title text-2xl font-bold", style.title)}>{title}</h2>
      </div>

      <div className="hidden min-w-0 lg:col-start-2 lg:row-start-1 lg:block lg:w-full" id="page-header-controls">
        {footer}
      </div>

      {showSettingsLink ? (
        <Link
          aria-label="Open settings"
          className={cn(
            "absolute right-8 top-1/2 hidden -translate-y-1/2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current lg:static lg:col-start-3 lg:row-start-1 lg:inline-flex lg:justify-self-end lg:translate-y-0",
            buttonIconClasses({
              className: cn("!size-9 !min-h-9", desktopControlClassName),
              size: "sm",
              variant: "ghost",
            }),
          )}
          href="/settings"
        >
          <UserIcon aria-hidden size={15} weight="bold" />
        </Link>
      ) : null}
    </section>
  );
};

export default PageBanner;
