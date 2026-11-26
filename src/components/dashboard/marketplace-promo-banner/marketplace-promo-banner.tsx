"use client";

// A client component: the slides carry Phosphor icon components, which
// cannot be passed from a server component to the client carousel.
import {
  ClockIcon,
  CrownIcon,
  FilePdfIcon,
  GiftIcon,
  GraduationCapIcon,
  SignatureIcon,
} from "@phosphor-icons/react";

import { marketplaceTemplates, tierLocksDisabled } from "@/lib/market-place";
import { documentSharingEnabled } from "@/lib/sharing/feature-flag";

import { MarketplacePromoCarousel } from "./marketplace-promo-carousel";
import type { MarketplacePromoSlideProps } from "./marketplace-promo-slide";

// Counted from the catalog, so the banner's numbers are always true.
const templateCount = marketplaceTemplates.length;
const typeCount = new Set(marketplaceTemplates.map((t) => t.documentType)).size;
const styleCount = new Set(marketplaceTemplates.map((t) => t.style.id)).size;
const paidCount = marketplaceTemplates.filter((t) => t.tier !== "free").length;
const cvStyleCount = marketplaceTemplates.filter(
  (t) => t.documentType === "cv",
).length;

/**
 * Slide 1, the offer. While the launch unlock is on
 * (`NEXT_PUBLIC_DISABLE_TIER_LOCKS`), every template is free, so say so with
 * the real numbers. Otherwise it becomes an honest upgrade slide.
 */
const offerSlide: MarketplacePromoSlideProps = tierLocksDisabled
  ? {
      actionHref: "/marketplace#marketplace-template-sections",
      actionLabel: "Browse all templates",
      backgroundClassName: "bg-golden-harvest",
      detail: "Silver and Gold included. Save the ones your business reuses.",
      eyebrow: "Launch offer",
      eyebrowIcon: GiftIcon,
      imageSrc: "/images/marketplace/promo-templates.webp",
      points: [
        `${templateCount} templates`,
        `${typeCount} document types`,
        `${styleCount} design styles`,
      ],
      title: "Every template is free during launch.",
    }
  : {
      actionHref: "/subscription",
      actionLabel: "View plans",
      backgroundClassName: "bg-golden-harvest",
      detail: `Silver and Gold add ${paidCount} templates and unlimited saves.`,
      eyebrow: "Upgrade",
      eyebrowIcon: CrownIcon,
      imageSrc: "/images/marketplace/promo-templates.webp",
      points: [
        `${templateCount} templates`,
        "Unlimited saves",
        `${styleCount} design styles`,
      ],
      title: `Unlock all ${templateCount} templates.`,
    };

/** Slide 3: get it signed (sharing on), or a clean PDF (sharing off). */
const sendSlide: MarketplacePromoSlideProps = documentSharingEnabled
  ? {
      actionHref: "/my-documents",
      actionLabel: "Share a document",
      backgroundClassName: "bg-play-purple",
      detail: "Your client gets an email invite and signs right in Dokiments.",
      eyebrow: "Get it signed",
      eyebrowIcon: SignatureIcon,
      imageSrc: "/images/marketplace/promo-documents.webp",
      points: ["Email invite", "Signed status", "PDF any time"],
      title: "Send a link. Get it signed online.",
    }
  : {
      actionHref: "/my-templates",
      actionLabel: "Create a document",
      backgroundClassName: "bg-play-purple",
      detail: "Fill the form, preview it live, and download a print-ready PDF.",
      eyebrow: "Ready to send",
      eyebrowIcon: FilePdfIcon,
      imageSrc: "/images/marketplace/promo-documents.webp",
      points: ["Live preview", "Print-ready PDF", "Unlimited documents"],
      title: "A polished PDF in one click.",
    };

/**
 * The four Marketplace announcements, ordered by value to someone choosing a
 * template: the offer, saving time with clients, sending the document, then
 * CVs. Each has one action that names its outcome. Images are real app
 * screens composed by `npm run compose:banners`.
 */
const marketplacePromoSlides: MarketplacePromoSlideProps[] = [
  offerSlide,
  {
    actionHref: "/my-clients",
    actionLabel: "Add a client",
    backgroundClassName: "bg-play-blue",
    detail:
      "Their name, email and address fill every invoice, quote and contract.",
    eyebrow: "Save time",
    eyebrowIcon: ClockIcon,
    imageSrc: "/images/marketplace/promo-clients.webp",
    points: ["Prefilled details", "Grouped by company", "Every document type"],
    title: "Add a client once. Reuse them everywhere.",
  },
  sendSlide,
  {
    actionHref: "/marketplace?type=cv#marketplace-template-sections",
    actionLabel: "Browse CV templates",
    backgroundClassName: "bg-play-pink",
    detail:
      "Lead with studies, projects and part-time work, then download a PDF.",
    eyebrow: "For students",
    eyebrowIcon: GraduationCapIcon,
    imageSrc: "/images/marketplace/promo-cv.webp",
    points: [`${cvStyleCount} CV styles`, "Classic is free", "Clean PDF"],
    title: "Write a CV that gets you noticed.",
  },
];

/** Rotating Marketplace announcements displayed above the template catalog. */
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
