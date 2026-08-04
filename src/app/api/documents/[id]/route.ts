import { z } from "zod";

import { ApiError } from "@/lib/api/errors";
import { parseBody } from "@/lib/api/validate";
import { withSession } from "@/lib/api/with-session";
import {
  deleteDocument,
  getDocument,
  updateDocument,
} from "@/lib/firebase/server-documents";

type Context = { params: Promise<{ id: string }> };

const MAX_VALUE_KEYS = 50;
const MAX_VALUE_LENGTH = 20_000;

const ValuesSchema = z
  .record(z.string(), z.string().max(MAX_VALUE_LENGTH))
  .refine((values) => Object.keys(values).length <= MAX_VALUE_KEYS, {
    message: `A document may have at most ${MAX_VALUE_KEYS} field values.`,
  });

const UpdateDocumentSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    values: ValuesSchema.optional(),
  })
  .refine((patch) => patch.name !== undefined || patch.values !== undefined, {
    message: "Provide at least one of name or values to update.",
  });

/**
 * `GET /api/documents/:id`
 *
 * Fetches a single document. Ownership is structural — the Firestore path is
 * built from `session.user.uid`, never from the request — so a document that
 * exists but belongs to another user is indistinguishable from one that
 * doesn't exist at all; both return `404`.
 *
 * @returns `{ document: UserDocument }` on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `404` when not found (or not owned).
 */
export const GET = withSession<Context>(async (_request, context, session) => {
  const { id } = await context.params;
  const document = await getDocument(session, id);

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  return Response.json({ document });
});

/**
 * `PATCH /api/documents/:id`
 *
 * Updates a document's `name` and/or `values`. Never touches `templateId` or
 * `templateSnapshot` — those are immutable after creation.
 *
 * @returns `{ document: UserDocument }` on success.
 * @returns `{ error: string }` with status `400` when the body is malformed, empty,
 *   or `values` exceeds the size bounds.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `404` when not found (or not owned).
 */
export const PATCH = withSession<Context>(async (request, context, session) => {
  const { id } = await context.params;
  const patch = await parseBody(request, UpdateDocumentSchema);

  const existing = await getDocument(session, id);
  if (!existing) {
    throw new ApiError(404, "Document not found.");
  }

  const document = await updateDocument(session, id, patch);
  return Response.json({ document });
});

/**
 * `DELETE /api/documents/:id`
 *
 * Deletes a document. Idempotent — deleting a document that doesn't exist
 * (or never belonged to this user) is not an error.
 *
 * @returns `204` with an empty body on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 */
export const DELETE = withSession<Context>(
  async (_request, context, session) => {
    const { id } = await context.params;
    await deleteDocument(session, id);
    return new Response(null, { status: 204 });
  },
);
