import type { PromoCode } from "@/types/promo";

/**
 * The promo-code registry.
 *
 * Deliberately **not** `server-only`. A promo code is marketing copy shown
 * prominently on the public sign-in/sign-up pages — there is no secret here to
 * protect, so the same declaration serves the browser (display) and the Route
 * Handlers (matching). What must stay server-side is redemption *authority*: only
 * `POST /api/promo-redemptions` and the auth routes may write a redemption, and
 * `firestore.rules` enforces one-per-account independently of them.
 *
 * Adding a second campaign is one more entry. Expiry windows, usage caps, or a
 * benefit descriptor would become further fields here, checked in the redeem
 * route — no change to redemption records already written.
 */
export const promoCodes: PromoCode[] = [
  {
    code: "ViSHDOK2026!",
    description: "Use this code to unlock our launch offer on your account.",
    id: "launch-2026",
    label: "Launch Promo",
  },
];

/**
 * The campaign currently being advertised, used by the sign-in/sign-up callout
 * and the profile card. There is exactly one live campaign today; when that
 * stops being true this becomes a lookup and the call sites choose.
 */
export const activePromoCode: PromoCode = promoCodes[0];

/**
 * Reduces user input to its comparable form: all whitespace removed, then
 * upper-cased.
 *
 * **Case-insensitive by decision, not by accident.** A launch code is retyped
 * from screenshots, emails and word of mouth, and mobile keyboards auto-
 * capitalise — so rejecting `vishdok2026!` would fail legitimate users for no
 * gain. There is no security argument for case sensitivity either, because the
 * code is published on a public page by design; the boundary being defended is
 * redemption, not knowledge of the string.
 *
 * **All whitespace is stripped, not just the ends.** No registry code contains
 * whitespace, so removing it everywhere also rescues a code pasted with a line
 * wrap or a stray internal space. Zod trims the field first; this handles the rest.
 */
export const normalizePromoCode = (value: string): string =>
  value.replace(/\s+/g, "").toUpperCase();

/**
 * Resolves user input to a registry entry, or `undefined` when it matches none.
 *
 * The authoritative check. The client may call this only for cosmetic purposes —
 * every redemption re-runs it server-side, because a request body is untrusted
 * regardless of whether the caller is authenticated.
 *
 * @param value - Raw user input, e.g. `"  vishdok2026! "`.
 * @returns The matching `PromoCode`, whose `code` is the canonical string to store.
 */
export const findPromoCode = (value: string): PromoCode | undefined => {
  const normalized = normalizePromoCode(value);

  if (!normalized) return undefined;

  return promoCodes.find(
    (promo) => normalizePromoCode(promo.code) === normalized,
  );
};
