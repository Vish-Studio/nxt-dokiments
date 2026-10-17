export type AuthShowcaseTone = "blue" | "golden" | "pink" | "purple" | "teal";

export interface AuthShowcaseSlideData {
  description: string;
  imageSrc: string;
  /** Square illustrations fill their frame; wide mockups sit inset on a white card. */
  layout: "framed" | "wide";
  step: string;
  title: string;
  tone: AuthShowcaseTone;
}

/** Each step mirrors a product area and reuses that area's page-banner tone. */
export const authShowcaseSlides: AuthShowcaseSlideData[] = [
  {
    description:
      "Browse invoices, contracts, quotations, and proposals by style and plan tier.",
    imageSrc: "/images/page-headers/marketplace.webp",
    layout: "framed",
    step: "Marketplace",
    title: "Find the right starting point",
    tone: "teal",
  },
  {
    description:
      "Save the layouts your business uses often and keep them ready in your library.",
    imageSrc: "/images/page-headers/templates.webp",
    layout: "framed",
    step: "Templates",
    title: "Save once, reuse forever",
    tone: "pink",
  },
  {
    description:
      "Fill structured fields and preview a polished document before you export.",
    imageSrc: "/images/page-headers/documents.webp",
    layout: "framed",
    step: "Documents",
    title: "From template to finished file",
    tone: "purple",
  },
  {
    description:
      "Clients, documents, and saved templates side by side in one focused workspace.",
    imageSrc: "/images/mockups/hero-laptop.jpg",
    layout: "wide",
    step: "Workspace",
    title: "Everything in one place",
    tone: "golden",
  },
  {
    description:
      "Start free, then unlock Modern and Minimal styles when your business grows.",
    imageSrc: "/images/page-headers/subscription.webp",
    layout: "framed",
    step: "Plans",
    title: "A plan that grows with you",
    tone: "blue",
  },
];

export const authShowcaseToneClasses: Record<AuthShowcaseTone, string> = {
  blue: "bg-play-blue",
  golden: "bg-golden-harvest",
  pink: "bg-play-pink",
  purple: "bg-play-purple",
  teal: "bg-play-teal",
};
