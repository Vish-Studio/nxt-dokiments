import { withSession } from "@/lib/api/with-session";
import { getSharedDocument } from "@/lib/firebase/server-shared-documents";
import {
  assertDocumentSharingEnabled,
  shareApiError,
} from "@/lib/sharing/server-guard";

type Context = { params: Promise<{ id: string }> };

/**
 * `GET /api/documents/shared/:id`
 *
 * Fetches one shared document, for its owner or a recipient only. A document
 * that does not exist and one the caller may not see are indistinguishable:
 * both return `404`. Answers `404` while the `documentSharing` flag is off.
 *
 * @returns `{ document: SharedDocument }` on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `404` when not found or not accessible.
 */
export const GET = withSession<Context>(async (_request, context, session) => {
  assertDocumentSharingEnabled();

  const { id } = await context.params;
  const document = await getSharedDocument(session, id);

  if (!document) {
    throw shareApiError("NOT_A_RECIPIENT");
  }

  return Response.json({ document });
});
