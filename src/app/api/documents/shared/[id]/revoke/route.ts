import { withSession } from "@/lib/api/with-session";
import { revokeSharedDocument } from "@/lib/firebase/server-shared-documents";
import { assertDocumentSharingEnabled } from "@/lib/sharing/server-guard";

type Context = { params: Promise<{ id: string }> };

/**
 * `POST /api/documents/shared/:id/revoke`
 *
 * Takes the current recipient's access to a shared document away, before they
 * have signed. Only the owner can revoke. The recipient stays on the document as
 * `revoked` for the audit trail but can no longer read it, and the owner can
 * share it again afterwards. Answers `404` while the `documentSharing` flag is off.
 *
 * @returns `{ document: SharedDocument }` on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `404` when the document does not
 *   exist or is not the caller's, or sharing is off.
 * @returns `{ error: string }` with status `409` when the document is already
 *   signed and locked, or nobody currently has access.
 */
export const POST = withSession<Context>(async (_request, context, session) => {
  assertDocumentSharingEnabled();

  const { id } = await context.params;
  const document = await revokeSharedDocument(session, id);

  return Response.json({ document });
});
