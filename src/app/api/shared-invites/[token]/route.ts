import { handleApiError } from "@/lib/api/errors";
import { getInviteByToken } from "@/lib/firebase/server-shared-invites";
import { assertDocumentSharingEnabled } from "@/lib/sharing/server-guard";

interface Context {
  params: Promise<{ token: string }>;
}

/**
 * `GET /api/shared-invites/:token`
 *
 * Public preview behind an invite link, so someone without an account can see
 * what was sent to them before signing up. The token is the credential: it is a
 * 256-bit random value, only its hash is stored, and nothing but the document
 * preview is returned. Never cached. Answers `404` while the `documentSharing`
 * flag is off.
 *
 * Unknown, deleted and malformed tokens are all `invalid`, so the response does
 * not reveal whether a token ever existed.
 *
 * @returns `{ state: "valid", invite }` with only the document name and the
 *   sender's name and address. The recipient's address
 *   is never included.
 * @returns `{ state: "expired" }` or `{ state: "invalid" }` with status `200`,
 *   so the page can show a tailored message.
 * @returns `{ error: string }` with status `404` when sharing is off.
 */
export const GET = async (_request: Request, context: Context) => {
  try {
    assertDocumentSharingEnabled();

    const { token } = await context.params;
    const lookup = await getInviteByToken(token);

    if (lookup.state !== "valid") {
      return Response.json(
        { state: lookup.state },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const { invite } = lookup;
    return Response.json(
      {
        invite: {
          name: invite.name,
          ownerEmail: invite.ownerEmail,
          ownerName: invite.ownerName,
        },
        state: "valid",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
};
