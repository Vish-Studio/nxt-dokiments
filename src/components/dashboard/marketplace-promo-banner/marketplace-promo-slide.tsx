import {
  FilesIcon,
  GiftIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import type { ReactNode } from "react";

import { LinkButton } from "@/components/commons/link-button/link-button";

export type MarketplacePromoSlideIcon = "clients" | "offer" | "templates";

export interface MarketplacePromoSlideProps {
  actionHref: string;
  actionLabel: string;
  detail: string;
  eyebrow: string;
  icon: MarketplacePromoSlideIcon;
  imageSrc: string;
  promoCode?: string;
  title: string;
}

const slideIcons = {
  clients: <UsersThreeIcon aria-hidden size={20} weight="fill" />,
  offer: <GiftIcon aria-hidden size={20} weight="fill" />,
  templates: <FilesIcon aria-hidden size={20} weight="fill" />,
} satisfies Record<MarketplacePromoSlideIcon, ReactNode>;

export const MarketplacePromoSlide = ({
  actionHref,
  actionLabel,
  detail,
  eyebrow,
  icon,
  imageSrc,
  promoCode,
  title,
}: MarketplacePromoSlideProps) => {
  return (
    <article className="marketplace-promo-slide marketplace-promo-slide-enter relative flex h-full w-full shrink-0 overflow-hidden rounded-box border border-nox-noir bg-nox-noir text-base-100">
      <Image
        alt=""
        aria-hidden
        className="object-cover"
        fill
        priority={icon === "offer"}
        sizes="100vw"
        src={imageSrc}
        unoptimized
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-nox-noir/70"
      />

      <div className="relative z-10 flex w-full flex-col justify-between gap-8 p-5 sm:p-8 lg:p-10">
        <div className="max-w-2xl">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-field border border-play-teal bg-play-teal text-nox-noir">
              {slideIcons[icon]}
            </span>
            <p className="font-title text-xs font-bold uppercase tracking-widest text-play-teal">
              {eyebrow}
            </p>
          </div>

          <h2 className="mt-5 font-title text-3xl font-bold leading-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-base-100/75 sm:text-base">
            {detail}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {promoCode ? (
            <span className="rounded-field border border-base-100/30 bg-nox-noir px-3 py-2 font-title text-sm font-bold tracking-wide text-base-100">
              {promoCode}
            </span>
          ) : null}
          <LinkButton
            className="w-fit"
            href={actionHref}
            size="sm"
            variant="accent"
          >
            {actionLabel}
          </LinkButton>
        </div>
      </div>
    </article>
  );
};

export default MarketplacePromoSlide;
