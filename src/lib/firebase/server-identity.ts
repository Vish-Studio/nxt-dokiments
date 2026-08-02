import "server-only";

import {
  hasServerFirebaseConfig,
  serverFirebaseConfig,
} from "@/lib/firebase/server-config";

/** Shape returned by Firebase Identity Toolkit sign-in and sign-up endpoints. */
export type FirebaseAuthResponse = {
  /** Display name on the account, if one was set at sign-up. */
  displayName?: string;
  /** Account email address. */
  email: string;
  /** Seconds from now until `idToken` expires. */
  expiresIn: string;
  /** Signed JWT asserting the user's identity; used to authorise Firestore requests. */
  idToken: string;
  /** Firebase's name for the Auth UID — mapped to `AuthUser.uid` everywhere else in this codebase. */
  localId: string;
  /** Long-lived token used to obtain a new `idToken` once it expires. */
  refreshToken: string;
};

/**
 * Shape returned by the Firebase Secure Token Service refresh endpoint.
 * Unlike Identity Toolkit's camelCase responses, this endpoint's JSON is genuinely snake_case —
 * do not "fix" these field names to camelCase, it will silently break parsing.
 */
export type FirebaseRefreshResponse = {
  /** Seconds from now until `id_token` expires. */
  expires_in: string;
  /** Newly-issued signed JWT asserting the user's identity. */
  id_token: string;
  /** Newly-issued long-lived refresh token (Firebase rotates this on every use). */
  refresh_token: string;
  /** Firebase Auth UID — equivalent to `localId` on `FirebaseAuthResponse`. */
  user_id: string;
};

/** Shape returned by Firebase account-update endpoints (`accounts:update`). */
export type FirebaseUpdateResponse = {
  /** New display name, echoed back when a `displayName` update was requested. */
  displayName?: string;
  /** Account email address. */
  email?: string;
  /** Seconds from now until `idToken` expires. Present only when Firebase issued a fresh token. */
  expiresIn?: string;
  /** Newly-issued signed JWT. Present only when the update required rotating tokens (e.g. password change). */
  idToken?: string;
  /** Firebase Auth UID. */
  localId?: string;
  /** Newly-issued long-lived refresh token. Present only alongside a fresh `idToken`. */
  refreshToken?: string;
};

/** Credentials payload for sign-in and sign-up requests. */
export type AuthRequest = {
  /** Display name to set on a new account. Ignored for sign-in. */
  displayName?: string;
  /** Account email address. */
  email: string;
  /** Account password (minimum 6 characters enforced by Firebase). */
  password: string;
};

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

/**
 * Maps a Firebase error code prefix to a user-friendly message.
 * Firebase often appends a description after the code (e.g. `"WEAK_PASSWORD : ..."`),
 * so matching is done with `startsWith` rather than strict equality.
 *
 * @param message - Raw `error.message` string from a Firebase REST error response.
 * @returns A localised, user-safe error string.
 */
export const mapFirebaseError = (message?: string) => {
  const errorMessages: Record<string, string> = {
    CREDENTIAL_TOO_OLD_LOGIN_AGAIN:
      "For your security, please sign out and sign in again before changing your password.",
    EMAIL_EXISTS: "An account already exists for this email.",
    EMAIL_NOT_FOUND: "No account was found for this email.",
    INVALID_ID_TOKEN: "Your session is no longer valid. Please sign in again.",
    INVALID_LOGIN_CREDENTIALS: "The email or password is incorrect.",
    INVALID_PASSWORD: "The email or password is incorrect.",
    OPERATION_NOT_ALLOWED:
      "Email and password sign-in is not enabled in Firebase.",
    TOKEN_EXPIRED: "Your session expired. Please sign in again.",
    TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Please try again later.",
    USER_DISABLED: "This account has been disabled.",
    WEAK_PASSWORD: "Use a stronger password with at least 6 characters.",
  };

  const matchedCode = Object.keys(errorMessages).find((code) =>
    message?.startsWith(code),
  );
  return matchedCode
    ? errorMessages[matchedCode]
    : "Something went wrong. Please try again.";
};

/**
 * Thrown instead of a generic `Error` when Firebase rejects a request with
 * `CREDENTIAL_TOO_OLD_LOGIN_AGAIN` — the session is valid but too old for a
 * sensitive operation (e.g. changing a password) and needs a fresh sign-in.
 *
 * Callers should catch this specifically (via `instanceof`) to trigger an
 * in-app re-authentication flow, rather than pattern-matching the mapped,
 * user-facing message from `mapFirebaseError`.
 */
