import "server-only";

import {
  getFirestoreDocument,
  patchFirestoreDocument,
  readString,
  toStringValue,
  toTimestampValue,
  type FirestoreDocument,
  type FirestoreFields,
} from "@/lib/firebase/server-firestore";
import type { AuthProfileDetails, AuthUser, UserRole } from "@/types/auth";
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

/**
 * Deserialises a Firestore user document into an `AuthUser` object.
 * Falls back to the `fallbackEmail` prefix for `displayName` when the field is absent.
 * Falls back to `"free"` for `role` when the stored value is not a valid `UserRole`.
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

  return {
    address: optionalString(readString(fields.address)),
    companyName: optionalString(readString(fields.companyName)),
    displayName: readString(fields.displayName) ?? fallbackEmail.split("@")[0],
    email: readString(fields.email) ?? fallbackEmail,
    fullName: optionalString(readString(fields.fullName)),
    phone: optionalString(readString(fields.phone)),
    role: isUserRole(role) ? role : "free",
    tel: optionalString(readString(fields.tel)),
    uid,
  };
};

/**
 * Creates a new Firestore profile document for a user.
 * All new accounts are assigned `role: "free"` regardless of the caller.
 * Role upgrades must happen via the Firebase console or a Cloud Function.
 *
 * @param params.uid - Firebase Auth UID; also used as the document ID.
 * @param params.idToken - Firebase ID token authorising the write.
 * @param params.displayName - Display name to seed on the new profile.
 * @param params.email - Email to seed on the new profile.
 * @param params.role - Role to seed on the new profile; always `"free"` in practice (default).
 * @returns The newly created `AuthUser`.
 */
const createProfileDocument = async ({
  displayName,
  email,
  idToken,
  role = "free",
  uid,
}: AuthUser & { idToken: string }): Promise<AuthUser> => {
  const timestamp = toTimestampValue();

  const fields: FirestoreFields = {
    createdAt: timestamp,
    displayName: toStringValue(displayName),
    email: toStringValue(email),
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
 * @param params.uid - Firebase Auth UID.
 * @param params.idToken - Valid Firebase JWT for authorising the Firestore read.
 * @param params.email - Used as fallback display name and to seed a new profile.
 * @param params.displayName - Optional; used only when creating a new profile.
 * @throws When the Firestore request fails for any reason other than a 404.
 */
export const getUserProfile = async ({
  displayName,
  email,
  idToken,
  uid,
}: {
  displayName?: string;
  email: string;
  idToken: string;
  uid: string;
}): Promise<AuthUser> => {
  const document = await getFirestoreDocument(userProfilePath(uid), idToken);

  if (!document) {
    return createProfileDocument({
      displayName: displayName || email.split("@")[0],
      email,
      idToken,
      role: "free",
      uid,
    });
  }

  return parseProfile(uid, email, document);
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
