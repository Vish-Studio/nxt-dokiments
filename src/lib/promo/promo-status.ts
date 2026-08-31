import { promoMessages } from "@/lib/promo/promo-codes";
import { promoStatuses, type PromoStatus } from "@/types/promo";

/**
 * Query param carrying a redemption outcome to the page the user lands on after
 * authenticating.
 *
 * A query param rather than the response body alone because the Google flow is a
 * server-side redirect: there is no client-side moment in it where a message could
 * be rendered. Using the same mechanism for the password flows keeps one code path
 * and one banner instead of two.
 */
export const PROMO_STATUS_PARAM = "promo";

/**
 * Narrows an untrusted `?promo=` value to a `PromoStatus`.
 *
 * Anything in a URL is user-editable, so this value is treated as a display hint
 * only: it decides which sentence a banner shows and nothing else. Whether a
 * redemption actually exists is answered by `GET /api/promo-redemptions`, which is
 * what the Settings card reads.
 */
export const isPromoStatus = (
  value: string | null | undefined,
): value is PromoStatus => promoStatuses.includes(value as PromoStatus);

/**
 * Base for parsing a relative destination. Arbitrary and never part of the result —
 * `URL` simply refuses to parse a relative path without one. Hard-coded rather than
 * read from `window.location` so this stays a pure string transform that can be
 * unit-tested outside a browser.
 */
const RELATIVE_BASE = "http://relative.invalid";

/**
 * Adds a redemption outcome to a post-authentication destination.
 *
 * Parsed as a URL rather than string-concatenated because `next` may already carry
 * a query string (`/documents?templateId=…`), where appending a second `?` would
 * corrupt it. Only the path, query and hash are returned, so the result is always
 * relative and cannot be turned into an off-site redirect.
 *
 * @param destination - Path the user is being sent to, e.g. `/dashboard`.
 * @param status - Outcome to report, or nothing when no code was submitted, in
 *   which case the destination is handed back untouched.
 * @returns The destination with `?promo=…` merged in when there is something to say.
 */
export const withPromoStatus = (
  destination: string,
  status?: PromoStatus | null,
): string => {
  if (!status) return destination;

  const url = new URL(destination, RELATIVE_BASE);
  url.searchParams.set(PROMO_STATUS_PARAM, status);

  return `${url.pathname}${url.search}${url.hash}`;
};

/** How a `PromoStatus` should be presented: the sentence, and whether it reads as good news. */
export const promoStatusFeedback = (
  status: PromoStatus,
): { message: string; tone: "error" | "success" } => {
  switch (status) {
    case "applied":
      return { message: promoMessages.applied, tone: "success" };
    case "already_redeemed":
      return { message: promoMessages.alreadyRedeemed, tone: "error" };
    case "failed":
      return { message: promoMessages.failed, tone: "error" };
    case "invalid":
      return { message: promoMessages.invalid, tone: "error" };
  }
};
