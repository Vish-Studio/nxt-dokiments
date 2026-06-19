import { firebaseConfig, hasFirebaseConfig } from "@/lib/firebase/config";
import type { AuthSession, AuthUser, UserRole } from "@/types/auth";
import { userRoles } from "@/types/auth";

type FirebaseAuthResponse = {
  displayName?: string;
  email: string;
  expiresIn: string;
  idToken: string;
  localId: string;
  refreshToken: string;
};

type FirebaseRefreshResponse = {
  expires_in: string;
  id_token: string;
  refresh_token: string;
  user_id: string;
};

type FirestoreValue = {
  stringValue?: string;
  timestampValue?: string;
};

type FirestoreDocument = {
  fields?: Record<string, FirestoreValue>;
};

type AuthRequest = {
  displayName?: string;
  email: string;
  password: string;
};

const AUTH_BASE_URL = "https://identitytoolkit.googleapis.com/v1";
const TOKEN_BASE_URL = "https://securetoken.googleapis.com/v1";

const ensureFirebaseConfig = () => {
  if (!hasFirebaseConfig()) {
    throw new Error(
      "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID to .env.local.",
    );
  }
};

const authUrl = (path: string) => {
  ensureFirebaseConfig();
  return `${AUTH_BASE_URL}/${path}?key=${firebaseConfig.apiKey}`;
};

const tokenUrl = () => {
  ensureFirebaseConfig();
  return `${TOKEN_BASE_URL}/token?key=${firebaseConfig.apiKey}`;
};

const userDocumentUrl = (uid: string) => {
  ensureFirebaseConfig();
  return `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${uid}`;
};

const mapFirebaseError = (message?: string) => {
  const errorMessages: Record<string, string> = {
    EMAIL_EXISTS: "An account already exists for this email.",
    EMAIL_NOT_FOUND: "No account was found for this email.",
    INVALID_LOGIN_CREDENTIALS: "The email or password is incorrect.",
    INVALID_PASSWORD: "The email or password is incorrect.",
    OPERATION_NOT_ALLOWED: "Email and password sign-in is not enabled in Firebase.",
    TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Please try again later.",
    USER_DISABLED: "This account has been disabled.",
    WEAK_PASSWORD: "Use a stronger password with at least 6 characters.",
  };

  return errorMessages[message ?? ""] ?? "Something went wrong. Please try again.";
};

const requestJson = async <TResponse>(
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
  const data = await response.json().catch(() => null) as
    | (TResponse & { error?: { message?: string } })
    | null;

  if (!response.ok) {
    throw new Error(mapFirebaseError(data?.error?.message));
  }

  return data as TResponse;
};

const getExpiry = (expiresIn: string | number) => {
  return Date.now() + Number(expiresIn) * 1000;
};

const isUserRole = (role?: string): role is UserRole => {
  return userRoles.includes(role as UserRole);
};

const parseProfile = (uid: string, fallbackEmail: string, document: FirestoreDocument): AuthUser => {
  const fields = document.fields ?? {};
  const role = fields.role?.stringValue;

  return {
    displayName: fields.displayName?.stringValue ?? fallbackEmail.split("@")[0],
    email: fields.email?.stringValue ?? fallbackEmail,
    role: isUserRole(role) ? role : "free",
    uid,
  };
};

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
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    method: "PATCH",
  });

  return parseProfile(uid, email, document);
};

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
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
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

  const document = await response.json().catch(() => null) as
    | (FirestoreDocument & { error?: { message?: string } })
    | null;

  if (!response.ok) {
    throw new Error(mapFirebaseError(document?.error?.message));
  }

  return parseProfile(uid, email, document ?? {});
};

const createSession = async (response: FirebaseAuthResponse): Promise<AuthSession> => {
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

export const signUpWithFirebase = async ({ displayName, email, password }: AuthRequest) => {
  const response = await requestJson<FirebaseAuthResponse>(authUrl("accounts:signUp"), {
    body: JSON.stringify({
      displayName,
      email,
      password,
      returnSecureToken: true,
    }),
    method: "POST",
  });

  return createSession(response);
};

export const signInWithFirebase = async ({ email, password }: AuthRequest) => {
  const response = await requestJson<FirebaseAuthResponse>(authUrl("accounts:signInWithPassword"), {
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
    method: "POST",
  });

  return createSession(response);
};

export const sendPasswordResetEmail = async (email: string) => {
  await requestJson<{ email: string }>(authUrl("accounts:sendOobCode"), {
    body: JSON.stringify({
      email,
      requestType: "PASSWORD_RESET",
    }),
    method: "POST",
  });
};

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
