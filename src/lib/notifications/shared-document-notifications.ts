import { normaliseEmail } from "@/lib/sharing/email";
import type { SharedDocument } from "@/types/sharing";
import type { ServerNotification } from "@/lib/notifications/server-sources";

/** Where a shared-document notification sends the recipient. */
export const SHARED_TAB_HREF = "/my-documents?tab=shared";

/**
 * One notification per document shared with `email`.
 *
 * `createdAt` is the recipient's own `invitedAt`, which a re-share keeps, so
 * refreshing a share never notifies again. Shares the user has been removed from
 * (revoked) and shares that do not list them are skipped.
 */
export const sharedDocumentNotifications = (
  documents: SharedDocument[],
  email: string,
): ServerNotification[] => {
  const address = normaliseEmail(email);

  return documents.flatMap((document) => {
    const recipient = document.recipients.find(
      (candidate) => candidate.email === address,
    );

    if (!recipient || recipient.status === "revoked") {
      return [];
    }

    const sender = document.ownerName.trim() || document.ownerEmail;

    return [
      {
        action: { href: SHARED_TAB_HREF, label: "View shared documents" },
        body: document.values.title?.trim() || document.name,
        createdAt: recipient.invitedAt,
        id: `document-shared:${document.id}`,
        kind: "document-shared",
        title: `${sender} shared a document`,
      },
    ];
  });
};
