import "server-only";

import { hasServerFirebaseConfig, serverFirebaseConfig } from "@/lib/firebase/server-config";
import type { AuthProfileDetails, AuthSession, AuthUser, UserRole } from "@/types/auth";
import { userRoles } from "@/types/auth";

/** Shape returned by Firebase Identity Toolkit sign-in and sign-up endpoints. */
type FirebaseAuthResponse = {
  displayName?: string;
  email: string;
  expiresIn: string;
  idToken: string;
  localId: string;
  refreshToken: string;
};

/** Shape returned by the Firebase Secure Token Service refresh endpoint. */
type FirebaseRefreshResponse = {
  expires_in: string;
  id_token: string;
  refresh_token: string;
  user_id: string;
};

/** Scalar Firestore REST field value used when reading and writing user documents. */
type FirestoreValue = {
  stringValue?: string;
  timestampValue?: string;
};

/** Minimal shape of a Firestore document REST response. */
type FirestoreDocument = {
  fields?: Record<string, FirestoreValue>;
};

/** Credentials payload for sign-in and sign-up requests. */
type AuthRequest = {
  displayName?: string;
  email: string;
  password: string;
};

/** Fields that can be updated on the authenticated user's profile. */
export type ProfileUpdate = {
  displayName: string;
} & AuthProfileDetails;

/** Firebase Identity Toolkit base URL. */
const AUTH_BASE_URL = "https://identitytoolkit.googleapis.com/v1";
/** Firebase Secure Token Service base URL (used for token refresh). */
const TOKEN_BASE_URL = "https://securetoken.googleapis.com/v1";

/**
 * Throws if the required Firebase env vars are absent.
 * Called before every URL builder so callers receive a clear error rather than
 * an opaque 400/401 from the Firebase API.
 */
const ensureFirebaseConfig = () => {
  if (!hasServerFirebaseConfig()) {
    throw new Error(
      "Firebase is not configured. Add FIREBASE_API_KEY and FIREBASE_PROJECT_ID to .env.local.",
    );
  }
};

/** Builds a Firebase Identity Toolkit endpoint URL with the API key appended. */
const authUrl = (path: string) => {
  ensureFirebaseConfig();
  return `${AUTH_BASE_URL}/${path}?key=${serverFirebaseConfig.apiKey}`;
};

/** Builds the Firebase Secure Token Service token-refresh URL. */
const tokenUrl = () => {
  ensureFirebaseConfig();
  return `${TOKEN_BASE_URL}/token?key=${serverFirebaseConfig.apiKey}`;
};

/** Builds the Firestore REST URL for a user's profile document. */
const userDocumentUrl = (uid: string) => {
  ensureFirebaseConfig();
  return `https://firestore.googleapis.com/v1/projects/${serverFirebaseConfig.projectId}/databases/(default)/documents/users/${uid}`;
};

/**
 * Maps a Firebase error code prefix to a user-friendly message.
 * Firebase often appends a description after the code (e.g. `"WEAK_PASSWORD : ..."`),
 * so matching is done with `startsWith` rather than strict equality.
 *
 * @param message - Raw `error.message` string from a Firebase REST error response.
 * @returns A localised, user-safe error string.
 */
const mapFirebaseError = (message?: string) => {
  const errorMessages: Record<string, string> = {
    CREDENTIAL_TOO_OLD_LOGIN_AGAIN:
      "For your security, please sign out and sign in again before changing your password.",
    EMAIL_EXISTS: "An account already exists for this email.",
    EMAIL_NOT_FOUND: "No account was found for this email.",
    INVALID_ID_TOKEN: "Your session is no longer valid. Please sign in again.",
    INVALID_LOGIN_CREDENTIALS: "The email or password is incorrect.",
    INVALID_PASSWORD: "The email or password is incorrect.",
    OPERATION_NOT_ALLOWED: "Email and password sign-in is not enabled in Firebase.",
    TOKEN_EXPIRED: "Your session expired. Please sign in again.",
    TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Please try again later.",
    USER_DISABLED: "This account has been disabled.",
    WEAK_PASSWORD: "Use a stronger password with at least 6 characters.",
  };

  const matchedCode = Object.keys(errorMessages).find((code) => message?.startsWith(code));
  return matchedCode ? errorMessages[matchedCode] : "Something went wrong. Please try again.";
};

