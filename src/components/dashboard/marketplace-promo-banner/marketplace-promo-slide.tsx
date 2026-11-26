import { CheckCircleIcon } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import Image from "next/image";

import { LinkButton } from "@/components/commons/link-button/link-button";
import { iconSize } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface MarketplacePromoSlideProps {
  /** Where the one call to action goes. */
  actionHref: string;
  /** A verb that names the outcome ("Browse all templates", "Add a client"). */
  actionLabel: string;
  /** The slide's palette colour, e.g. `bg-golden-harvest`. */
  backgroundClassName: string;
  /** One short sentence (about 70 characters) under the title. */
  detail: string;
  /** A short label above the title saying what this is ("Launch offer"). */
  eyebrow: string;
  /** The label's icon. */
  eyebrowIcon: Icon;
  /** A composed app screen from `public/images/marketplace/`. */
  imageSrc: string;
  /** Up to three short, true proof points shown with checks ("60 templates"). */
  points?: string[];
  /** The benefit, in a few words. */
  title: string;
}

/**
 * One Marketplace announcement, built to convert: a label saying what it is,
 * a benefit-first title, one short sentence, up to three checked proof points
 * (once the banner itself is 56rem wide, `@4xl`, so they fit on one line
 * whatever the sidebar takes), then a single action. The copy keeps to a safe zone (the
 * left 58%); the composed app screen fills the right 52% from `sm` and bleeds
 * off the bottom-right corner under the copy on phones. Controls live outside
 * the card, in `MarketplacePromoCarousel`.
 */
export const MarketplacePromoSlide = ({
  actionHref,
  actionLabel,
  backgroundClassName,
  detail,
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  imageSrc,
  points = [],
  title,
}: MarketplacePromoSlideProps) => {
  return (
    <article
      className={cn(
        "marketplace-promo-slide @container relative flex h-full w-full shrink-0 overflow-hidden rounded-3xl text-nox-noir",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "marketplace-promo-color-enter absolute inset-0",
          backgroundClassName,
        )}
      />
      <div
        aria-hidden
        className="absolute -left-48 top-0 size-96 opacity-10"
      >
        <Image
          alt=""
          className="object-contain brightness-0"
          fill
          sizes="24rem"
          src="/images/svg/icon-vish-studio.svg"
        />
      </div>
      <div
        aria-hidden
        className="marketplace-promo-visual-enter absolute inset-y-0 right-0 hidden w-[52%] overflow-hidden sm:block"
      >
        <Image
          alt=""
          className="marketplace-promo-mockup object-contain object-right-bottom"
          fill
          priority
          sizes="(max-width: 639px) 1px, 50vw"
          src={imageSrc}
        />
      </div>

      {/* The copy's safe zone: the left 58% from `sm` up, centred vertically,
          on one spacing rhythm (16 / 12 / 16 / 24px). Phones stack the copy
          over the picture, which bleeds off the card's bottom-right corner. */}
      <div className="relative z-10 flex h-full w-full flex-col p-6 sm:w-[58%] sm:justify-center sm:p-10 lg:px-12">
        <div className="marketplace-promo-title-enter">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 font-title text-sm font-semibold text-nox-noir">
            <EyebrowIcon
              aria-hidden
              size={iconSize.control}
              weight="bold"
            />
            {eyebrow}
          </p>
          <h2 className="mt-4 max-w-[20ch] font-title text-[1.75rem] font-bold leading-[1.15] text-balance text-nox-noir sm:text-3xl @4xl:text-4xl @4xl:leading-[1.1]">
            {title}
          </h2>
        </div>
        <p className="marketplace-promo-detail-enter mt-3 max-w-md text-base leading-6 text-nox-noir/75">
          {detail}
        </p>
        {points.length > 0 ? (
          <ul className="marketplace-promo-detail-enter mt-4 hidden flex-wrap gap-x-5 gap-y-1 @4xl:flex">
            {points.map((point) => (
              <li
                className="flex items-center gap-1.5 font-title text-sm font-semibold text-nox-noir"
                key={point}
              >
                <CheckCircleIcon
                  aria-hidden
                  size={iconSize.control}
                  weight="fill"
                />
                {point}
              </li>
            ))}
          </ul>
        ) : null}

        <LinkButton
          className="marketplace-promo-action-enter mt-6 w-fit"
          href={actionHref}
          size="md"
          variant="primary"
        >
          {actionLabel}
        </LinkButton>

        <div
          aria-hidden
          className="marketplace-promo-visual-enter relative -mx-6 -mb-6 mt-6 min-h-48 flex-1 overflow-hidden sm:hidden"
        >
          <Image
            alt=""
            className="marketplace-promo-mockup object-contain object-right-bottom"
            fill
            sizes="(min-width: 640px) 1px, 100vw"
            src={imageSrc}
          />
        </div>
      </div>
    </article>
  );
};

export default MarketplacePromoSlide;
