import type { Metadata } from "next";

import { LegalPage } from "@/components/website/legal-page/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use | Dokiments",
  description: "Terms governing access to and use of the Dokiments website and document workspace.",
};

const sections = [
  {
    title: "Using Dokiments",
    paragraphs: [
      "By accessing Dokiments, you agree to these Terms of Use. You must use the service lawfully, provide accurate account information, and protect your sign-in credentials.",
      "You are responsible for activity under your account and for the information entered into documents.",
    ],
  },
  {
    title: "Templates and generated documents",
    paragraphs: [
      "Templates and generated documents are provided as practical starting points. They are not legal, tax, accounting, employment, or other professional advice and may not meet the requirements of every transaction or jurisdiction.",
      "You are responsible for reviewing documents, confirming their accuracy, and obtaining professional advice where appropriate before relying on or sending them.",
    ],
  },
  {
    title: "Acceptable use",
    paragraphs: ["You must not misuse Dokiments or interfere with other users or service operation."],
    bullets: [
      "Do not upload or create unlawful, infringing, deceptive, harmful, or abusive content.",
      "Do not attempt unauthorised access, security testing, scraping, or service disruption.",
      "Do not use the service to impersonate others or misrepresent authority to enter an agreement.",
    ],
  },
  {
    title: "Ownership",
    paragraphs: [
      "You retain responsibility for content you enter into Dokiments. Dokiments and its licensors retain rights in the website, software, branding, template system, and original service content.",
      "You may use documents created for your own lawful business purposes, subject to these terms and any plan restrictions shown in the service.",
    ],
  },
  {
    title: "Availability and liability",
    paragraphs: [
      "We may update, suspend, or discontinue parts of the service. Dokiments is provided on an as-available basis to the extent permitted by law.",
      "To the extent permitted by law, Dokiments is not responsible for indirect or consequential loss, decisions made from template content, or loss caused by information you entered incorrectly or failed to preserve.",
    ],
  },
  {
    title: "Changes and contact",
    paragraphs: [
      "We may update these terms as the service changes. Continued use after an updated effective date means the revised terms apply, where permitted by law.",
      "Questions about these terms can be sent to legal@dokiments.com.",
    ],
  },
];

const TermsPage = () => (
  <LegalPage
    description="These terms explain the responsibilities that apply when you access the Dokiments website and document workspace."
    sections={sections}
    title="Terms of Use"
    updatedAt="22 June 2026"
  />
);

export default TermsPage;
