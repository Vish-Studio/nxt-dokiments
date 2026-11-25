import type { ServerNotification } from "@/lib/notifications/server-sources";
import { recipientSignatures } from "@/lib/sharing/signatures";
import type { SharedDocument } from "@/types/sharing";

/**
 * One notification per recipient signature on a document the user owns. The
 * owner's own sender signature is not a signing and never notifies.
 *
 * `createdAt` is the signature's own `signedAt`, which never changes once
 * written, so a signature notifies once. Documents owned by someone else are
 * skipped, so a recipient never sees the owner's notification.
 *
 * @param documents - Shared documents, typically the owner's own list.
 * @param ownerId - uid of the signed-in user; only their documents notify.
 */
export const signedDocumentNotifications = (
  documents: SharedDocument[],
  ownerId: string,
): ServerNotification[] =>
  documents
    .filter((document) => document.ownerId === ownerId)
    .flatMap((document) =>
      Object.entries(recipientSignatures(document)).map(
        ([signerUid, signature]) => ({
          action: {
            href: `/my-documents/shared/${document.id}`,
            label: "View shared copy",
          },
          body: document.values.title?.trim() || document.name,
          createdAt: signature.signedAt,
          id: `document-signed:${document.id}:${signerUid}`,
          kind: "document-signed",
          title: `${signature.email} signed a document`,
        }),
      ),
    );
