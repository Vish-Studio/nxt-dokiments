import "server-only";

import {
  getFirestoreDocument,
  patchFirestoreDocument,
  readBoolean,
  readString,
  toBooleanValue,
  toStringValue,
  toTimestampValue,
  type FirestoreDocument,
  type FirestoreFields,
} from "@/lib/firebase/server-firestore";
import type {
  AuthProfileDetails,
  AuthProviderId,
  AuthUser,
  UserRole,
} from "@/types/auth";
import { userRoles } from "@/types/auth";

/**
 * Fields that can be updated on the authenticated user's profile.
 * `address`, `companyName`, `fullName`, `phone`, `tel` are inherited from `AuthProfileDetails`.
 */
export type ProfileUpdate = {
  /** New display name shown throughout the app. */
  displayName: string;
} & AuthProfileDetails;

/** Firestore document path for a user's profile document. */
const userProfilePath = (uid: string) => `users/${uid}`;

/** Narrows an arbitrary string to the `UserRole` union. */
const isUserRole = (role?: string): role is UserRole =>
  userRoles.includes(role as UserRole);

/** Returns `undefined` instead of an empty string for optional profile fields. */
const optionalString = (value?: string) => (value ? value : undefined);

/** Narrows an arbitrary string to the `AuthProviderId` union. */
const isAuthProvider = (provider?: string): provider is AuthProviderId =>
  provider === "password" || provider === "google";

/**
 * Deserialises a Firestore user document into an `AuthUser` object.
 * Falls back to the `fallbackEmail` prefix for `displayName` when the field is absent.
 * Falls back to `"free"` for `role` when the stored value is not a valid `UserRole`.
 * Falls back to `"password"` for `provider` when the field is absent or not a valid
 * `AuthProviderId` — true of every profile created before Google sign-in shipped.
 *
 * @param uid - Firebase Auth UID to attach to the resulting `AuthUser`.
 * @param fallbackEmail - Used for `email` and, if needed, `displayName` when the document lacks them.
 * @param document - Firestore document fetched from `users/{uid}`.
 */
const parseProfile = (
  uid: string,
  fallbackEmail: string,
  document: FirestoreDocument,
): AuthUser => {
  const fields = document.fields ?? {};
  const role = readString(fields.role);
  const provider = readString(fields.provider);

  return {
    address: optionalString(readString(fields.address)),
    companyName: optionalString(readString(fields.companyName)),
    displayName: readString(fields.displayName) ?? fallbackEmail.split("@")[0],
    email: readString(fields.email) ?? fallbackEmail,
    fullName: optionalString(readString(fields.fullName)),
    linkedGoogle: readBoolean(fields.linkedGoogle) ?? false,
    phone: optionalString(readString(fields.phone)),
    // Absent on every profile created before Google sign-in shipped — those are all password accounts.
    provider: isAuthProvider(provider) ? provider : "password",
    role: isUserRole(role) ? role : "free",
    tel: optionalString(readString(fields.tel)),
    uid,
  };
};

/**
 * Marks a password account as having auto-linked a Google identity — set once,
 * the first time a password account signs in via Google and Firebase resolves
 * it to the same `uid` (see `getUserProfile`). Purely informational; it only
 * powers a "Google is also connected" note in Settings and never gates access.
 *
 * @param uid - Firebase Auth UID identifying the profile document.
 * @param idToken - Firebase ID token authorising the write.
 */
const markGoogleLinked = (uid: string, idToken: string) =>
  patchFirestoreDocument(
    userProfilePath(uid),
    { linkedGoogle: toBooleanValue(true) },
    idToken,
    ["linkedGoogle"],
  );

/**
 * Creates a new Firestore profile document for a user.
 * All new accounts are assigned `role: "free"` regardless of the caller.
 * Role upgrades must happen via the Firebase console or a Cloud Function.
 *
 * @param params.uid - Firebase Auth UID; also used as the document ID.
 * @param params.idToken - Firebase ID token authorising the write.
 * @param params.displayName - Display name to seed on the new profile.
 * @param params.email - Email to seed on the new profile.
 * @param params.provider - Sign-up method to seed on the new profile; defaults to `"password"`.
 * @param params.role - Role to seed on the new profile; always `"free"` in practice (default).
 * @returns The newly created `AuthUser`.
 */