/**
 * Performs a JSON fetch and throws a mapped Firebase error on non-OK responses.
 *
 * @template TResponse - Expected shape of the successful response body.
 * @param url - Fully-qualified request URL.
 * @param init - Standard `fetch` init options (body, method, headers, etc.).
 * @throws When the response status is not in the 2xx range.
 */
const requestJson = async <TResponse>(url: string, init: RequestInit): Promise<TResponse> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const data = (await response.json().catch(() => null)) as
    | (TResponse & { error?: { message?: string } })
    | null;

  if (!response.ok) {
    throw new Error(mapFirebaseError(data?.error?.message));
  }

  return data as TResponse;
};

/**
 * Converts Firebase's `expiresIn` (seconds from now) to an absolute Unix
 * timestamp in milliseconds, used as `SessionData.expiresAt`.
 */
const getExpiry = (expiresIn: string | number) => Date.now() + Number(expiresIn) * 1000;

/** Narrows an arbitrary string to the `UserRole` union. */
const isUserRole = (role?: string): role is UserRole => userRoles.includes(role as UserRole);

/** Returns `undefined` instead of an empty string for optional profile fields. */
const optionalString = (value?: string) => (value ? value : undefined);

/**
 * Deserialises a Firestore user document into an `AuthUser` object.
 * Falls back to the `fallbackEmail` prefix for `displayName` when the field is absent.
 * Falls back to `"free"` for `role` when the stored value is not a valid `UserRole`.
 */
const parseProfile = (uid: string, fallbackEmail: string, document: FirestoreDocument): AuthUser => {
  const fields = document.fields ?? {};
  const role = fields.role?.stringValue;

  return {
    address: optionalString(fields.address?.stringValue),
    companyName: optionalString(fields.companyName?.stringValue),
    displayName: fields.displayName?.stringValue ?? fallbackEmail.split("@")[0],
    email: fields.email?.stringValue ?? fallbackEmail,
    fullName: optionalString(fields.fullName?.stringValue),
    phone: optionalString(fields.phone?.stringValue),
    role: isUserRole(role) ? role : "free",
    tel: optionalString(fields.tel?.stringValue),
    uid,
  };
};

/**
 * Creates a new Firestore profile document for a user via a REST PATCH.
 * All new accounts are assigned `role: "free"` regardless of the caller.
 * Role upgrades must happen via the Firebase console or a Cloud Function.
 */
