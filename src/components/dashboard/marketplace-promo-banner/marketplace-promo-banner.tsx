import { GiftIcon } from "@phosphor-icons/react";
import Image from "next/image";

import { LinkButton } from "@/components/commons/link-button/link-button";
import { activePromoCode } from "@/lib/promo/promo-codes";

/** Launch campaign callout displayed above the marketplace catalog. */
export const MarketplacePromoBanner = () => {
  return (
    <section className="marketplace-promo-banner grid min-h-64 w-full shrink-0 overflow-hidden rounded-box border border-steel-mist bg-base-100 text-nox-noir lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="order-2 flex min-h-52 flex-col justify-between gap-5 p-5 sm:p-6 lg:order-1 lg:min-h-56 lg:p-8">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-field border border-golden-harvest bg-golden-harvest text-nox-noir">
            <GiftIcon
              aria-hidden
              size={20}
              weight="fill"
            />
          </span>
          <div className="min-w-0">
            <p className="font-title text-xs font-bold uppercase tracking-widest text-nox-noir/55">
              {activePromoCode.label}
            </p>
            <h2 className="mt-2 font-title text-2xl font-bold sm:text-3xl">
              Unlock your launch offer.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-nox-noir/65">
              Apply the code to your account and start from a polished business
              document, ready to adapt to your work.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-field border border-base-100/25 bg-base-100 px-3 py-2 font-title text-sm font-bold tracking-wide text-nox-noir">
            {activePromoCode.code}
          </span>
          <LinkButton
            href="/settings"
            size="sm"
            variant="accent"
          >
            Apply offer
          </LinkButton>
        </div>
      </div>

      <div className="relative order-1 min-h-32 overflow-hidden border-b border-steel-mist bg-nox-noir lg:order-2 lg:min-h-full lg:border-b-0 lg:border-l">
        <Image
          alt="Open notebook and handwritten documents on a workspace"
          className="object-cover"
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 18rem"
          src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&fm=webp&q=84&w=1200"
          unoptimized
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-nox-noir/20"
        />
        <p className="absolute bottom-3 left-3 rounded-field border border-base-100/35 bg-nox-noir/70 px-2 py-1 font-title text-xs font-bold uppercase tracking-widest text-base-100">
          Document workspace
        </p>
      </div>
    </section>
  );
};

export default MarketplacePromoBanner;
