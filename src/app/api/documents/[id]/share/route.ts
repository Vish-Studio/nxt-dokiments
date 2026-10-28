import { z } from "zod";

import { parseBody } from "@/lib/api/validate";
import { withSession } from "@/lib/api/with-session";
import { shareDocument } from "@/lib/firebase/server-shared-documents";
import { shareEmailSchema } from "@/lib/sharing/email-schema";
import { assertDocumentSharingEnabled } from "@/lib/sharing/server-guard";

type Context = { params: Promise<{ id: string }> };

const ShareDocumentSchema = z.object({
  email: shareEmailSchema,
});

/**
 * `POST /api/documents/:id/share`
 *
 * Shares one of the caller's documents with `email` for signature. Idempotent:
 * sharing again with the same address updates the shared copy (while it is
 * unlocked) instead of creating a second one. A document has one recipient for
 * now. Answers `404` while the `documentSharing` flag is off.
 *
 * @returns `{ sharedDocumentId, recipient: { email, status } }` with status `201`
 *   on the first share and `200` on a repeat.
 * @returns `{ error: string }` with status `400` for a malformed body or when
 *   sharing with yourself.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `403` when the plan's recipient limit is reached.
 * @returns `{ error: string }` with status `404` when the document is not found
 *   (or not owned), or sharing is off.
 * @returns `{ error: string }` with status `409` when the document is signed and
 *   locked, or is already shared with someone else.
 */
export const POST = withSession<Context>(async (request, context, session) => {
  assertDocumentSharingEnabled();

  const { id } = await context.params;
  const { email } = await parseBody(request, ShareDocumentSchema);
  const { created, recipient, sharedDocumentId } = await shareDocument(
    session,
    id,
    email,
  );

  return Response.json(
    {
      recipient: { email: recipient.email, status: recipient.status },
      sharedDocumentId,
    },
    { status: created ? 201 : 200 },
  );
});
