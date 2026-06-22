import type { Metadata } from "next";

import { LegalPage } from "@/components/website/legal-page/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | Dokiments",
  description: "How Dokiments collects, uses, stores, and protects personal information.",
};

const sections = [
  {
    title: "Information we collect",
    paragraphs: [
      "We collect information you provide when creating or using an account, including your name, email address, account role, saved templates, and the document content you choose to enter.",
      "We may also receive technical information needed to operate and secure the service, such as device, browser, authentication, and basic request information.",
    ],
  },
  {
    title: "How we use information",
    paragraphs: ["We use information only for legitimate service and business purposes."],
    bullets: [
      "Provide authentication, document creation, storage, previews, and account features.",
      "Maintain service reliability, prevent abuse, and protect accounts.",
      "Respond to support, privacy, and security requests.",
      "Meet legal obligations and enforce our Terms of Use.",
    ],
  },
  {
    title: "Storage and service providers",
    paragraphs: [
      "Dokiments uses browser storage for account sessions, consent preferences, and locally saved document data. Account and template information may also be processed through Firebase services used to operate authentication and cloud features.",
      "We do not sell personal information. We may share information with service providers acting on our behalf, or where disclosure is required by law, security, or the protection of users and the service.",
    ],
  },
  {
    title: "Retention and security",
    paragraphs: [
      "We retain information only for as long as needed to provide the service, meet legal requirements, resolve disputes, and maintain security. Browser-stored information remains until it expires, is replaced, or you clear it.",
      "We use reasonable technical and organisational safeguards, but no online service can guarantee absolute security.",
    ],
  },
  {
    title: "Your choices and rights",
    paragraphs: [
      "Depending on your location, you may have rights to access, correct, delete, restrict, or obtain a copy of personal information, and to object to or withdraw consent for certain processing.",
      "You can review cookie choices through Cookie settings in the footer. For account or privacy requests, contact privacy@dokiments.com.",
    ],
  },
  {
    title: "Updates and contact",
    paragraphs: [
      "We may update this policy as the service or legal requirements change. Material changes will be reflected by a revised date on this page.",
      "Questions about privacy can be sent to privacy@dokiments.com.",
    ],
  },
];

const PrivacyPage = () => (
  <LegalPage
    description="This policy explains what information Dokiments uses, why it is needed, and the choices available to you."
    sections={sections}
    title="Privacy Policy"
    updatedAt="22 June 2026"
  />
);

export default PrivacyPage;
