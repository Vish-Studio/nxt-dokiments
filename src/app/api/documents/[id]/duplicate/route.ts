import { z } from "zod";

import { ApiError } from "@/lib/api/errors";
import { parseBody } from "@/lib/api/validate";
import { withSession } from "@/lib/api/with-session";
import { duplicateDocument } from "@/lib/firebase/server-documents";

/** Same bounds as `POST /api/documents`, so a copy can't exceed what a new document may hold. */
const MAX_VALUE_KEYS = 50;
const MAX_VALUE_LENGTH = 20_000;

const DuplicateDocumentSchema = z.object({
  name: z.string().min(1).max(200),
  values: z
    .record(z.string(), z.string().max(MAX_VALUE_LENGTH))
    .refine((values) => Object.keys(values).length <= MAX_VALUE_KEYS, {
      message: `A document may have at most ${MAX_VALUE_KEYS} field values.`,
    }),
});

type Context = { params: Promise<{ id: string }> };

/**
 * `POST /api/documents/:id/duplicate`
 *
 * Creates an independent copy of one of the signed-in user's documents. The
 * body is the draft the user reviewed in the editor (`{ name, values }`); the
 * structure (`templateId` and `templateSnapshot`) is always copied from the
 * stored source, so a caller can never supply its own. The copy gets a new ID
 * and fresh timestamps, and does not inherit any sharing or signature state.
 * See `duplicateDocument`.
 *
 * Ownership is structural — the Firestore path is built from `session.user.uid`
 * — so another user's document is indistinguishable from a missing one.
 *
 * @returns `{ document: UserDocument }` with status `201` on success.
 * @returns `{ error: string }` with status `400` when the body is malformed or oversized.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `404` when the document doesn't exist,
 *   isn't owned by the user, or predates template snapshots and can't be copied.
 */
export const POST = withSession<Context>(async (request, context, session) => {
  const { id } = await context.params;
  const input = await parseBody(request, DuplicateDocumentSchema);

  const document = await duplicateDocument(session, id, input);
  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  return Response.json({ document }, { status: 201 });
});
