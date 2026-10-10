/**
 * Query param telling the app shell that the user has just created their account,
 * so the onboarding tour should open on arrival.
 *
 * Carried on the post-sign-up redirect for the same reason as `?promo=`: the
 * Google flow is a server-side redirect with no client-side moment to flag a new
 * account in, so both flows use the URL and land on one code path.
 */
export const ONBOARDING_PARAM = "welcome";

export const ONBOARDING_VALUE = "1";

/** See `promo-status.ts`: `URL` needs a base to parse a relative path. Never part of the result. */
const RELATIVE_BASE = "http://relative.invalid";

/**
 * Marks a post-sign-up destination so the onboarding tour opens there.
 *
 * Parsed as a URL so an existing query string (`?promo=…`, `?templateId=…`) is
 * kept intact, and only the path, query and hash are returned, so the result can
 * never become an off-site redirect.
 *
 * @param destination - Path the new user is being sent to, e.g. `/dashboard`.
 * @returns The destination with `?welcome=1` merged in.
 */
export const withOnboarding = (destination: string): string => {
  const url = new URL(destination, RELATIVE_BASE);
  url.searchParams.set(ONBOARDING_PARAM, ONBOARDING_VALUE);

  return `${url.pathname}${url.search}${url.hash}`;
};

/**
 * Whether a query string asks for the onboarding tour.
 *
 * A display hint only: anyone can add `?welcome=1` by hand, and all it does is
 * open a tour they could open from the sidebar anyway.
 */
export const hasOnboardingFlag = (search: string): boolean =>
  new URLSearchParams(search).get(ONBOARDING_PARAM) === ONBOARDING_VALUE;

/**
 * Removes the flag from a URL, so a refresh or a shared link does not reopen the
 * tour.
 *
 * @param href - Full current URL.
 * @returns The same URL, relative, without `?welcome=`.
 */
export const withoutOnboarding = (href: string): string => {
  const url = new URL(href, RELATIVE_BASE);
  url.searchParams.delete(ONBOARDING_PARAM);

  return `${url.pathname}${url.search}${url.hash}`;
};
