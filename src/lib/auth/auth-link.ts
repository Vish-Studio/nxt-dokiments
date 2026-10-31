/**
 * Builds a link between the sign-in and sign-up pages that keeps the visitor's
 * `next` destination, so switching between the two doesn't send them to the
 * dashboard instead of where they were going (for example, a document link from
 * an email).
 *
 * Only a same-origin path is kept. Anything else (a missing value, an absolute
 * URL, or a `//host` form) is dropped, so the link can't carry an open redirect.
 *
 * @param path - The page to link to, such as `/sign-up`.
 * @param next - The `next` query value of the current page, if any.
 * @returns `path`, with `?next=` appended when `next` is a safe path.
 *
 * @example
 * withNext("/sign-up", "/my-documents?tab=shared");
 * // "/sign-up?next=%2Fmy-documents%3Ftab%3Dshared"
 * withNext("/sign-up", "//evil.com"); // "/sign-up"
 */
export const withNext = (path: string, next?: string | null): string =>
  next && next.startsWith("/") && !next.startsWith("//")
    ? `${path}?next=${encodeURIComponent(next)}`
    : path;
