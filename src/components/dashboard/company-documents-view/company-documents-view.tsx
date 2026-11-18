"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { LoadingStatus } from "@/components/commons/loading-status/loading-status";
import { TemplatePreviewDialog } from "@/components/commons/template-preview-dialog/template-preview-dialog";
import { CompanyDetailsCard } from "@/components/dashboard/company-details-card/company-details-card";
import { CompanyHistoryList } from "@/components/dashboard/company-history-list/company-history-list";
import { CompanyOverviewCard } from "@/components/dashboard/company-overview-card/company-overview-card";
import { CompanyProfileHeader } from "@/components/dashboard/company-profile-header/company-profile-header";
import { DocumentExportDialog } from "@/components/dashboard/document-export-dialog/document-export-dialog";
import { useClientsQuery } from "@/hooks/queries/use-clients";
import { usePageHeader } from "@/hooks/use-page-header";
import { useDocumentsQuery } from "@/hooks/queries/use-documents";
import {
  useSharedByMeQuery,
  useSharedDocumentsQuery,
} from "@/hooks/queries/use-shared-documents";
import {
  buildCompanyEntries,
  groupEntriesByCompany,
} from "@/lib/documents/company-groups";
import { companyNewDocumentHref } from "@/lib/documents/company-page-href";
import { documentSharingEnabled } from "@/lib/sharing/feature-flag";
import type { Client } from "@/types/client";
import type { SharedDocument } from "@/types/sharing";
import {
  snapshotToMarketplaceTemplate,
  type UserDocument,
} from "@/types/template";

export interface CompanyDocumentsViewProps {
  /** The `CompanyDocumentGroup` key from the URL. */
  companyKey: string;
}

const EMPTY_DOCUMENTS: UserDocument[] = [];
const EMPTY_SHARED: SharedDocument[] = [];
const EMPTY_CLIENTS: Client[] = [];

const templateOf = (document: UserDocument) =>
  document.templateSnapshot
    ? snapshotToMarketplaceTemplate(
        document.templateSnapshot,
        document.templateId,
      )
    : null;

/**
 * `/my-documents/companies/[key]`: everything exchanged with one company.
 * Built from the dashboard's card style: an intro card (name, one sentence,
 * actions), then "Overview" and "Client details" cards on the left beside the
 * wider "Documents" card (both directions, with its own filters). Previews and PDF export open in place; Edit and New document hand
 * off to My Documents through its `?edit=` / `?new=` deep links.
 */
export const CompanyDocumentsView = ({
  companyKey,
}: CompanyDocumentsViewProps) => {
  const { data: documents = EMPTY_DOCUMENTS, isLoading } = useDocumentsQuery();
  const { data: sharedWithMe = EMPTY_SHARED } = useSharedDocumentsQuery({
    enabled: documentSharingEnabled,
  });
  const { data: sharedByMe = EMPTY_SHARED } = useSharedByMeQuery({
    enabled: documentSharingEnabled,
  });
  const { data: clients = EMPTY_CLIENTS } = useClientsQuery();
  const router = useRouter();
  const [previewDocument, setPreviewDocument] = useState<UserDocument | null>(
    null,
  );
  const [exportDocument, setExportDocument] = useState<UserDocument | null>(
    null,
  );

  const group = useMemo(
    () =>
      groupEntriesByCompany(
        buildCompanyEntries(
          documents,
          documentSharingEnabled ? sharedWithMe : [],
          sharedByMe,
        ),
        clients,
      ).find((candidate) => candidate.key === decodeURIComponent(companyKey)),
    [clients, companyKey, documents, sharedByMe, sharedWithMe],
  );

  // The top bar shows the company's name; the route supplies the back arrow.
  usePageHeader(group ? { title: group.name ?? "No client yet" } : null);

  if (isLoading) {
    return (
      <div className="company-documents-view flex flex-col gap-4 pt-6">
        <LoadingStatus message="Loading company…" />
        <div
          aria-hidden
          className="skeleton h-56 rounded-box"
        />
        <div
          aria-hidden
          className="skeleton h-96 rounded-box"
        />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="company-documents-view flex flex-col gap-4 pt-6">
        <div className="grid min-h-60 place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-10 text-center">
          <div>
            <p className="font-title text-base font-bold text-nox-noir">
              No documents for this company
            </p>
            <p className="mt-1 text-sm text-nox-noir/60">
              It may have been renamed, or its documents were deleted.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const newDocumentHref = companyNewDocumentHref(group);
  const previewTemplate = previewDocument ? templateOf(previewDocument) : null;

  return (
    <div className="company-documents-view flex flex-col gap-4 pt-6">
      <CompanyProfileHeader
        group={group}
        newDocumentHref={newDocumentHref}
      />

      {/* Same split as the dashboard: summary cards left, the main list right. */}
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid content-start gap-4">
          <CompanyOverviewCard group={group} />
          <CompanyDetailsCard
            client={group.client}
            name={group.name}
          />
        </div>
        {/* Desktop: the Documents card takes exactly the left column's height
            (never taller) and scrolls inside; min-h-96 keeps it usable when the
            left column is short. Phones: natural height, list capped. */}
        <div className="relative min-w-0 lg:min-h-96">
          <CompanyHistoryList
            className="lg:absolute lg:inset-0"
            companyName={group.name}
            entries={group.entries}
            onOpen={(entry) => {
              if (entry.document) setPreviewDocument(entry.document);
              else if (entry.shared)
                router.push(`/my-documents/shared/${entry.shared.id}`);
            }}
            onPrint={setExportDocument}
          />
        </div>
      </div>

      <TemplatePreviewDialog
        documentName={
          previewDocument?.values.title?.trim() || previewDocument?.name
        }
        mode="document"
        onClose={() => setPreviewDocument(null)}
        onPrint={
          previewDocument
            ? () => {
                setExportDocument(previewDocument);
                setPreviewDocument(null);
              }
            : undefined
        }
        template={previewTemplate}
        tone="purple"
        values={previewDocument?.values}
      />

      <DocumentExportDialog
        documentName={
          exportDocument?.values.title?.trim() ||
          exportDocument?.name ||
          "Document"
        }
        onClose={() => setExportDocument(null)}
        open={Boolean(exportDocument)}
        template={exportDocument ? templateOf(exportDocument) : null}
        values={exportDocument?.values}
      />
    </div>
  );
};

export default CompanyDocumentsView;
