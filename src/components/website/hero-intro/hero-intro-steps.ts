import {
  AddressBook,
  FilePdf,
  Storefront,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

export interface HeroIntroStep {
  /** Page tone of the step's dashboard area; also the intro card's background while active. */
  accent: string;
  description: string;
  /** Phrase at the end of the headline that gets the white highlight. */
  highlight: string;
  icon: Icon;
  id: string;
  /** One-word label shown on the compact step tile; `title` stays as its accessible name. */
  label: string;
  /** Headline text before the highlight. */
  lead: string;
  title: string;
}

// The app's process in three plain steps. Step 1 keeps the brand golden (matching the dashboard
// welcome card); the next steps take their dashboard page tones: My Clients blue → My Documents purple.
export const heroIntroSteps: HeroIntroStep[] = [
  {
    accent: "bg-golden-harvest",
    description:
      "Start from a polished invoice, quotation, or contract in the marketplace, and save the ones you reuse.",
    highlight: "blank page.",
    icon: Storefront,
    id: "template",
    label: "Template",
    lead: "Business documents without the",
    title: "Pick a template",
  },
  {
    accent: "bg-play-blue",
    description:
      "Save your clients once. Pick one while creating a document and their name, email, and address fill in for you.",
    highlight: "filled in for you.",
    icon: AddressBook,
    id: "client",
    label: "Client",
    lead: "Your client's details,",
    title: "Add your client",
  },
  {
    accent: "bg-play-purple",
    description:
      "Watch the document take shape as you type, then export a clean PDF that's ready for your client.",
    highlight: "ready to send.",
    icon: FilePdf,
    id: "send",
    label: "Send PDF",
    lead: "A polished PDF,",
    title: "Send the PDF",
  },
];
