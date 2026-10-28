import { withSession } from "@/lib/api/with-session";
import { listShareRecipients } from "@/lib/firebase/server-shared-documents";
import { assertDocumentSharingEnabled } from "@/lib/sharing/server-guard";

/**
 * `GET /api/documents/share-recipients`
 *
 * Lists the people the caller has shared documents with before, most recently
 * shared first. The share dialog offers them as suggestions. Answers `404`
 * while the `documentSharing` flag is off.
 *
 * @returns `{ recipients: ShareLedgerEntry[] }` on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 */
export const GET = withSession(async (_request, _context, session) => {
  assertDocumentSharingEnabled();

  const recipients = await listShareRecipients(session);
  return Response.json({ recipients });
});
