import {
  type MarketplacePromoSlideProps,
} from "./marketplace-promo-slide";
import { MarketplacePromoCarousel } from "./marketplace-promo-carousel";

const marketplacePromoSlides: MarketplacePromoSlideProps[] = [
  {
    actionHref: "/my-documents",
    actionLabel: "Explore Dokiments",
    backgroundClassName: "bg-golden-harvest",
    detail:
      "Create professional quotations, invoices, contracts and more with ready-to-go templates.",
    // eyebrow: "Dokiments",
    imageSrc: "/images/mockups/marketplace/home-mockup.svg",
    title: "Business documents, without the blank page.",
  },
  {
    actionHref: "/my-clients",
    actionLabel: "Explore client portal",
    backgroundClassName: "bg-play-blue",
    detail:
      "Manage client details in one place and keep them connected to the documents you create.",
    imageSrc: "/images/mockups/marketplace/home-mockup.svg",
    title: "Keep your clients organized.",
  },
  {
    actionHref: "/settings",
    actionLabel: "Redeem promo code",
    backgroundClassName: "bg-play-purple",
    detail:
      "Use the launch promo code in Settings to unlock our offer and get access to more templates.",
    imageSrc: "/images/marketplace/marketplace-promo-placeholder.png",
    title: "More templates. More possibilities.",
  },
  {
    actionHref: "/marketplace#marketplace-template-sections",
    actionLabel: "Get my templates",
    backgroundClassName: "bg-play-pink",
    detail:
      "Browse professionally designed templates and customise them to fit your business.",
    imageSrc: "/images/marketplace/marketplace-promo-placeholder.png",
    title: "Template made for your business.",
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
