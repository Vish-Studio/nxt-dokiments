import { ApiError } from "@/lib/api/errors";
import { withSession } from "@/lib/api/with-session";
import { acceptInvite } from "@/lib/firebase/server-shared-invites";
import { assertDocumentSharingEnabled } from "@/lib/sharing/server-guard";

interface Context {
  params: Promise<{ token: string }>;
}

/**
 * `POST /api/shared-invites/:token/accept`
 *
 * Links the signed-in account to the document behind an invite link. It works
 * only when the account's address is the one the invitation was sent to, which
 * together with the token proves the person owns that address even before they
 * verify it. Idempotent: accepting twice answers the same document. Answers
 * `404` while the `documentSharing` flag is off.
 *
 * @returns `{ sharedDocumentId: string }` on success.
 * @returns `{ error: string, invitedEmail: string }` with status `403` when the
 *   account is not the invited one. The address is masked.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `404` when the link is invalid.
 * @returns `{ error: string }` with status `410` when the link has expired.
 */
export const POST = withSession<Context>(async (_request, context, session) => {
  assertDocumentSharingEnabled();

  const { token } = await context.params;
  const result = await acceptInvite(session, token);

  switch (result.status) {
    case "linked":
      return Response.json({ sharedDocumentId: result.sharedDocumentId });
    case "mismatch":
      return Response.json(
        {
          error: "This invitation was sent to a different email address.",
          invitedEmail: result.invitedEmail,
        },
        { status: 403 },
      );
    case "expired":
      throw new ApiError(410, "This invitation has expired.");
    default:
      throw new ApiError(404, "This invitation is no longer valid.");
  }
});
