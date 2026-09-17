import type { Metadata } from "next";

import { LegalPage } from "@/components/website/legal-page/legal-page";

export const metadata: Metadata = {
  title: "Cookie Policy | Dokiments",
  description:
    "How Dokiments uses cookies and browser storage, and how to manage your choices.",
};

const sections = [
  {
    title: "What cookies and browser storage are",
    paragraphs: [
      "Cookies are small text files stored by a website. Browser storage provides a similar way to remember settings and service data on your device. This policy covers both technologies.",
    ],
  },
  {
    title: "Necessary storage",
    paragraphs: [
      "Necessary storage supports security, authentication, service operation, document workflows, and your consent preference. It cannot be switched off through the consent banner because the requested service may not work correctly without it.",
    ],
    bullets: [
      "dokiments-cookie-consent-v1 remembers whether you accepted or rejected non-essential storage.",
      "dokiments-auth-session maintains the signed-in account session.",
      "dokiments-documents stores document data created in the current browser.",
      "Firebase authentication may use storage required to secure and maintain account access.",
    ],
  },
  {
    title: "Optional cookies",
    paragraphs: [
      "Optional storage is disabled by default. It is only used after you Accept all in the consent banner; choosing Reject non-essential keeps every item below switched off, and the scripts that set them are never downloaded.",
    ],
    bullets: [
      "Google Analytics and Microsoft Clarity help us understand how the service is used, which pages are visited, and where people get stuck.",
      "The Meta Pixel measures the results of our advertising on Facebook and Instagram, so we can see which campaigns lead to sign-ups. It sets a _fbp cookie in your browser and may read an fbclid value from links you arrive through, and it reports a small number of actions to Meta: creating an account, creating a document, and exporting a document.",
      "The Meta Pixel does not receive your name, email address, or any content from the documents you create.",
    ],
  },
  {
    title: "Managing your choice",
    paragraphs: [
      "On your first website visit, you can Accept all or Reject non-essential storage. Both choices are remembered on the device. Use Cookie settings in the footer at any time to review or replace your choice.",
      "You can also remove stored data through your browser settings. Clearing browser storage may sign you out, remove locally saved documents, and cause the consent banner to appear again.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      "Questions about cookies, browser storage, or consent choices can be sent to privacy@dokiments.com.",
    ],
  },
];

const CookiesPage = () => (
  <LegalPage
    description="This policy explains the storage Dokiments uses to operate the service and remember your privacy choices."
    sections={sections}
    title="Cookie Policy"
    updatedAt="16 September 2026"
  />
);

export default CookiesPage;
