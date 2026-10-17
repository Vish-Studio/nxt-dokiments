export interface FeatureTabContent {
  /** Background token behind the visual, e.g. `bg-play-teal`. */
  accent: string;
  description: string;
  fit: "contain" | "cover";
  href: string;
  id: string;
  imageAlt: string;
  /** Omitted when the tab renders a coded mockup instead of an image. */
  imageSrc?: string;
  linkLabel: string;
  title: string;
}

export const featureTabs: FeatureTabContent[] = [
  {
    accent: "bg-golden-harvest",
    description:
      "Saved templates, recent documents, and your plan status all live on one home screen, so you always know where to pick up.",
    fit: "contain",
    href: "/sign-up",
    id: "dashboard",
    imageAlt: "Dokiments dashboard showing the workspace snapshot",
    imageSrc: "/images/mockups/hero-laptop-cutout.webp",
    linkLabel: "Create your free account",
    title: "Start from a calm dashboard.",
  },
  {
    accent: "bg-play-teal",
    description:
      "From invoices and contracts to purchase orders and meeting minutes, in a growing collection of styles. Preview any template before you commit to it.",
    fit: "cover",
    href: "/marketplace",
    id: "marketplace",
    imageAlt: "Four document templates laid out on a teal surface",
    imageSrc: "/images/page-headers/marketplace.webp",
    linkLabel: "Browse the marketplace",
    title: "Find the right template fast.",
  },
  {
    accent: "bg-play-pink",
    description:
      "Save the templates you trust into your own library, so repeat work always starts from the right source.",
    fit: "cover",
    href: "/sign-up",
    id: "templates",
    imageAlt: "A stack of saved document templates held with a paperclip",
    imageSrc: "/images/page-headers/templates.webp",
    linkLabel: "Build your library",
    title: "Keep the ones you reuse.",
  },
  {
    accent: "bg-play-blue",
    description:
      "Save each client's name, phone, email, address, and BRN once. Pick them while creating a document and their details fill in for you.",
    fit: "contain",
    href: "/sign-up",
    id: "clients",
    imageAlt: "A saved client card prefilling an invoice's recipient details",
    linkLabel: "Add your clients",
    title: "Prefill your clients in one click.",
  },
  {
    accent: "bg-play-purple",
    description:
      "Fill the guided fields, with your client already prefilled, and watch the finished document take shape beside the form. Export it as a PDF. No formatting, no blank page.",
    fit: "cover",
    href: "/sign-up",
    id: "documents",
    imageAlt: "A finished document with a pen resting on top",
    imageSrc: "/images/page-headers/documents.webp",
    linkLabel: "Create a document",
    title: "Turn a template into a document.",
  },
];
