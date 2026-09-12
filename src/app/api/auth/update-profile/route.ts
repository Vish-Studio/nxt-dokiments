import { getIronSession } from "iron-session";

import { ApiError, handleApiError } from "@/lib/api/errors";
import { ProfileSchema } from "@/lib/api/profile-schema";
import { saveSession } from "@/lib/api/session-cookie";
import { parseBody } from "@/lib/api/validate";
import { updateAccountProfile } from "@/lib/firebase/server-auth";
import { UpstreamUnavailableError } from "@/lib/http/fetch-upstream";
import {
  isSessionExpired,
  sessionOptions,
  type SessionData,
} from "@/lib/session";

/**
 * `POST /api/auth/update-profile`
 *
 * Updates the authenticated user's display name on the Firebase Auth account
 * and their extended profile fields (address, company, etc.) on the Firestore
 * document. The session cookie is rewritten with any fresh tokens Firebase
 * issues, and the response body includes the updated `AuthUser` so the client
 * can refresh the Zustand store immediately without a separate `GET /api/auth/me`.
 *
 * The body is validated by `ProfileSchema` before either write. Bounded lengths
 * matter beyond rejecting junk: `displayName` is copied onto records elsewhere in
 * the app whose Firestore rules assert a ceiling on it, and an unbounded value
 * would have those writes refused rather than merely stored oddly.
 *
 * Note that every field is written on every call, so an omitted one is *cleared*.
 * See `ProfileSchema` for why that is safe today and what would have to change to
 * support partial updates.
 *
 * **Session handling is hand-rolled rather than using `withSession`, deliberately.**
 * The response has to exist before `saveSession` can attach its `Set-Cookie` to it,
 * and — more importantly — this route reports a Firebase rejection as a `400`
 * carrying Firebase's own message, which `ProfileSettings` renders in a banner.
 * `withSession` funnels anything that isn't an `ApiError` through `handleApiError`,
 * which would collapse those into a generic `500` and lose the actionable text.
 * `update-password` and `reauthenticate` are built the same way for the same
 * reasons; this is a deliberate family, not an oversight in one route.
 *
 * @returns `{ user: AuthUser }` on success.
 * @returns `{ error: string }` with status `400` when the body fails validation,
 *   or on a Firebase/Firestore error.
 * @returns `{ error: string }` with status `401` when no session is present.
 * @returns `{ error: string }` with status `503` when Firebase could not be reached.
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    const probeResponse = Response.json({ ok: true });
    const probeSession = await getIronSession<SessionData>(
      request,
      probeResponse,
      sessionOptions,
    );

    if (!probeSession.user || isSessionExpired(probeSession)) {
      return Response.json({ error: "Unauthorised." }, { status: 401 });
    }

    // Validated after the session check, so an unauthenticated caller learns
    // nothing about the expected body shape.
    const profile = await parseBody(request, ProfileSchema);
    const updated = await updateAccountProfile(probeSession, profile);

    const response = Response.json({ user: updated.user });
    await saveSession(request, response, {
      ...updated,
      absoluteExpiresAt: probeSession.absoluteExpiresAt,
    });

    return response;
  } catch (error) {
    // Both of these carry their own correct status: a rejected body is a 400 with a
    // sanitized message, and an unreachable Firebase is a 503 — nothing was saved,
    // and nothing was rejected either.
    if (
      error instanceof ApiError ||
      error instanceof UpstreamUnavailableError
    ) {
      return handleApiError(error);
    }

    // Everything left is Firebase refusing the write, whose message is worth
    // showing the user verbatim (see the note on `withSession` above).
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
    return Response.json({ error: message }, { status: 400 });
  }
};
