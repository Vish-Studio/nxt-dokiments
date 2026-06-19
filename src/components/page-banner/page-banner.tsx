"use client";

import { ListIcon } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

import { ButtonIcon } from "@/components/button-icon/button-icon";
import { cn } from "@/lib/utils";

export type PageBannerTone = "golden" | "bloodwood" | "noir" | "success";

export type PageBannerProps = {
  description?: string;
  icon?: Icon;
  onOpenNavigation?: () => void;
  title: string;
  tone?: PageBannerTone;
};

type ToneStyle = {
  container: string;
  description: string;
  iconWrap: string;
  title: string;
  toggle: string;
};

const toneStyles: Record<PageBannerTone, ToneStyle> = {
  golden: {
    container: "bg-golden-harvest",
    description: "text-bloodwood-deep/75",
    iconWrap: "bg-bloodwood-deep text-golden-harvest",
    title: "text-bloodwood-deep",
    toggle: "border-bloodwood-deep/20 text-bloodwood-deep hover:bg-bloodwood-deep/10",
  },
  bloodwood: {
    container: "bg-bloodwood-deep",
    description: "text-white/70",
    iconWrap: "bg-golden-harvest text-bloodwood-deep",
    title: "text-white",
    toggle: "border-white/20 text-white hover:bg-white/10",
  },
  noir: {
    container: "bg-nox-noir",
    description: "text-white/65",
    iconWrap: "bg-white/10 text-white",
    title: "text-white",
    toggle: "border-white/20 text-white hover:bg-white/10",
  },
  success: {
    container: "bg-success",
    description: "text-white/80",
    iconWrap: "bg-white/15 text-white",
    title: "text-white",
    toggle: "border-white/25 text-white hover:bg-white/10",
  },
};

export const PageBanner = ({
  description,
  icon: BannerIcon,
  onOpenNavigation,
  title,
  tone = "golden",
}: PageBannerProps) => {
  const style = toneStyles[tone];

  return (
    <section className={cn("flex items-start gap-4 rounded-box p-6 sm:p-8", style.container)}>
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
          <p className={cn("mt-1 max-w-2xl text-sm leading-6", style.description)}>{description}</p>
        ) : null}
      </div>
    </section>
  );
};
