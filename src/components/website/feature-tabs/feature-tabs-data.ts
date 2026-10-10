export interface FeatureTabContent {
  /** Background token behind the visual, e.g. `bg-play-teal`. */
  accent: string;
  description: string;
  fit: "contain" | "cover";
  href: string;
  id: string;
  imageAlt: string;
  imageSrc: string;
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
    accent: "bg-play-purple",
    description:
      "Fill the guided fields and watch the finished document take shape beside the form, then export it as a PDF. No formatting, no blank page.",
    fit: "cover",
    href: "/sign-up",
    id: "documents",
    imageAlt: "A finished document with a pen resting on top",
    imageSrc: "/images/page-headers/documents.webp",
    linkLabel: "Create a document",
    title: "Turn a template into a document.",
  },
];
