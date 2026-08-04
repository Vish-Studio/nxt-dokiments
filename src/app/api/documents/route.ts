import { z } from "zod";

import { ApiError } from "@/lib/api/errors";
import { parseBody, parseQuery } from "@/lib/api/validate";
import { withSession } from "@/lib/api/with-session";
import { createDocument, listDocuments } from "@/lib/firebase/server-documents";

/** Generous, not tight — this just stops a deliberately oversized Postman payload
 * from being written, not legitimate use. The largest template today has ~13 fields. */
const MAX_VALUE_KEYS = 50;
const MAX_VALUE_LENGTH = 20_000;

const ValuesSchema = z
  .record(z.string(), z.string().max(MAX_VALUE_LENGTH))
  .refine((values) => Object.keys(values).length <= MAX_VALUE_KEYS, {
    message: `A document may have at most ${MAX_VALUE_KEYS} field values.`,
  });

const ListDocumentsQuerySchema = z.object({
  templateId: z.string().min(1).optional(),
});

const CreateDocumentSchema = z.object({
  name: z.string().min(1).max(200),
  templateId: z.string().min(1),
  values: ValuesSchema,
});

/**
 * `GET /api/documents`
 *
 * Lists the signed-in user's documents, optionally filtered to those created
 * from a specific template.
 *
 * @returns `{ documents: UserDocument[] }` on success.
 * @returns `{ error: string }` with status `400` on an invalid `templateId` query param.
 * @returns `{ error: string }` with status `401` when no session is present.
 */
export const GET = withSession(async (request, _context, session) => {
  const url = new URL(request.url);
  const { templateId } = parseQuery(url.searchParams, ListDocumentsQuerySchema);

  const documents = await listDocuments(session, templateId);
  return Response.json({ documents });
});

/**
 * `POST /api/documents`
 *
 * Creates a new document from a template. The template's current `name`,
 * `style`, and `fields` are snapshotted onto the document at this moment —
 * see `TemplateSnapshot` — so later catalog edits or deactivation cannot
 * retroactively change or break it.
 *
 * @returns `{ document: UserDocument }` with status `201` on success.
 * @returns `{ error: string }` with status `400` when the request body is malformed
 *   (including an oversized `values` map).
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `404` when `templateId` does not resolve
 *   to an active template.
 */
export const POST = withSession(async (request, _context, session) => {
  const input = await parseBody(request, CreateDocumentSchema);

  const document = await createDocument(session, input);
  if (!document) {
    throw new ApiError(404, "Template not found.");
  }

  return Response.json({ document }, { status: 201 });
});
