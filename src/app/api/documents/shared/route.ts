import { withSession } from "@/lib/api/with-session";
import { listSharedWithMe } from "@/lib/firebase/server-shared-documents";
import { assertDocumentSharingEnabled } from "@/lib/sharing/server-guard";

/**
 * `GET /api/documents/shared`
 *
 * Lists the documents shared with the caller, newest first. Recipients are
 * matched on their *verified* address, so an unverified account gets an empty
 * list. Answers `404` while the `documentSharing` flag is off.
 *
 * @returns `{ documents: SharedDocument[] }` on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 */
export const GET = withSession(async (_request, _context, session) => {
  assertDocumentSharingEnabled();

  const documents = await listSharedWithMe(session);
  return Response.json({ documents });
});