export class FirebaseReauthRequiredError extends Error {
  constructor() {
    super(mapFirebaseError("CREDENTIAL_TOO_OLD_LOGIN_AGAIN"));
    this.name = "FirebaseReauthRequiredError";
  }
}

/**
 * Performs a JSON fetch against Firebase Identity Toolkit / Secure Token Service and throws a
 * mapped Firebase error on non-OK responses.
 *
 * @template TResponse - Expected shape of the successful response body.
 * @param url - Fully-qualified request URL.
 * @param init - Standard `fetch` init options (body, method, headers, etc.).
 * @throws {FirebaseReauthRequiredError} When Firebase's raw error code is `CREDENTIAL_TOO_OLD_LOGIN_AGAIN`.
 * @throws When the response status is not in the 2xx range for any other reason.
 */
const requestIdentityJson = async <TResponse>(
  url: string,
  init: RequestInit,
): Promise<TResponse> => {
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
    if (data?.error?.message?.startsWith("CREDENTIAL_TOO_OLD_LOGIN_AGAIN")) {
      throw new FirebaseReauthRequiredError();
    }

    throw new Error(mapFirebaseError(data?.error?.message));
  }

  return data as TResponse;
};

/**
 * Converts Firebase's `expiresIn` (seconds from now) to an absolute Unix
 * timestamp in milliseconds, used as `SessionData.expiresAt`.
 *
 * @param expiresIn - Seconds from now until expiry, as returned by Firebase (may be a numeric string).
 * @returns Absolute Unix timestamp in milliseconds.
 */
export const getExpiry = (expiresIn: string | number) =>
  Date.now() + Number(expiresIn) * 1000;

/**
 * Creates a new Firebase Auth account.
 *
 * @param request - New account's display name (optional), email, and password.
 * @throws When the email is already in use, the password is too weak, or sign-up is disabled.
 */
export const signUpWithFirebase = ({
  displayName,
  email,
  password,
}: AuthRequest) =>
  requestIdentityJson<FirebaseAuthResponse>(authUrl("accounts:signUp"), {
    body: JSON.stringify({
      displayName,
      email,
      password,
      returnSecureToken: true,
    }),
    method: "POST",
  });

/**
 * Signs in with email and password against Firebase Auth.
 *
 * @param request - Account email and password. `displayName` is ignored for sign-in.
 * @throws When credentials are invalid, the account is disabled, or too many attempts have been made.
 */
export const signInWithFirebase = ({ email, password }: AuthRequest) =>
  requestIdentityJson<FirebaseAuthResponse>(
    authUrl("accounts:signInWithPassword"),
    {
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      method: "POST",
    },
  );

/**
 * Sends a Firebase password-reset email to the given address.
 * Resolves silently even when the address is not registered, to avoid user enumeration.
 *
 * @param email - Address to send the reset link to.
 * @throws When sign-in is disabled or the request is malformed.
 */
export const sendPasswordResetEmail = async (email: string) => {
  await requestIdentityJson<{ email: string }>(
    authUrl("accounts:sendOobCode"),
    {
      body: JSON.stringify({ email, requestType: "PASSWORD_RESET" }),
      method: "POST",
    },
  );
};

/**
 * Updates the `displayName` on a Firebase Auth account.
 *
 * @param idToken - Current ID token authorising the update.
 * @param displayName - New display name to set on the account.
 * @throws When the `idToken` is invalid.
 */
export const updateFirebaseDisplayName = (
  idToken: string,
  displayName: string,
) =>
  requestIdentityJson<FirebaseUpdateResponse>(authUrl("accounts:update"), {
    body: JSON.stringify({ displayName, idToken, returnSecureToken: true }),
    method: "POST",
  });

/**
 * Changes the password for a Firebase Auth account.
 * Firebase rotates the `idToken` and `refreshToken` on a successful password change.
 *
 * @param idToken - Current ID token authorising the change.
 * @param password - New plaintext password (minimum 6 characters enforced by Firebase).
 * @throws When the session is too old (Firebase requires re-authentication for sensitive operations).
 */
export const updateFirebasePassword = (idToken: string, password: string) =>
  requestIdentityJson<FirebaseUpdateResponse>(authUrl("accounts:update"), {
    body: JSON.stringify({ idToken, password, returnSecureToken: true }),
    method: "POST",
  });

/**
 * Exchanges a Firebase `refreshToken` for a new `idToken`/`refreshToken` pair.
 *
 * @param refreshToken - Long-lived refresh token issued at sign-in.
 * @throws When the refresh token has been revoked or the Firebase request fails.
 */
export const refreshFirebaseToken = (refreshToken: string) =>
  requestIdentityJson<FirebaseRefreshResponse>(tokenUrl(), {
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    method: "POST",
  });
