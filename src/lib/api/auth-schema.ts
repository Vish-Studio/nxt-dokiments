import "server-only";

import { z } from "zod";

import { promoCodeField } from "@/lib/api/promo-schema";
import { credentialFieldLimits, profileFieldLimits } from "@/types/auth";

/**
 * Zod schemas for the `/api/auth/*` routes that accept a JSON body.
 *
 * One module for all five rather than one per route: the family shares its fields —
 * `email` appears in three of them, a password in four, the promo code in two — and
 * a `route.ts` may only export HTTP handlers and route segment config, so no route
 * could share a schema by exporting it anyway. Same constraint `client-schema.ts`
 * and `profile-schema.ts` document.
 *
 * These five were the last routes in `src/app/api/**` still casting their bodies
 * (`(await request.json()) as …`). Firebase does reject a malformed email and a weak
 * password on its own, so for four of them what this adds is a clean, sanitized
 * `400` in place of an opaque provider error, plus the guarantee that a non-string
 * body never reaches a Firebase REST call. `sign-up` is the reason the module
 * exists: its `displayName` was written to both the Firebase Auth account and the
 * `users/{uid}` document with no length bound, and that name is later copied onto
 * records whose Firestore rules assert a ceiling on it (see
 * `MAX_STORED_DISPLAY_NAME` in `server-feedback.ts`).
 */

/**
 * An account email address.
 *
 * Trimmed *before* the format check, so an address pasted with a stray space is
 * accepted rather than handed to Firebase to refuse. Copied from `client-schema.ts`
 * rather than shared with it — one line, and the two describe different entities.
 */
const emailField = z.string().trim().email().max(credentialFieldLimits.email);

/**
 * A password being **verified** — sign-in and re-authentication.
 *
 * Deliberately unbounded. See `credentialFieldLimits.password`: a maximum on a
 * verify path would lock out the owner of an account whose password predates the
 * limit. `min(1)` is the whole rule, and it is here to reject a missing or
 * non-string field before the value reaches Firebase, not to judge the password.
 */
const existingPasswordField = z.string().min(1);

/**
 * A password being **set** — sign-up and `update-password`.
 *
 * Bounded, because no stored credential is at stake: whoever submits this is
 * choosing the password, so a ceiling can only ever change what they choose.
 *
 * No `min(6)`, even though Firebase requires six. Firebase's own `WEAK_PASSWORD`
 * response is mapped to "Use a stronger password with at least 6 characters."
 * (`mapFirebaseError`) and these routes return that text verbatim for the form to
 * render — strictly more useful to the user than the generic "Invalid request body."
 * a schema minimum would produce here.
 */
const newPasswordField = z.string().min(1).max(credentialFieldLimits.password);

/**
 * The optional promo code the sign-in and sign-up forms carry.
 *
 * Reuses `promoCodeField` — including its deliberate lack of `.trim()` — but not
 * `RedeemPromoSchema`'s `min(1)`: the promo input sits on both forms whether or not
 * the user has a code, so both always submit the field, usually empty.
 * `redeemPromoCodeAtAuth` already reads an empty or whitespace-only value as "no
 * code offered".
 *
 * This does put one boundary on "a promo code can never fail an authentication"
 * (`docs/firebase-auth.md`): a code past the ceiling now fails the *body*, so the
 * sign-in never happens. That is a malformed request rather than a rejected promo
 * code — the invariant is about redemption outcomes, and no browser can produce one
 * now that both inputs carry the ceiling as `maxLength` — and answering it with a
 * `400` is what every other route in `src/app/api/**` does.
 */
const optionalPromoCodeField = promoCodeField.optional();

/**
 * Credentials for `POST /api/auth/sign-up`.
 *
 * `displayName` is bounded by the same `profileFieldLimits.displayName` that
 * `ProfileSchema` applies, so the two paths that write a name to `users/{uid}` agree
 * on what fits. It is required here, unlike on the underlying `AuthRequest`, because
 * `SignUpForm` — the only caller — always collects one; the email-local-part fallback
 * in `getUserProfile` stays for the accounts that genuinely arrive without a name,
 * which are the Google ones, and they never come through this route.
 */
export const SignUpSchema = z.object({
  displayName: z.string().trim().min(1).max(profileFieldLimits.displayName),
  email: emailField,
  password: newPasswordField,
  promoCode: optionalPromoCodeField,
});

/** Credentials for `POST /api/auth/sign-in`. */
export const SignInSchema = z.object({
  email: emailField,
  password: existingPasswordField,
  promoCode: optionalPromoCodeField,
});

/** The new password for `POST /api/auth/update-password`. */
export const UpdatePasswordSchema = z.object({
  password: newPasswordField,
});

/**
 * The current password for `POST /api/auth/reauthenticate`.
 *
 * No email: that route always takes it from the session, so a signed-in user can
 * only ever re-authenticate as themselves. A body carrying one is stripped.
 */
export const ReauthenticateSchema = z.object({
  password: existingPasswordField,
});

/** The address to send a reset link to, for `POST /api/auth/forgot-password`. */
export const ForgotPasswordSchema = z.object({
  email: emailField,
});
