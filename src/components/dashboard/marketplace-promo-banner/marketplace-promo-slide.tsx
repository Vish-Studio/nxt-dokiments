import Image from "next/image";

import { LinkButton } from "@/components/commons/link-button/link-button";
import { cn } from "@/lib/utils";

export interface MarketplacePromoSlideProps {
  actionHref: string;
  actionLabel: string;
  backgroundClassName: string;
  detail: string;
  eyebrow?: string;
  imageSrc: string;
  title: string;
}

export const MarketplacePromoSlide = ({
  actionHref,
  actionLabel,
  backgroundClassName,
  detail,
  eyebrow,
  imageSrc,
  title,
}: MarketplacePromoSlideProps) => {
  return (
    <article
      className={cn(
        "marketplace-promo-slide relative flex h-full w-full shrink-0 overflow-hidden rounded-3xl text-nox-noir",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "marketplace-promo-color-enter absolute inset-0",
          backgroundClassName,
        )}
      />
      <div aria-hidden className="absolute -left-48 top-0 size-96 opacity-10">
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
        className="marketplace-promo-visual-enter absolute inset-y-0 right-0 hidden w-1/2 overflow-hidden sm:block"
      >
        <Image
          alt=""
          className="marketplace-promo-mockup object-contain object-right-bottom"
          fill
          priority
          sizes="(max-width: 640px) 0vw, 50vw"
          src={imageSrc}
        />
      </div>

      <div className="relative z-10 flex w-full flex-col justify-center gap-6 p-5 sm:p-8 lg:p-10">
        <div className="max-w-xl">
          <div className="marketplace-promo-title-enter">
            {eyebrow ? (
              <p className="font-logo text-xl font-black text-nox-noir sm:text-2xl">
                {eyebrow}
              </p>
            ) : null}

            <h2 className="mt-4 font-title text-3xl font-bold leading-tight text-nox-noir sm:text-4xl">
              {title}
            </h2>
          </div>
          <p className="marketplace-promo-detail-enter mt-3 max-w-2xl text-base leading-7 text-nox-noir/70">
            {detail}
          </p>
        </div>

        <LinkButton
          className="marketplace-promo-action-enter w-fit"
          href={actionHref}
          size="md"
          variant="primary"
        >
          {actionLabel}
        </LinkButton>
      </div>
    </article>
  );
};

export default MarketplacePromoSlide;
