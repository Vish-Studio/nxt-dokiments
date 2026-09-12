/** Supported account roles. New sign-ups always start on `"free"`; upgrades happen out-of-band (see docs/firebase-auth.md). */
export const userRoles = [
  "superadmin",
  "free",
  "silver",
  "gold",
  "special",
] as const;

export type UserRole = (typeof userRoles)[number];

/** How the account was originally created. Determines whether password-management UI applies. */
export const authProviders = ["password", "google"] as const;

export type AuthProviderId = (typeof authProviders)[number];

/**
 * Ceilings on the profile fields a user can edit, in characters.
 *
 * Enforced by `ProfileSchema` on `POST /api/auth/update-profile` and applied as
 * `maxLength` on the matching inputs in `ProfileSettings`. They live here — in a
 * module the client may import — precisely so those two agree: `profile-schema.ts`
 * is `server-only`, so a component cannot read the numbers the server enforces.
 *
 * The values deliberately match the equivalents in `src/lib/api/client-schema.ts`
 * (`MAX_NAME`, `MAX_ADDRESS`, `MAX_PHONE`). Both describe the same kinds of
 * hand-entered contact field, and a user editing their own details has no reason
 * to be held to a different limit than a client they enter. Kept as separate
 * declarations rather than shared because the two schemas describe different
 * entities; a third would be the moment to extract them.
 *
 * These are generous ceilings meant to stop an oversized payload from being
 * written, not to constrain legitimate use.
 */
export const profileFieldLimits = {
  address: 500,
  companyName: 200,
  displayName: 200,
  fullName: 200,
  phone: 50,
  tel: 50,
} as const;

export type AuthProfileDetails = {
  /** Mailing/street address. */
  address?: string;
  /** Employer or business name. */
  companyName?: string;
  /** Legal/full name, as distinct from the shorter `displayName`. */
  fullName?: string;
  /** Primary phone number. */
  phone?: string;
  /** Secondary/national-format telephone number. */
  tel?: string;
};

export type AuthUser = {
  /** Name shown throughout the app; defaults to the email's local part when unset. */
  displayName: string;
  email: string;
  /** How this account was originally created; set once at creation and never overwritten. */
  provider: AuthProviderId;
  role: UserRole;
  /** Firebase Auth UID; also the Firestore `users/{uid}` document ID. */
  uid: string;
  /** `true` when a Google sign-in has been auto-linked to this originally-password account. */
  linkedGoogle?: boolean;
} & AuthProfileDetails;

export type AuthSession = {
  /** Epoch-ms timestamp when `idToken` expires. */
  expiresAt: number;
  /** Firebase ID token (JWT) authorising subsequent Firebase Auth/Firestore requests. */
  idToken: string;
  /** Long-lived token exchanged for a fresh `idToken` once it expires. */
  refreshToken: string;
  user: AuthUser;
};
