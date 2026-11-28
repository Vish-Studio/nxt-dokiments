import type { BannerSlide } from "@/lib/admin/marketplace-banner/banner-slide";
import { daysAgo } from "@/lib/admin/sample-data";

/**
 * Starting slides for the Marketplace banner admin: a copy of what the live
 * banner shows today (`marketplace-promo-banner.tsx`, launch-offer and
 * sharing-on variants), plus a scheduled slide and a draft, as data.
 *
 * The live banner does not read this yet. To connect it, store these slides in
 * `siteContent/marketplaceBanner` (read: signed in, write: superadmin), have
 * `MarketplacePromoBanner` read the live ones with this list as its fallback,
 * and replace `listSampleBannerSlides` with that read (and the store's actions
 * with writes). Keep the template counts computed from the catalog, never typed
 * in here.
 */
const slides: BannerSlide[] = [
  {
    actionHref: "/marketplace#marketplace-template-sections",
    actionLabel: "Browse all templates",
    detail: "Silver and Gold included. Save the ones your business reuses.",
    eyebrow: "Launch offer",
    iconKey: "gift",
    id: "launch-offer",
    imageSrc: "/images/marketplace/promo-templates.webp",
    points: ["All templates", "Every document type", "Every design style"],
    showFrom: "",
    showUntil: "",
    state: "published",
    title: "Every template is free during launch.",
    tone: "golden",
    updatedAt: daysAgo(7),
  },
  {
    actionHref: "/my-clients",
    actionLabel: "Add a client",
    detail: "Their name, email and address fill every invoice, quote and contract.",
    eyebrow: "Save time",
    iconKey: "clock",
    id: "save-time",
    imageSrc: "/images/marketplace/promo-clients.webp",
    points: ["Prefilled details", "Grouped by company", "Every document type"],
    showFrom: "",
    showUntil: "",
    state: "published",
    title: "Add a client once. Reuse them everywhere.",
    tone: "blue",
    updatedAt: daysAgo(7),
  },
  {
    actionHref: "/my-documents",
    actionLabel: "Share a document",
    detail: "Your client gets an email invite and signs right in Dokiments.",
    eyebrow: "Get it signed",
    iconKey: "signature",
    id: "get-it-signed",
    imageSrc: "/images/marketplace/promo-documents.webp",
    points: ["Email invite", "Signed status", "PDF any time"],
    showFrom: "",
    showUntil: "",
    state: "published",
    title: "Send a link. Get it signed online.",
    tone: "purple",
    updatedAt: daysAgo(7),
  },
  {
    actionHref: "/marketplace?type=cv#marketplace-template-sections",
    actionLabel: "Browse CV templates",
    detail: "Lead with studies, projects and part-time work, then download a PDF.",
    eyebrow: "For students",
    iconKey: "graduation-cap",
    id: "for-students",
    imageSrc: "/images/marketplace/promo-cv.webp",
    points: ["CV styles", "Classic is free", "Clean PDF"],
    showFrom: "",
    showUntil: "",
    state: "published",
    title: "Write a CV that gets you noticed.",
    tone: "pink",
    updatedAt: daysAgo(7),
  },
  {
    actionHref: "/marketplace#marketplace-template-sections",
    actionLabel: "Browse invoices",
    detail: "Annual invoice templates and receipt bundles for December.",
    eyebrow: "Year end",
    iconKey: "file-pdf",
    id: "year-end",
    imageSrc: "/images/marketplace/promo-documents.webp",
    points: ["Annual invoices", "Receipt bundles"],
    showFrom: "2099-12-15",
    showUntil: "2099-12-31",
    state: "published",
    title: "Close the year with tidy invoices.",
    tone: "teal",
    updatedAt: daysAgo(1),
  },
  {
    actionHref: "/marketplace?type=cv#marketplace-template-sections",
    actionLabel: "Browse CV templates",
    detail: "",
    eyebrow: "New",
    iconKey: "graduation-cap",
    id: "refresh-cv",
    imageSrc: "/images/marketplace/promo-cv.webp",
    points: ["Five new styles"],
    showFrom: "",
    showUntil: "",
    state: "draft",
    title: "Refresh your CV",
    tone: "purple",
    updatedAt: daysAgo(0, 2),
  },
];

/** Sample slides, in rotation order. Swap for a Firestore read when the banner is stored. */
export const listSampleBannerSlides = (): BannerSlide[] =>
  slides.map((slide) => ({ ...slide, points: [...slide.points] }));
