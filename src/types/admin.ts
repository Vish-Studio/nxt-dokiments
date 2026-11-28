import type { AuthProviderId, UserRole } from "@/types/auth";
import type { FeedbackEntry } from "@/types/feedback";

/**
 * One account as the admin portal lists it, read from `users/{uid}`.
 *
 * A narrow projection of the profile document: business details such as the
 * address or BRN are left out because no admin screen needs them.
 */
export type AdminUserAccount = {
  /** The account's business name, when they filled it in. */
  companyName?: string;
  /** Epoch milliseconds the profile was created, or `null` for profiles written before `createdAt` existed. */
  createdAt: number | null;
  displayName: string;
  email: string;
  provider: AuthProviderId;
  role: UserRole;
  uid: string;
  /** Epoch milliseconds of the last profile write, or `null` when absent. */
  updatedAt: number | null;
};

/** One account with what the portal knows about it from other collections. */
export type AdminUserDetail = {
  account: AdminUserAccount;
  /** Everything this account sent through the feedback form, most recent first. */
  feedback: FeedbackEntry[];
};

/** One newsletter subscription, read from `newsletter/{subscriberId}`. */
export type NewsletterSubscriber = {
  /** Epoch milliseconds of the subscription, or `null` when absent. */
  createdAt: number | null;
  email: string;
  /** Document ID: a server-side hash of the address. */
  id: string;
  /** Always `"subscribed"` today; the rules accept nothing else. */
  status: string;
};

/** One switch that changes how the product behaves, as the System page shows it. */
export type AdminFeatureFlag = {
  description: string;
  /** Environment variable that controls it, e.g. `NEXT_PUBLIC_DOCUMENT_SHARING_ENABLED`. */
  envKey: string;
  isOn: boolean;
  label: string;
};

/** One configuration check on the System page. */
export type AdminHealthCheck = {
  /** What to fix when it fails. Absent when the check passes. */
  hint?: string;
  isHealthy: boolean;
  label: string;
};

/** Everything the System page reads from the server. */
export type AdminSystemStatus = {
  /** Accounts with `role: "superadmin"`. */
  administrators: AdminUserAccount[];
  checks: AdminHealthCheck[];
  flags: AdminFeatureFlag[];
  /** `package.json` version of the running build, e.g. `0.1.0`. */
  version: string;
};
