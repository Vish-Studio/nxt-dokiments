"use client";

import type { Icon } from "@phosphor-icons/react";
import { ListIcon } from "@phosphor-icons/react";
import Link from "next/link";

import { Avatar } from "@/components/commons/avatar/avatar";
import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import type {
  PageBannerTone,
  PageBannerVariant,
} from "@/components/dashboard/page-banner/page-banner";
import type { PageHeaderVisualVariant } from "@/components/dashboard/page-header-visual/page-header-visual";
import { PageHeaderVisual } from "@/components/dashboard/page-header-visual/page-header-visual";
import { cn } from "@/lib/utils";

export interface MobilePageHeaderProps {
  alignTitleWithNavigation?: boolean;
  description?: string;
  icon?: Icon;
  isCompact?: boolean;
  onOpenNavigation: () => void;
  showSettingsLink?: boolean;
  title: string;
  tone?: PageBannerTone;
  variant?: PageBannerVariant;
  visualVariant?: PageHeaderVisualVariant;
}

type ToneStyle = {
  container: Record<PageBannerVariant, string>;
  description: string;
  iconWrap: string;
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
    description: "text-nox-noir/75",
    iconWrap: "bg-nox-noir text-golden-harvest",
    title: "text-nox-noir",
    toggle: "border-nox-noir/20 text-nox-noir hover:bg-nox-noir/10",
  },
  pink: {
    container: {
      solid: "bg-play-pink",
      soft: "border border-play-pink bg-play-pink/45",
      outline: "border border-play-pink bg-transparent",
    },
    description: "text-nox-noir/70",
    iconWrap: "bg-nox-noir text-play-pink",
    title: "text-nox-noir",
    toggle: "border-nox-noir/20 text-nox-noir hover:bg-nox-noir/10",
  },
  teal: {
    container: {
      solid: "bg-play-teal",
      soft: "border border-play-teal bg-play-teal/35",
      outline: "border border-play-teal bg-transparent",
    },
    description: "text-nox-noir/70",
    iconWrap: "bg-nox-noir text-play-teal",
    title: "text-nox-noir",
    toggle: "border-nox-noir/20 text-nox-noir hover:bg-nox-noir/10",
  },
  purple: {
    container: {
      solid: "bg-play-purple",
      soft: "border border-play-purple bg-play-purple/40",
      outline: "border border-play-purple bg-transparent",
    },
    description: "text-nox-noir/70",
    iconWrap: "bg-nox-noir text-play-purple",
    title: "text-nox-noir",
    toggle: "border-nox-noir/20 text-nox-noir hover:bg-nox-noir/10",
  },
  blue: {
    container: {
      solid: "bg-play-blue",
      soft: "border border-play-blue bg-play-blue/35",
      outline: "border border-play-blue bg-transparent",
    },
    description: "text-nox-noir/70",
    iconWrap: "bg-nox-noir text-play-blue",
    title: "text-nox-noir",
    toggle: "border-nox-noir/20 text-nox-noir hover:bg-nox-noir/10",
  },
  noir: {
    container: {
      solid: "bg-nox-noir",
      soft: "border border-nox-noir/15 bg-nox-noir/6",
      outline: "border border-nox-noir bg-transparent",
    },
    description: "text-white/65",
    iconWrap: "bg-white/10 text-white",
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
    description: "text-nox-noir",
    iconWrap: "bg-nox-noir text-white",
    title: "text-nox-noir",
    toggle: "border-white/25 text-white hover:bg-white/10",
  },
};

export const MobilePageHeader = ({
  alignTitleWithNavigation = false,
  description,
  icon: HeaderIcon,
  isCompact = false,
  onOpenNavigation,
  showSettingsLink = false,
  title,
  tone = "golden",
  variant = "solid",
  visualVariant,
}: MobilePageHeaderProps) => {
  const style = toneStyles[tone];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 rounded-box transition-all duration-300 ease-out lg:hidden",
        style.container[variant],
        isCompact
          ? "min-h-16 p-2 px-4 shadow-[0_12px_30px_rgb(20_20_20/0.10)]"
          : "p-5",
      )}
      data-variant={variant}
    >
      <div
        className={cn(
          "flex gap-3",
          isCompact || alignTitleWithNavigation
            ? "min-h-12 items-center"
            : "items-start",
        )}
      >
        <ButtonIcon
          aria-label="Open navigation"
          className={cn(
            "shrink-0 border bg-transparent",
            isCompact && "!size-8 !min-h-8",
            style.toggle,
          )}
          icon={
            <ListIcon
              aria-hidden
              size={isCompact ? 16 : 18}
              weight="bold"
            />
          }
          onClick={onOpenNavigation}
          size="sm"
          variant="ghost"
        />

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-3">
            {HeaderIcon ? (
              <span
                className={cn(
                  "hidden lg:flex items-center justify-center rounded-box transition-all duration-300 ease-out",
                  style.iconWrap,
                  isCompact ? "size-0 opacity-0" : "size-11 opacity-100",
                )}
              >
                <HeaderIcon
                  aria-hidden
                  size={22}
                  weight="bold"
                />
              </span>
            ) : null}
            <h1
              className={cn(
                "truncate font-title font-bold text-nox-noir transition-all duration-300 ease-out",
                style.title,
                isCompact ? "text-xl leading-tight" : "text-2xl leading-tight",
              )}
            >
              {title}
            </h1>
          </div>

          {description && !isCompact ? (
            <p
              className={cn(
                "mt-2 max-w-md text-sm leading-6 text-nox-noir/60 transition-all duration-300 ease-out",
                style.description,
                variant !== "solid" && "text-nox-noir/65",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>

        {isCompact ? (
          showSettingsLink ? (
            <Link
              aria-label="Open settings"
              className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
              href="/settings"
            >
              <Avatar
                className="border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                name={null}
              />
            </Link>
          ) : null
        ) : visualVariant ? (
          <PageHeaderVisual
            className={cn(
              "transition-all duration-300 ease-out",
              "size-14 opacity-100 sm:size-16",
            )}
            variant={visualVariant}
          />
        ) : null}
      </div>
    </header>
  );
};