const createProfileDocument = async ({
  displayName,
  email,
  idToken,
  provider = "password",
  role = "free",
  uid,
}: AuthUser & { idToken: string }): Promise<AuthUser> => {
  const timestamp = toTimestampValue();

  const fields: FirestoreFields = {
    createdAt: timestamp,
    displayName: toStringValue(displayName),
    email: toStringValue(email),
    provider: toStringValue(provider),
    role: toStringValue(role),
    updatedAt: timestamp,
  };

  const document = await patchFirestoreDocument(
    userProfilePath(uid),
    fields,
    idToken,
  );
  return parseProfile(uid, email, document);
};

/**
 * Fetches the user's Firestore profile, creating it on first visit (404).
 *
 * For an existing profile, `provider` is only consulted to detect one case:
 * a Google sign-in resolving to an already-existing password account (Firebase
 * auto-linking by email). When that happens, the profile's stored `provider`
 * stays `"password"` — it's set once, at creation, and never overwritten — but
 * `linkedGoogle` is backfilled to `true` on that first linked sign-in. For every
 * other case (password sign-in to an existing profile, or the provider matches
 * what's already stored), `provider` has no effect on an existing document.
 *
 * @param params.uid - Firebase Auth UID.
 * @param params.idToken - Valid Firebase JWT for authorising the Firestore read.
 * @param params.email - Used as fallback display name and to seed a new profile.
 * @param params.displayName - Optional; used only when creating a new profile.
 * @param params.provider - How this sign-in authenticated. Seeds a new profile's
 *   `provider`; for an existing profile, only used to detect and backfill a
 *   Google auto-link (see above).
 * @returns The user's `AuthUser` profile — newly created, existing, or with
 *   `linkedGoogle` backfilled on a Google auto-link.
 * @throws When the Firestore request fails for any reason other than a 404.
 */
export const getUserProfile = async ({
  displayName,
  email,
  idToken,
  provider = "password",
  uid,
}: {
  displayName?: string;
  email: string;
  idToken: string;
  provider?: AuthProviderId;
  uid: string;
}): Promise<AuthUser> => {
  const document = await getFirestoreDocument(userProfilePath(uid), idToken);

  if (!document) {
    return createProfileDocument({
      displayName: displayName || email.split("@")[0],
      email,
      idToken,
      provider,
      role: "free",
      uid,
    });
  }

  const user = parseProfile(uid, email, document);

  if (
    provider === "google" &&
    user.provider === "password" &&
    !user.linkedGoogle
  ) {
    await markGoogleLinked(uid, idToken);
    return { ...user, linkedGoogle: true };
  }

  return user;
};

/**
 * Writes updated profile fields to the user's Firestore document using a field mask.
 * Only the listed fields are touched — other document fields (e.g. `role`) are preserved.
 *
 * @param uid - Firebase Auth UID identifying the profile document.
 * @param idToken - Firebase ID token authorising the write.
 * @param profile - New profile field values to persist.
 * @throws When the Firestore write fails.
 */
export const patchProfileFields = async (
  uid: string,
  idToken: string,
  profile: ProfileUpdate,
): Promise<void> => {
  const fields: FirestoreFields = {
    address: toStringValue(profile.address ?? ""),
    companyName: toStringValue(profile.companyName ?? ""),
    displayName: toStringValue(profile.displayName),
    fullName: toStringValue(profile.fullName ?? ""),
    phone: toStringValue(profile.phone ?? ""),
    tel: toStringValue(profile.tel ?? ""),
    updatedAt: toTimestampValue(),
  };

  await patchFirestoreDocument(
    userProfilePath(uid),
    fields,
    idToken,
    Object.keys(fields),
  );
};
