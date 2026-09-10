"use client";

import type { ReactNode } from "react";

import { ListIcon } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { PageHeaderVisual } from "@/components/dashboard/page-header-visual/page-header-visual";
import type { PageHeaderVisualVariant } from "@/components/dashboard/page-header-visual/page-header-visual";
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
  description?: string;
  icon?: Icon;
  onOpenNavigation?: () => void;
  title: string;
  tone?: PageBannerTone;
  variant?: PageBannerVariant;
  visualVariant?: PageHeaderVisualVariant;
};

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
    title: "text-white group-data-[variant=soft]:text-nox-noir group-data-[variant=outline]:text-nox-noir",
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

export const PageBanner = ({
  className,
  footer,
  description,
  icon: BannerIcon,
  onOpenNavigation,
  title,
  tone = "golden",
  variant = "solid",
  visualVariant,
}: PageBannerProps) => {
  const style = toneStyles[tone];

  return (
    <section
      className={cn(
        "page-banner group flex shrink-0 flex-wrap items-start gap-4 rounded-box p-6 sm:p-8",
        style.container[variant],
        className,
      )}
      data-variant={variant}
    >
      {onOpenNavigation ? (
        <ButtonIcon
          aria-label="Open navigation"
          className={cn("border bg-transparent lg:hidden", style.toggle)}
          icon={<ListIcon aria-hidden size={18} weight="bold" />}
          onClick={onOpenNavigation}
          variant="ghost"
        />
      ) : null}

      {BannerIcon ? (
        <span
          className={cn(
            "hidden size-12 shrink-0 items-center justify-center rounded-box sm:flex",
            style.iconWrap,
          )}
        >
          <BannerIcon aria-hidden size={26} weight="bold" />
        </span>
      ) : null}

      <div className="min-w-0">
        <h2 className={cn("font-title text-2xl font-bold sm:text-3xl", style.title)}>{title}</h2>
        {description ? (
          <p
            className={cn(
              "mt-1 max-w-2xl text-sm leading-6",
              style.description,
              variant !== "solid" && "text-nox-noir/65",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {visualVariant ? (
        <PageHeaderVisual className="ml-auto hidden size-24 sm:block lg:size-28" variant={visualVariant} />
      ) : null}
      {footer ? <div className="w-full min-w-0 border-t border-current/10 pt-4">{footer}</div> : null}
    </section>
  );
};

export default PageBanner;
