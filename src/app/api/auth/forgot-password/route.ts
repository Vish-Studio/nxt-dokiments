import { ForgotPasswordSchema } from "@/lib/api/auth-schema";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { parseBody } from "@/lib/api/validate";
import { sendPasswordResetEmail } from "@/lib/firebase/server-auth";
import { UpstreamUnavailableError } from "@/lib/http/fetch-upstream";

/**
 * `POST /api/auth/forgot-password`
 *
 * Triggers a Firebase password-reset email for the given address.
 * No authentication is required — this endpoint is intentionally public.
 *
 * Firebase resolves silently even when the address is not registered, so
 * the response does not reveal whether an account exists for that email.
 * `ForgotPasswordSchema` checks only the address's shape, which is public
 * knowledge — nothing it rejects distinguishes a registered address from an
 * unregistered one, so validating here cannot leak what the success path hides.
 *
 * @returns `{ ok: true }` on success.
 * @returns `{ error: string }` with status `400` when the request is malformed
 *   or Firebase rejects it (e.g. sign-in is disabled for the project).
 * @returns `{ error: string }` with status `503` when Firebase could not be reached.
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    const { email } = await parseBody(request, ForgotPasswordSchema);
    await sendPasswordResetEmail(email);
    return Response.json({ ok: true });
  } catch (error) {
    // A rejected body already carries a 400 and a sanitized message of its own. An
    // unreachable Firebase is a 503: no reset email was sent, and a 400 would
    // wrongly imply the address itself was the problem.
    if (
      error instanceof ApiError ||
      error instanceof UpstreamUnavailableError
    ) {
      return handleApiError(error);
    }

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
    return Response.json({ error: message }, { status: 400 });
  }
};
