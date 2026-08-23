import { handleApiError } from "@/lib/api/errors";
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
 *
 * @returns `{ ok: true }` on success.
 * @returns `{ error: string }` with status `400` when the request is malformed
 *   or Firebase rejects it (e.g. sign-in is disabled for the project).
 * @returns `{ error: string }` with status `503` when Firebase could not be reached.
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    const { email } = (await request.json()) as { email: string };
    await sendPasswordResetEmail(email);
    return Response.json({ ok: true });
  } catch (error) {
    // Firebase was never reached, so no reset email was sent — a 400 would wrongly
    // imply the address itself was the problem.
    if (error instanceof UpstreamUnavailableError) {
      return handleApiError(error);
    }

    const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
    return Response.json({ error: message }, { status: 400 });
  }
};
