import { FREE_SAVED_TEMPLATE_LIMIT } from "@/lib/market-place";

export type OnboardingTone = "blue" | "golden" | "pink" | "purple" | "teal";

export interface OnboardingPoint {
  /** A short, bold label: what the user does or gets. */
  title: string;
  /** One plain sentence explaining it. */
  text: string;
}

export interface OnboardingStepData {
  /** Eyebrow above the title. */
  area: string;
  description: string;
  /** Opens the description with "Hi {first name}!" when the user's name is known. */
  greetsUser?: boolean;
  imageSrc: string;
  /**
   * How the image sits in its rounded container:
   * `hero` shows the wordmark above a transparent mockup that sits on the
   * container's bottom edge, `framed` fills a square card, and
   * `wide` insets a product screenshot on a white card.
   */
  layout: "framed" | "hero" | "wide";
  points: OnboardingPoint[];
  title: string;
  tone: OnboardingTone;
}

/**
 * A welcome, then the template system in the order a user meets it — Marketplace
 * → My Templates → Documents — followed by Clients and Plans. Each step reuses
 * its area's page tone and illustration.
 *
 * Copy rule: short sentences, the names of real buttons and pages, no jargon.
 */
export const onboardingSteps: OnboardingStepData[] = [
  {
    area: "Welcome",
    description:
      "Dokiments helps you create professional business documents, like invoices, quotations and contracts, in a few minutes.",
    greetsUser: true,
    imageSrc: "/images/mockups/marketplace/home-mockup.svg",
    layout: "hero",
    points: [
      { text: "Choose a ready-made design.", title: "Pick a template" },
      { text: "Add your business and client details.", title: "Fill it in" },
      { text: "Get a polished PDF, ready to send.", title: "Download" },
    ],
    title: "Welcome to Dokiments",
    tone: "golden",
  },
  {
    area: "Marketplace",
    description:
      "A template is a ready-made document design. The Marketplace is where you find them.",
    imageSrc: "/images/page-headers/marketplace.webp",
    layout: "framed",
    points: [
      {
        text: "Templates are grouped by style, from Classic to Minimalist.",
        title: "Browse",
      },
      {
        text: "Open any template to see it filled with example content.",
        title: "Preview",
      },
      {
        text: "Choose Save template to add it to your library.",
        title: "Save",
      },
    ],
    title: "Find templates in the Marketplace",
    tone: "teal",
  },
  {
    area: "My Templates",
    description:
      "Every template you save goes to My Templates, so it is always ready to use.",
    imageSrc: "/images/page-headers/templates.webp",
    layout: "framed",
    points: [
      {
        text: "One template can create as many documents as you need.",
        title: "Use it again and again",
      },
      {
        text: "Search and filter your saved templates by type and style.",
        title: "Find it fast",
      },
    ],
    title: "Your saved templates",
    tone: "pink",
  },
  {
    area: "My Documents",
    description:
      "A document is a copy of a template with your own details filled in.",
    imageSrc: "/images/page-headers/documents.webp",
    layout: "framed",
    points: [
      {
        text: "Go to My Documents, choose New document and pick a saved template.",
        title: "Start",
      },
      {
        text: "Type your details and watch the preview update as you go.",
        title: "Fill in",
      },
      {
        text: "Choose Download PDF when it looks right.",
        title: "Download",
      },
    ],
    title: "Create a document",
    tone: "purple",
  },
  {
    area: "My Clients",
    description:
      "Save the people and businesses you work with, so you never type their details twice.",
    imageSrc: "/images/mockups/hero-laptop.jpg",
    layout: "wide",
    points: [
      {
        text: "In My Clients, choose Add client and enter their details once.",
        title: "Add a client",
      },
      {
        text: "When you create a document, pick a client and their details are filled in for you.",
        title: "Fill documents faster",
      },
    ],
    title: "Keep your clients in one place",
    tone: "golden",
  },
  {
    area: "Plans",
    description:
      "You can start for free. A paid plan gives you more templates to work with.",
    imageSrc: "/images/page-headers/subscription.webp",
    layout: "framed",
    points: [
      {
        text: "Each template shows a Free, Silver or Gold badge for the plan it needs.",
        title: "Plan badges",
      },
      {
        text: `The free plan keeps ${FREE_SAVED_TEMPLATE_LIMIT} saved templates. Paid plans have no limit.`,
        title: "Saved templates",
      },
      {
        text: "See plans and upgrade any time from Subscription.",
        title: "Upgrade",
      },
    ],
    title: "Free to start",
    tone: "blue",
  },
];

export const onboardingToneClasses: Record<OnboardingTone, string> = {
  blue: "bg-play-blue",
  golden: "bg-golden-harvest",
  pink: "bg-play-pink",
  purple: "bg-play-purple",
  teal: "bg-play-teal",
};
