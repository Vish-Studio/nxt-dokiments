import type { Metadata } from "next";

import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { CompanyDocumentsView } from "@/components/dashboard/company-documents-view/company-documents-view";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Company documents");

interface CompanyDocumentsPageProps {
  params: Promise<{ key: string }>;
}

/**
 * `/my-documents/companies/[key]`: one company's documents in both directions
 * and their history. `key` is a `CompanyDocumentGroup` key; the page resolves
 * it client-side from the cached documents, shares and clients.
 */
const CompanyDocumentsPage = async ({ params }: CompanyDocumentsPageProps) => {
  const { key } = await params;

  return (
    <AppShell
      activeItem="My Documents"
      back={{ href: "/my-documents", label: "Companies" }}
      description="Everything you've exchanged with this company, newest first."
      title="Company"
    >
      <CompanyDocumentsView companyKey={key} />
    </AppShell>
  );
};

export default CompanyDocumentsPage;
