import type {
  AdminSystemStatus,
  AdminUserAccount,
  NewsletterSubscriber,
} from "@/types/admin";
import type { FeedbackEntry } from "@/types/feedback";

/**
 * Fixtures for the admin portal stories: what the `/api/admin` routes would
 * return for a small workspace. Dates are relative to now so the "this week"
 * and "last 12 weeks" numbers always have something to show.
 */

const DAY = 86_400_000;
const now = Date.now();

const account = (overrides: Partial<AdminUserAccount>): AdminUserAccount => ({
  createdAt: now - DAY,
  displayName: "Maya Laurent",
  email: "maya@laurent.test",
  provider: "password",
  role: "free",
  uid: "u_maya",
  updatedAt: now - DAY,
  ...overrides,
});

export const adminStoryAccounts: AdminUserAccount[] = [
  account({ companyName: "Laurent Studio", createdAt: now - 2 * DAY, displayName: "Maya Laurent", email: "maya@laurent.test", role: "silver", uid: "u_8fK2qL9xTz" }),
  account({ createdAt: now - 4 * DAY, displayName: "Daniel Okafor", email: "daniel@okafor.test", provider: "google", uid: "u_3hPq7Wn1Ab" }),
  account({ companyName: "Brandt Legal", createdAt: now - 20 * DAY, displayName: "Sofia Brandt", email: "sofia@brandt.test", role: "gold", uid: "u_Z91mKd02Ru" }),
  account({ createdAt: now - 33 * DAY, displayName: "Priya Nair", email: "priya@nair.test", role: "silver", uid: "u_Qe4Vb7Hs3N" }),
  account({ createdAt: now - 41 * DAY, displayName: "Lucas Moreau", email: "lucas@moreau.test", provider: "google", uid: "u_Bn8Cx1Kd7M" }),
  account({ createdAt: now - 55 * DAY, displayName: "Hana Sato", email: "hana@sato.test", role: "gold", uid: "u_Yt6Rf3Jk0P" }),
  account({ createdAt: now - 62 * DAY, displayName: "Tomás Rivera", email: "tomas@rivera.test", uid: "u_Mv2Gh9Ls4E" }),
  account({ createdAt: now - 70 * DAY, displayName: "Elena Petrova", email: "elena@petrova.test", uid: "u_Lp0Xc8NeQ1" }),
  account({ createdAt: now - 76 * DAY, displayName: "Jonas Weber", email: "jonas@weber.test", role: "special", uid: "u_Jw4Rt7Yh2K" }),
  account({ createdAt: null, displayName: "Anthony Alverizko", email: "anthony@dokiments.test", role: "superadmin", uid: "u_admin_anthony" }),
];

export const adminStoryFeedback: FeedbackEntry[] = [
  {
    createdAt: now - 2 * 3_600_000,
    displayName: "Daniel Okafor",
    email: "daniel@okafor.test",
    id: "feedback_1",
    message: "When an invoice has more than 14 items the last row is cut off in the PDF. It shows fine in the editor.",
    path: "/my-documents",
    type: "problem",
    uid: "u_3hPq7Wn1Ab",
  },
  {
    createdAt: now - 5 * 3_600_000,
    displayName: "Priya Nair",
    email: "priya@nair.test",
    id: "feedback_2",
    message: "I fill in the same VAT number for three clients every month. A field on the client card would save me a lot of copying.",
    path: "/my-clients",
    type: "feedback",
    uid: "u_Qe4Vb7Hs3N",
  },
  {
    createdAt: now - DAY,
    displayName: "Maya Laurent",
    email: "maya@laurent.test",
    id: "feedback_3",
    message: "The new CV style looks great. Two compliments on it already.",
    path: "/marketplace",
    type: "feedback",
    uid: "u_8fK2qL9xTz",
  },
];

export const adminStorySubscribers: NewsletterSubscriber[] = [
  { createdAt: now - 3_600_000, email: "jo@harbour.test", id: "n1", status: "subscribed" },
  { createdAt: now - 2 * DAY, email: "maya@laurent.test", id: "n2", status: "subscribed" },
  { createdAt: now - 12 * DAY, email: "kai@studio.test", id: "n3", status: "subscribed" },
  { createdAt: now - 45 * DAY, email: "priya@nair.test", id: "n4", status: "subscribed" },
];

export const adminStorySystem: AdminSystemStatus = {
  administrators: adminStoryAccounts.filter((item) => item.role === "superadmin"),
  checks: [
    { isHealthy: true, label: "Firebase" },
    { isHealthy: true, label: "Session secret" },
    { hint: "Set RESEND_API_KEY and EMAIL_FROM.", isHealthy: false, label: "Email provider" },
    { isHealthy: true, label: "Google sign-in" },
    { isHealthy: true, label: "Site address" },
  ],
  flags: [
    { description: "Share documents by link and collect signatures.", envKey: "NEXT_PUBLIC_DOCUMENT_SHARING_ENABLED", isOn: true, label: "Document sharing" },
    { description: "Ask for permission and send push notifications.", envKey: "NEXT_PUBLIC_PUSH_NOTIFICATIONS_ENABLED", isOn: false, label: "Push notifications" },
    { description: "Every template is free for every plan, for the public launch.", envKey: "NEXT_PUBLIC_DISABLE_TIER_LOCKS", isOn: true, label: "Launch unlock" },
  ],
  version: "1.4.0",
};
