import { ClientSchema } from "@/lib/api/client-schema";
import { parseBody } from "@/lib/api/validate";
import { withSession } from "@/lib/api/with-session";
import { createClient, listClients } from "@/lib/firebase/server-clients";

/**
 * `GET /api/clients`
 *
 * Lists the signed-in user's clients, newest first. These are the contact details
 * the user reuses when preparing documents; they carry no tier or entitlement
 * meaning, so there is no plan gate and no count limit on this collection.
 *
 * @returns `{ clients: Client[] }` on success — an empty array for a user with none.
 * @returns `{ error: string }` with status `401` when no session is present.
 */
export const GET = withSession(async (_request, _context, session) => {
  const clients = await listClients(session);
  return Response.json({ clients });
});

/**
 * `POST /api/clients`
 *
 * Adds one client to the user's book. The Firestore path is built from
 * `session.user.uid`, so a client can only ever be created in the caller's own
 * subcollection regardless of what the request contains.
 *
 * @returns `{ client: Client }` with status `201` on success.
 * @returns `{ error: string }` with status `400` when the body is malformed — a
 *   missing required field, an invalid email, or a field over its length ceiling.
 * @returns `{ error: string }` with status `401` when no session is present.
 */
export const POST = withSession(async (request, _context, session) => {
  const input = await parseBody(request, ClientSchema);

  const client = await createClient(session, input);
  return Response.json({ client }, { status: 201 });
});
