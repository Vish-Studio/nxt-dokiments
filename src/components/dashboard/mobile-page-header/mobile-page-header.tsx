"use client";

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
import { cn } from "@/lib/utils";

export interface MobilePageHeaderProps {
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
  onOpenNavigation,
  showSettingsLink = false,
  title,
  tone = "golden",
  variant = "solid",
}: MobilePageHeaderProps) => {
  const style = toneStyles[tone];
  const controlClassName =
    tone === "noir"
      ? "border-none bg-white/10 text-white hover:bg-white/20"
      : "border-none bg-white/45 text-nox-noir hover:bg-white/65";

  return (
    <header
      className={cn(
        "mobile-page-header shrink-0 sticky top-0 z-50 min-h-16 rounded-box p-2 px-4 shadow-[0_12px_30px_rgb(20_20_20/0.10)] lg:hidden",
        style.container[variant],
      )}
      data-variant={variant}
    >
      <div className="flex min-h-12 items-center gap-3">
        <ButtonIcon
          aria-label="Open navigation"
          className={cn("!size-9 !min-h-9 shrink-0", controlClassName)}
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

        {showSettingsLink ? (
          <Link
            aria-label="Open settings"
            className={cn(
              "shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
              buttonIconClasses({
                className: cn("!size-9 !min-h-9", controlClassName),
                size: "sm",
                variant: "ghost",
              }),
            )}
            href="/settings"
          >
            <UserIcon aria-hidden size={15} weight="bold" />
          </Link>
        ) : null}
      </div>
      <div
        className="mobile-page-header-controls mt-3 empty:hidden [&_.collection-toolbar_.input]:!border-transparent [&_.collection-toolbar_.input]:!bg-white/45 [&_.collection-toolbar_.input]:!text-nox-noir [&_.collection-toolbar_.input::placeholder]:!text-nox-noir/50 [&_.collection-toolbar_.input:focus]:!border-nox-noir/25 [&_.collection-toolbar_.btn]:!border-nox-noir/15 [&_.collection-toolbar_.btn]:!bg-white/45 [&_.collection-toolbar_.btn]:!text-nox-noir [&_.collection-toolbar_.btn:hover]:!border-nox-noir/25 [&_.collection-toolbar_.btn:hover]:!bg-white/65"
        id="mobile-page-header-controls"
      />
    </header>
  );
};

export default MobilePageHeader;
