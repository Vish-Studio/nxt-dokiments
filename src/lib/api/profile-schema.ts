import "server-only";

import { z } from "zod";

import { profileFieldLimits } from "@/types/auth";

/**
 * Zod schema for `POST /api/auth/update-profile`.
 *
 * In its own module rather than inline in the `route.ts` because a `route.ts` may
 * only export HTTP handlers and route segment config, so a schema declared there
 * is unreachable from a test — the same constraint `client-schema.ts` and
 * `promo-schema.ts` document.
 *
 * This route previously cast its body (`(await request.json()) as ProfileUpdate`)
 * and wrote the result to both Firebase Auth and the `users/{uid}` Firestore
 * document unchecked, against the codebase's own stated convention that every
 * route validates its input before touching Firestore. Ceilings live in
 * `profileFieldLimits` so `ProfileSettings` can apply the same numbers as
 * `maxLength` — this module is `server-only` and a component cannot import it.
 */

/**
 * An optional free-text profile field: absent or empty both normalise to `""`.
 *
 * Copied from `client-schema.ts` rather than shared with it — one line, and the
 * two schemas describe different entities.
 */
const optionalText = (max: number) => z.string().trim().max(max).default("");

/**
 * A profile update, as `POST /api/auth/update-profile` accepts.
 *
 * **Whole-resource semantics, despite the `POST`.** `patchProfileFields` writes
 * all six fields on every call, so an omitted field is *cleared*, not left alone —
 * which is why the optional five carry `.default("")` rather than staying
 * `undefined`. That is pre-existing behaviour and safe today because the only
 * caller, `ProfileSettings`, always submits the complete form. A partial-update
 * caller would need `PATCH` semantics and a field mask, as `/api/clients` has.
 *
 * `displayName` requires only one character, not the two `ProfileSettings` asks
 * for. A profile created without one is seeded from the email's local part
 * (`getUserProfile`), so an account like `a@example.com` starts life with a
 * single-character name — a server minimum of two would make that profile
 * unsavable until the user noticed and renamed themselves. The two-character rule
 * is a client-side nudge; this is the correctness boundary.
 */
export const ProfileSchema = z.object({
  address: optionalText(profileFieldLimits.address),
  companyName: optionalText(profileFieldLimits.companyName),
  displayName: z.string().trim().min(1).max(profileFieldLimits.displayName),
  fullName: optionalText(profileFieldLimits.fullName),
  phone: optionalText(profileFieldLimits.phone),
  tel: optionalText(profileFieldLimits.tel),
});
