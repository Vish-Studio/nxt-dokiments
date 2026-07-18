import "server-only";

import {
  getExpiry,
  refreshFirebaseToken,
  signInWithFirebase as signInWithFirebaseIdentity,
  signUpWithFirebase as signUpWithFirebaseIdentity,
  updateFirebaseDisplayName,
  updateFirebasePassword,
  type AuthRequest,
  type FirebaseAuthResponse,
} from "@/lib/firebase/server-identity";
import {
  getUserProfile,
  patchProfileFields,
  type ProfileUpdate,
} from "@/lib/firebase/server-user-profile";
import type { AuthSession } from "@/types/auth";

export { sendPasswordResetEmail } from "@/lib/firebase/server-identity";
export type { ProfileUpdate } from "@/lib/firebase/server-user-profile";

/**
 * Assembles a complete `AuthSession` from a Firebase Auth response.
 * Fetches (or creates) the user's Firestore profile to populate `session.user`.
 *
 * @param response - Raw response from a Firebase sign-up or sign-in call.
 * @returns A fully-populated `AuthSession`.
 */
const buildSession = async (
  response: FirebaseAuthResponse,
): Promise<AuthSession> => {
  const user = await getUserProfile({
    displayName: response.displayName,
    email: response.email,
    idToken: response.idToken,
    uid: response.localId,
  });

  return {
    expiresAt: getExpiry(response.expiresIn),
    idToken: response.idToken,
    refreshToken: response.refreshToken,
    user,
  };
};

/**
 * Creates a new Firebase account and returns a fully-populated `AuthSession`.
 *
 * @param request - New account's display name (optional), email, and password.
 * @returns A fully-populated `AuthSession` for the new account.
 * @throws When the email is already in use, the password is too weak, or sign-in is disabled.
 */
export const signUpWithFirebase = async (request: AuthRequest) =>
  buildSession(await signUpWithFirebaseIdentity(request));

/**
 * Signs in with email and password and returns a fully-populated `AuthSession`.
 *
 * @param request - Account email and password.
 * @returns A fully-populated `AuthSession` for the signed-in account.
 * @throws When credentials are invalid, the account is disabled, or too many attempts have been made.
 */
export const signInWithFirebase = async (request: AuthRequest) =>
  buildSession(await signInWithFirebaseIdentity(request));

/**
 * Updates the authenticated user's display name and optional profile fields,
 * then returns an updated `AuthSession` with fresh tokens if Firebase issued them.
 *
 * Two writes are performed in sequence:
 * 1. `accounts:update` — updates `displayName` on the Firebase Auth account.
 * 2. Firestore PATCH — updates extended profile fields on the user document.
 *
 * @param session - Current session; `idToken` is used to authorise both writes.
 * @param profile - New profile values to persist.
 * @returns An updated `AuthSession` reflecting the new profile values.
 * @throws When the `idToken` is invalid or the Firestore write fails.
 */
export const updateAccountProfile = async (
  session: AuthSession,
  profile: ProfileUpdate,
): Promise<AuthSession> => {
  const response = await updateFirebaseDisplayName(
    session.idToken,
    profile.displayName,
  );
  const idToken = response.idToken ?? session.idToken;

  await patchProfileFields(session.user.uid, idToken, profile);

  return {
    expiresAt: response.expiresIn
      ? getExpiry(response.expiresIn)
      : session.expiresAt,
    idToken,
    refreshToken: response.refreshToken ?? session.refreshToken,
    user: {
      ...session.user,
      address: profile.address,
      companyName: profile.companyName,
      displayName: profile.displayName,
      fullName: profile.fullName,
      phone: profile.phone,
      tel: profile.tel,
    },
  };
};

/**
 * Changes the password for the authenticated user and returns an updated `AuthSession`.
 * Firebase rotates the `idToken` and `refreshToken` on a password change.
 *
 * @param session - Current session; `idToken` is used to authorise the change.
 * @param password - New plaintext password (minimum 6 characters enforced by Firebase).
 * @returns An updated `AuthSession` with the rotated tokens.
 * @throws When the session is too old (Firebase requires re-authentication for sensitive operations).
 */
export const updateAccountPassword = async (
  session: AuthSession,
  password: string,
): Promise<AuthSession> => {
  const response = await updateFirebasePassword(session.idToken, password);

  return {
    expiresAt: response.expiresIn
      ? getExpiry(response.expiresIn)
      : session.expiresAt,
    idToken: response.idToken ?? session.idToken,
    refreshToken: response.refreshToken ?? session.refreshToken,
    user: session.user,
  };
};

/**
 * Exchanges a Firebase `refreshToken` for a new `idToken` and re-fetches the
 * user's Firestore profile to pick up any role changes that happened server-side.
 *
 * Called by `GET /api/auth/me` when `expiresAt` is within `REFRESH_SKEW_MS` of now.
 *
 * @param session - Session whose `idToken` is expiring; `refreshToken` is exchanged.
 * @returns An updated `AuthSession` with fresh tokens and profile.
 * @throws When the refresh token has been revoked or the Firebase request fails.
 */
export const refreshFirebaseSession = async (
  session: AuthSession,
): Promise<AuthSession> => {
  const response = await refreshFirebaseToken(session.refreshToken);

  const user = await getUserProfile({
    email: session.user.email,
    idToken: response.id_token,
    uid: response.user_id,
  });

  return {
    expiresAt: getExpiry(response.expires_in),
    idToken: response.id_token,
    refreshToken: response.refresh_token,
    user,
  };
};
