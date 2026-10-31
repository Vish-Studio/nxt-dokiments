import { withSession } from "@/lib/api/with-session";
import {
  listSharedByMe,
  listSharedWithMe,
} from "@/lib/firebase/server-shared-documents";
import { assertDocumentSharingEnabled } from "@/lib/sharing/server-guard";

/**
 * `GET /api/documents/shared`
 *
 * Lists the documents shared with the caller, newest first. Recipients are
 * matched on their *verified* address, so an unverified account gets an empty
 * list. With `?by=me` it lists the documents the caller has shared with others
 * instead. Answers `404` while the `documentSharing` flag is off.
 *
 * @returns `{ documents: SharedDocument[] }` on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 */
export const GET = withSession(async (request, _context, session) => {
  assertDocumentSharingEnabled();

  const byMe = new URL(request.url).searchParams.get("by") === "me";
  const documents = byMe
    ? await listSharedByMe(session)
    : await listSharedWithMe(session);
  return Response.json({ documents });
});
