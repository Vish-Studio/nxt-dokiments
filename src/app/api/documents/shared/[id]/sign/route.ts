import { after } from "next/server";
import { z } from "zod";

import { parseBody } from "@/lib/api/validate";
import { withSession } from "@/lib/api/with-session";
import { signSharedDocument } from "@/lib/firebase/server-shared-documents";
import { notifyDocumentSigned } from "@/lib/sharing/notify-document-signed";
import { assertDocumentSharingEnabled } from "@/lib/sharing/server-guard";
import { typedSignatureSchema } from "@/lib/sharing/signature-schema";

type Context = { params: Promise<{ id: string }> };

const SignDocumentSchema = z.object({
  signature: typedSignatureSchema,
});

/**
 * `POST /api/documents/shared/:id/sign`
 *
 * Signs a document shared with the caller and locks it; nobody can change it
 * afterwards. Only a recipient can sign. Answers `404` while the
 * `documentSharing` flag is off.
 *
 * Once signed, the owner is emailed in the background (`after()`), so a blocked
 * or failed email never changes the response.
 *
 * @returns `{ document: SharedDocument }` on success.
 * @returns `{ error: string }` with status `400` for a missing or over-long signature.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `404` when the document is not
 *   shared with the caller (or does not exist), or sharing is off.
 * @returns `{ error: string }` with status `409` when the document is already signed.
 */
export const POST = withSession<Context>(async (request, context, session) => {
  assertDocumentSharingEnabled();

  const { id } = await context.params;
  const { signature } = await parseBody(request, SignDocumentSchema);
  const document = await signSharedDocument(session, id, signature);

  after(() => notifyDocumentSigned(session, document));

  return Response.json({ document });
});
