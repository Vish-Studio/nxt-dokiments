import { UpdateClientSchema } from "@/lib/api/client-schema";
import { ApiError } from "@/lib/api/errors";
import { parseBody } from "@/lib/api/validate";
import { withSession } from "@/lib/api/with-session";
import { deleteClient, updateClient } from "@/lib/firebase/server-clients";

type Context = { params: Promise<{ clientId: string }> };

/**
 * `PATCH /api/clients/:clientId`
 *
 * Updates one or more of a client's details. Ownership is structural — the Firestore
 * path is built from `session.user.uid`, never from the URL — so a client that exists
 * but belongs to another user is indistinguishable from one that doesn't exist; both
 * return `404`.
 *
 * `PATCH` rather than `PUT` because updates are partial: correcting a phone number
 * shouldn't require resending every other field.
 *
 * @returns `{ client: Client }` on success.
 * @returns `{ error: string }` with status `400` when the body is empty or malformed.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `404` when not found (or not owned).
 */
export const PATCH = withSession<Context>(async (request, context, session) => {
  const { clientId } = await context.params;
  const patch = await parseBody(request, UpdateClientSchema);

  const client = await updateClient(session, clientId, patch);
  if (!client) {
    throw new ApiError(404, "Client not found.");
  }

  return Response.json({ client });
});

/**
 * `DELETE /api/clients/:clientId`
 *
 * Removes one client from the user's book. Idempotent — deleting a client that
 * doesn't exist (or never belonged to this user) is not an error, matching the same
 * choice made for `saved-templates` and `documents`.
 *
 * Documents already prepared for this client are unaffected — their recipient details
 * were copied into the document's own `values` at fill time, not held as a reference.
 *
 * @returns `204` with an empty body on success.
 * @returns `{ error: string }` with status `401` when no session is present.
 */
export const DELETE = withSession<Context>(
  async (_request, context, session) => {
    const { clientId } = await context.params;
    await deleteClient(session, clientId);
    return new Response(null, { status: 204 });
  },
);
