import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { SharedDocumentView } from "@/components/dashboard/shared-document-view/shared-document-view";
import { documentSharingEnabled } from "@/lib/sharing/feature-flag";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Shared document");

const SharedDocumentPage = async ({
  params,
}: PageProps<"/my-documents/shared/[id]">) => {
  if (!documentSharingEnabled) {
    notFound();
  }

  const { id } = await params;

  return (
    <AppShell
      activeItem="My Documents"
      description="Review and sign a document shared with you."
      title="Shared document"
    >
      <SharedDocumentView id={id} />
    </AppShell>
  );
};

export default SharedDocumentPage;