const createProfileDocument = async ({
  displayName,
  email,
  idToken,
  role = "free",
  uid,
}: AuthUser & { idToken: string }) => {
  const timestamp = new Date().toISOString();

  const document = await requestJson<FirestoreDocument>(userDocumentUrl(uid), {
    body: JSON.stringify({
      fields: {
        createdAt: { timestampValue: timestamp },
        displayName: { stringValue: displayName },
        email: { stringValue: email },
        role: { stringValue: role },
        updatedAt: { timestampValue: timestamp },
      },
    }),
    headers: { Authorization: `Bearer ${idToken}` },
    method: "PATCH",
  });

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
}) => {
  const response = await fetch(userDocumentUrl(uid), {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (response.status === 404) {
    return createProfileDocument({
      displayName: displayName || email.split("@")[0],
      email,
      idToken,
      role: "free",
      uid,
    });
  }

  const document = (await response.json().catch(() => null)) as
    | (FirestoreDocument & { error?: { message?: string } })
    | null;

  if (!response.ok) {
    throw new Error(mapFirebaseError(document?.error?.message));
  }

  return parseProfile(uid, email, document ?? {});
};

/**
 * Assembles a complete `AuthSession` from a Firebase Auth response.
 * Fetches (or creates) the user's Firestore profile to populate `session.user`.
 */
const buildSession = async (response: FirebaseAuthResponse): Promise<AuthSession> => {
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
 * @param params.displayName - Display name stored on both the Firebase Auth account and Firestore profile.
 * @param params.email - Account email address.
 * @param params.password - Plaintext password (minimum 6 characters enforced by Firebase).
 * @throws When the email is already in use, the password is too weak, or sign-in is disabled.
 */
export const signUpWithFirebase = async ({ displayName, email, password }: AuthRequest) => {
  const response = await requestJson<FirebaseAuthResponse>(authUrl("accounts:signUp"), {
    body: JSON.stringify({ displayName, email, password, returnSecureToken: true }),
    method: "POST",
  });
  return buildSession(response);
};

/**
 * Signs in with email and password and returns a fully-populated `AuthSession`.
 *
 * @param params.email - Account email address.
 * @param params.password - Account password.
 * @throws When credentials are invalid, the account is disabled, or too many attempts have been made.
 */
export const signInWithFirebase = async ({ email, password }: AuthRequest) => {
  const response = await requestJson<FirebaseAuthResponse>(
    authUrl("accounts:signInWithPassword"),
    {
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      method: "POST",
    },
  );
  return buildSession(response);
};

/**
 * Sends a Firebase password-reset email to the given address.
 * Resolves silently even when the address is not registered, to avoid user enumeration.
 *
 * @param email - Address to send the reset link to.
 * @throws When sign-in is disabled or the request is malformed.
 */
export const sendPasswordResetEmail = async (email: string) => {
  await requestJson<{ email: string }>(authUrl("accounts:sendOobCode"), {
    body: JSON.stringify({ email, requestType: "PASSWORD_RESET" }),
    method: "POST",
  });
};

/** Shape returned by Firebase account-update endpoints (`accounts:update`). */
type FirebaseUpdateResponse = {
  displayName?: string;
  email?: string;
  expiresIn?: string;
  idToken?: string;
  localId?: string;
  refreshToken?: string;
};

/**
 * Writes updated profile fields to the user's Firestore document using a field mask.
 * Only the listed fields are touched — other document fields (e.g. `role`) are preserved.
 */
const patchProfileFields = async (uid: string, idToken: string, profile: ProfileUpdate) => {
  const fields: Record<string, FirestoreValue> = {
    address: { stringValue: profile.address ?? "" },
    companyName: { stringValue: profile.companyName ?? "" },
    displayName: { stringValue: profile.displayName },
    fullName: { stringValue: profile.fullName ?? "" },
    phone: { stringValue: profile.phone ?? "" },
    tel: { stringValue: profile.tel ?? "" },
    updatedAt: { timestampValue: new Date().toISOString() },
  };

  const mask = Object.keys(fields)
    .map((path) => `updateMask.fieldPaths=${path}`)
    .join("&");

  await requestJson<FirestoreDocument>(`${userDocumentUrl(uid)}?${mask}`, {
    body: JSON.stringify({ fields }),
    headers: { Authorization: `Bearer ${idToken}` },
    method: "PATCH",
  });
};

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
 * @throws When the `idToken` is invalid or the Firestore write fails.
 */
export const updateAccountProfile = async (
  session: AuthSession,
  profile: ProfileUpdate,
): Promise<AuthSession> => {
  const response = await requestJson<FirebaseUpdateResponse>(authUrl("accounts:update"), {
    body: JSON.stringify({
      displayName: profile.displayName,
      idToken: session.idToken,
      returnSecureToken: true,
    }),
    method: "POST",
  });

  const idToken = response.idToken ?? session.idToken;
  await patchProfileFields(session.user.uid, idToken, profile);

  return {
    expiresAt: response.expiresIn ? getExpiry(response.expiresIn) : session.expiresAt,
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
 * @param session - Current session; existing `idToken` authorises the change.
 * @param password - New plaintext password (minimum 6 characters).
 * @throws When the session is too old (Firebase requires re-authentication for sensitive operations).
 */
export const updateAccountPassword = async (
  session: AuthSession,
  password: string,
): Promise<AuthSession> => {
  const response = await requestJson<FirebaseUpdateResponse>(authUrl("accounts:update"), {
    body: JSON.stringify({ idToken: session.idToken, password, returnSecureToken: true }),
    method: "POST",
  });

  return {
    expiresAt: response.expiresIn ? getExpiry(response.expiresIn) : session.expiresAt,
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
 * @throws When the refresh token has been revoked or the Firebase request fails.
 */
export const refreshFirebaseSession = async (session: AuthSession): Promise<AuthSession> => {
  const response = await requestJson<FirebaseRefreshResponse>(tokenUrl(), {
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: session.refreshToken,
    }),
    method: "POST",
  });

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
