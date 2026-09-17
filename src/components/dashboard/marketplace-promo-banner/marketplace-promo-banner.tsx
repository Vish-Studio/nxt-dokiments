import { activePromoCode } from "@/lib/promo/promo-codes";

import {
  type MarketplacePromoSlideProps,
} from "./marketplace-promo-slide";
import { MarketplacePromoCarousel } from "./marketplace-promo-carousel";

const marketplacePromoSlides: MarketplacePromoSlideProps[] = [
  {
    actionHref: "/settings",
    actionLabel: "Apply offer",
    detail: `Use code ${activePromoCode.code} to unlock the launch offer, then choose a polished business document that fits your work.`,
    eyebrow: activePromoCode.label,
    icon: "offer",
    imageSrc:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&fm=webp&q=84&w=1800",
    promoCode: activePromoCode.code,
    title: "A sharper start for every document.",
  },
  {
    actionHref: "/my-clients",
    actionLabel: "Manage clients",
    detail:
      "Keep client details close to the proposals, contracts, and documents you create for them.",
    eyebrow: "New workspace tool",
    icon: "clients",
    imageSrc:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&fm=webp&q=84&w=1800",
    title: "Your clients, right where your work happens.",
  },
  {
    actionHref: "/marketplace#marketplace-template-sections",
    actionLabel: "Browse templates",
    detail:
      "More polished templates are on the way. Explore the growing library and find a dependable starting point today.",
    eyebrow: "Growing library",
    icon: "templates",
    imageSrc:
      "https://images.unsplash.com/photo-1752137666154-34d38ba92dd7?auto=format&fit=crop&fm=webp&q=84&w=1800",
    title: "More ways to make your work feel considered.",
  },
];

/** Rotating Marketplace updates displayed above the template catalog. */
export const MarketplacePromoBanner = () => {
  return (
    <section
      aria-label="Marketplace news"
      className="marketplace-promo-banner w-full shrink-0"
    >
      <MarketplacePromoCarousel slides={marketplacePromoSlides} />
    </section>
  );
};

export default MarketplacePromoBanner;
