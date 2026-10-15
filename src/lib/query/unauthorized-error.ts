/**
 * Thrown by a query fetcher when the server answers `401`.
 *
 * The cache's global error handler recognises it as "the session is gone" and
 * signs the page out, instead of leaving it polling endpoints that can no longer
 * succeed.
 */
export class UnauthorizedError extends Error {
  constructor(message = "Unauthorised.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}
