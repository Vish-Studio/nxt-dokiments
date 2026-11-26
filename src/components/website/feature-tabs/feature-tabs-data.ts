import { type AppScreen, appScreens } from "@/lib/website/app-screens";

export interface FeatureTabContent {
  /** Tone of the tab's call-to-action link, e.g. `bg-play-teal`. */
  accent: string;
  description: string;
  href: string;
  id: string;
  linkLabel: string;
  /** Background behind the screen. Defaults to `accent`. */
  panel?: string;
  /** The real app page shown for this tab. */
  screen: AppScreen;
  title: string;
  /** `dark` for a noir `panel`; see `FeatureTabVisual`. */
  tone?: "dark" | "light";
}

/**
 * The workspace tabs, in the same order as the app's sidebar (Dashboard, My
 * Documents with its CVs tab, My Templates, My Clients, Marketplace). Each
 * shows the real page in its own page tone; the screens are captured by
 * `npm run capture:marketing` and are not shared with the auth pages.
 */
export const featureTabs: FeatureTabContent[] = [
  {
    accent: "bg-golden-harvest",
    description:
      "Saved templates, recent documents, and your plan status all live on one home screen, so you always know where to pick up.",
    href: "/sign-up",
    id: "dashboard",
    linkLabel: "Create your free account",
    screen: appScreens.dashboard,
    title: "Start from a calm dashboard.",
  },
  {
    accent: "bg-play-purple",
    description:
      "Every document is grouped by the company it's for, with its type, amount and status at a glance. Fill the guided fields and watch it take shape, then export a PDF.",
    href: "/sign-up",
    id: "documents",
    linkLabel: "Create a document",
    screen: appScreens.documents,
    title: "Keep every document in order.",
  },
  {
    accent: "bg-play-amber",
    description:
      "Build a polished CV from guided sections for your experience, education, skills and languages. It lives in its own tab, apart from client work.",
    href: "/sign-up",
    id: "cvs",
    linkLabel: "Write your CV",
    panel: "bg-nox-noir",
    screen: appScreens.cv,
    title: "Write a CV that looks the part.",
    tone: "dark",
  },
  {
    accent: "bg-play-pink",
    description:
      "Save the templates you trust into your own library, so repeat work always starts from the right source.",
    href: "/sign-up",
    id: "templates",
    linkLabel: "Build your library",
    screen: appScreens.templates,
    title: "Keep the ones you reuse.",
  },
  {
    accent: "bg-play-blue",
    description:
      "Save each client's name, phone, email, address, and BRN once. Pick them while creating a document and their details fill in for you.",
    href: "/sign-up",
    id: "clients",
    linkLabel: "Add your clients",
    screen: appScreens.clients,
    title: "Prefill your clients in one click.",
  },
  {
    accent: "bg-play-teal",
    description:
      "From invoices and contracts to purchase orders and CVs, in a growing collection of styles. Preview any template before you commit to it.",
    href: "/marketplace",
    id: "marketplace",
    linkLabel: "Browse the marketplace",
    screen: appScreens.marketplace,
    title: "Find the right template fast.",
  },
];
