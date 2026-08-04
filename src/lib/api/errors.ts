import "server-only";

/**
 * An error with a status code and a message safe to return to the client.
 *
 * Route handlers throw this for expected failure cases (missing resource, invalid
 * input, tier limit reached, etc.) so `handleApiError` can turn it into the right
 * HTTP response without leaking internal details.
 *
 * The status should be an HTTP error code (typically 4xx or 5xx).
 *
 * @example
 * throw new ApiError(404, "Template not found.");
 *
 * @example
 * throw new ApiError(403, "Your plan does not allow this action.");
 */
export class ApiError extends Error {
  /** HTTP status code to respond with. */
  readonly status: number;

  /**
   * @param status - HTTP status code to respond with.
   * @param publicMessage - User-safe message sent verbatim in the response body.
   * Never pass raw provider/internal errors here (e.g. Firebase messages).
   */
  constructor(status: number, publicMessage: string) {
    super(publicMessage);
    this.status = status;
    this.name = "ApiError";
  }
}

/**
 * Converts a caught error into a `Response`.
 *
 * `ApiError`s are trusted and returned as-is (status + message). Anything else —
 * a raw Firestore/Firebase error, a bug, a network failure — is logged server-side
 * and collapsed into a generic `500`, so internal error details never reach the client.
 *
 * @example
 * try {
 *   // route logic
 * } catch (error) {
 *   return handleApiError(error);
 * }
 *
 * @param error - The value caught in a route handler's `catch` block.
 * @returns A `Response` suitable for returning directly from the route handler.
 */
export const handleApiError = (error: unknown): Response => {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  console.error(error);
  return Response.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
};
