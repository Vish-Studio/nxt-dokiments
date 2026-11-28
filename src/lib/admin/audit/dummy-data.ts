import { daysAgo } from "@/lib/admin/sample-data";

/**
 * Sample audit log for the Audit log page and the Overview's recent actions.
 *
 * Nothing records admin actions yet. When it does, write one `auditLog/{id}`
 * document per action from the `/api/admin` routes (who, what, target, when),
 * make it append-only in `firestore.rules`, and replace `listSampleAuditEntries`.
 */

/**
 * Which admin area an action happened in.
 * Each maps to a sidebar section, so the log can link back to it.
 */
export type AuditArea =
  | "Feedback"
  | "Notifications"
  | "Plans"
  | "Promotions"
  | "Sharing"
  | "System"
  | "Templates"
  | "Users";

export type AuditEntry = {
  /** What was done, as a sentence fragment: "Changed plan Free to Silver". */
  action: string;
  /** Display name of the administrator. */
  adminName: string;
  area: AuditArea;
  /** Epoch milliseconds. */
  at: number;
  id: string;
  /** Whether the action removed or blocked something, shown in red. */
  isDestructive: boolean;
  /** What it was done to: an email, code, template or flag. */
  target: string;
};

const entries: AuditEntry[] = [
  { action: "Changed plan Free to Silver", adminName: "Anthony Alverizko", area: "Plans", at: daysAgo(0, 0.5), id: "a12", isDestructive: false, target: "maya@laurent.test" },
  { action: "Resent signature request", adminName: "Anthony Alverizko", area: "Sharing", at: daysAgo(0, 0.7), id: "a11", isDestructive: false, target: "sh_41Rk9PzQ" },
  { action: "Replied to feedback", adminName: "Rina Kowalski", area: "Feedback", at: daysAgo(0, 1.2), id: "a10", isDestructive: false, target: "daniel@okafor.test" },
  { action: "Turned on e-signatures", adminName: "Rina Kowalski", area: "System", at: daysAgo(1, -8), id: "a09", isDestructive: false, target: "Production" },
  { action: "Started campaign", adminName: "Anthony Alverizko", area: "Promotions", at: daysAgo(1), id: "a08", isDestructive: false, target: "launch-2026" },
  { action: "Published template", adminName: "Sam Obi", area: "Templates", at: daysAgo(1, 0.8), id: "a07", isDestructive: false, target: "Modern CV" },
  { action: "Sent test push", adminName: "Anthony Alverizko", area: "Notifications", at: daysAgo(2, -6), id: "a06", isDestructive: false, target: "2 devices" },
  { action: "Suspended account", adminName: "Anthony Alverizko", area: "Users", at: daysAgo(2, -2), id: "a05", isDestructive: true, target: "omar@haddad.test" },
  { action: "Sent password reset", adminName: "Rina Kowalski", area: "Users", at: daysAgo(2, -1), id: "a04", isDestructive: false, target: "tomas@rivera.test" },
  { action: "Revoked share link", adminName: "Anthony Alverizko", area: "Sharing", at: daysAgo(3), id: "a03", isDestructive: true, target: "sh_Lp0Xc8Ne" },
];

/** Sample audit entries, newest first. Swap for a Firestore read when the log exists. */
export const listSampleAuditEntries = (): AuditEntry[] =>
  [...entries].sort((a, b) => b.at - a.at);
