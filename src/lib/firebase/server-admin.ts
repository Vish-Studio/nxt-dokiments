import "server-only";

import packageJson from "../../../package.json";

import { listFeedback } from "@/lib/firebase/server-feedback";
import { hasServerFirebaseConfig } from "@/lib/firebase/server-config";
import {
  type FirestoreDocument,
  getDocumentId,
  getFirestoreDocument,
  listFirestoreCollection,
  readString,
  readTimestamp,
} from "@/lib/firebase/server-firestore";
import { tierLocksDisabled } from "@/lib/market-place";
import { pushNotificationsEnabled } from "@/lib/push/feature-flag";
import { documentSharingEnabled } from "@/lib/sharing/feature-flag";
import type {
  AdminHealthCheck,
  AdminSystemStatus,
  AdminUserAccount,
  AdminUserDetail,
  NewsletterSubscriber,
} from "@/types/admin";
import type { AuthProviderId, AuthSession, UserRole } from "@/types/auth";
import { userRoles } from "@/types/auth";

/** Epoch milliseconds from a Firestore timestamp field, or `null` when absent or unreadable. */
const toEpoch = (value: string | undefined): number | null => {
  if (!value) return null;

  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
};

const toRole = (value: string | undefined): UserRole =>
  userRoles.includes(value as UserRole) ? (value as UserRole) : "free";

const toProvider = (value: string | undefined): AuthProviderId =>
  value === "google" ? "google" : "password";

/**
 * Reads one `users/{uid}` document as the admin portal lists it.
 *
 * Falls back the same way `server-user-profile.ts` does (unknown role → free,
 * missing provider → password), so an account shows the plan the app itself
 * would give it.
 */
const parseAccount = (document: FirestoreDocument): AdminUserAccount => {
  const fields = document.fields ?? {};
  const email = readString(fields.email) ?? "";

  return {
    companyName: readString(fields.companyName) || undefined,
    createdAt: toEpoch(readTimestamp(fields.createdAt)),
    displayName: readString(fields.displayName) || email.split("@")[0] || "Unnamed account",
    email,
    provider: toProvider(readString(fields.provider)),
    role: toRole(readString(fields.role)),
    uid: getDocumentId(document),
    updatedAt: toEpoch(readTimestamp(fields.updatedAt)),
  };
};

/**
 * Every account, newest first.
 *
 * Reads the whole `users` collection, as the other list helpers do; fine at
 * today's size, and the reason paging (`runQuery` with a cursor) is the first
 * thing to add when the user count grows. The rules let only a superadmin list
 * it.
 *
 * @param idToken - A superadmin's Firebase ID token.
 * @throws `FirestorePermissionDeniedError` for anyone else.
 */
export const listUserAccounts = async (idToken: string): Promise<AdminUserAccount[]> => {
  const documents = await listFirestoreCollection("users", idToken);

  return documents
    .map(parseAccount)
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
};

/**
 * One account and everything the portal can see about it.
 *
 * Only the profile and feedback are real: the account's documents, shares and
 * devices are owner-only in the rules, so the detail page leaves them out
 * rather than guess.
 *
 * @param uid - The account to load. Already validated as a plain ID by the route.
 * @param session - A superadmin's session.
 * @returns The account, or `null` when no profile has that UID.
 */
export const getUserDetail = async (
  uid: string,
  session: AuthSession,
): Promise<AdminUserDetail | null> => {
  const [document, feedback] = await Promise.all([
    getFirestoreDocument(`users/${uid}`, session.idToken),
    listFeedback(session),
  ]);

  if (!document) return null;

  return {
    account: parseAccount({ ...document, name: document.name ?? `users/${uid}` }),
    feedback: feedback.filter((entry) => entry.uid === uid),
  };
};

/**
 * Every newsletter subscriber, newest first.
 *
 * Needs the superadmin `read` rule on `newsletter/{id}`; until those rules are
 * deployed the read is refused and the page shows its error state.
 *
 * @param idToken - A superadmin's Firebase ID token.
 */
export const listNewsletterSubscribers = async (
  idToken: string,
): Promise<NewsletterSubscriber[]> => {
  const documents = await listFirestoreCollection("newsletter", idToken);

  return documents
    .map((document) => {
      const fields = document.fields ?? {};

      return {
        createdAt: toEpoch(readTimestamp(fields.createdAt)),
        email: readString(fields.email) ?? "",
        id: getDocumentId(document),
        status: readString(fields.status) ?? "subscribed",
      };
    })
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
};

/** Whether every named environment variable has a value. Values are never returned. */
const hasEnv = (...keys: string[]) => keys.every((key) => Boolean(process.env[key]?.trim()));

/**
 * Configuration checks, worked out from which variables are set.
 *
 * Reports presence only, never a value, so the page cannot leak a secret. Push
 * keys are checked only when push is switched on, since they are not needed
 * otherwise.
 */
const buildHealthChecks = (): AdminHealthCheck[] => {
  const checks: AdminHealthCheck[] = [
    {
      hint: "Set FIREBASE_API_KEY, FIREBASE_PROJECT_ID and FIREBASE_AUTH_DOMAIN.",
      isHealthy: hasServerFirebaseConfig(),
      label: "Firebase",
    },
    {
      hint: "Set SESSION_SECRET to at least 32 characters.",
      isHealthy: (process.env.SESSION_SECRET?.length ?? 0) >= 32,
      label: "Session secret",
    },
    {
      hint: "Set RESEND_API_KEY and EMAIL_FROM.",
      isHealthy: hasEnv("RESEND_API_KEY", "EMAIL_FROM"),
      label: "Email provider",
    },
    {
      hint: "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
      isHealthy: hasEnv("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"),
      label: "Google sign-in",
    },
    {
      hint: "Set NEXT_PUBLIC_SITE_URL to the public address.",
      isHealthy: hasEnv("NEXT_PUBLIC_SITE_URL"),
      label: "Site address",
    },
  ];

  if (pushNotificationsEnabled) {
    checks.push({
      hint: "Set NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT.",
      isHealthy: hasEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT"),
      label: "Push keys",
    });
  }

  return checks.map((check) => (check.isHealthy ? { ...check, hint: undefined } : check));
};

/**
 * What the System page shows: switches, configuration checks, the running
 * version and who the administrators are.
 *
 * Flags are read-only here because they are environment variables baked into
 * the build; changing one means a redeploy, which the page says.
 *
 * @param idToken - A superadmin's Firebase ID token, used to list administrators.
 */
export const getSystemStatus = async (idToken: string): Promise<AdminSystemStatus> => {
  const accounts = await listUserAccounts(idToken);

  return {
    administrators: accounts.filter((account) => account.role === "superadmin"),
    checks: buildHealthChecks(),
    flags: [
      {
        description: "Share documents by link and collect signatures.",
        envKey: "NEXT_PUBLIC_DOCUMENT_SHARING_ENABLED",
        isOn: documentSharingEnabled,
        label: "Document sharing",
      },
      {
        description: "Ask for permission and send push notifications.",
        envKey: "NEXT_PUBLIC_PUSH_NOTIFICATIONS_ENABLED",
        isOn: pushNotificationsEnabled,
        label: "Push notifications",
      },
      {
        description: "Every template is free for every plan, for the public launch.",
        envKey: "NEXT_PUBLIC_DISABLE_TIER_LOCKS",
        isOn: tierLocksDisabled,
        label: "Launch unlock",
      },
    ],
    version: packageJson.version,
  };
};
