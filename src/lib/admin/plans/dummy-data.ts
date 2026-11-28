import { daysAgo } from "@/lib/admin/sample-data";
import type { UserRole } from "@/types/auth";

/**
 * Sample plan-change history for the Plans page.
 *
 * Who is on which plan is real (counted from `users`); the history is not,
 * because nothing records a role change. When plan changes go through an admin
 * route or billing webhook, log them to `planChanges/{id}` and replace
 * `listSamplePlanChanges`.
 */

/**
 * Why a plan changed.
 * - `admin`: moved by an administrator.
 * - `promotion`: unlocked by a promo code.
 * - `user`: the customer changed it themselves.
 */
export type PlanChangeSource = "admin" | "promotion" | "user";

export type PlanChange = {
  /** Epoch milliseconds. */
  at: number;
  email: string;
  from: UserRole;
  id: string;
  name: string;
  source: PlanChangeSource;
  to: UserRole;
};

const changes: PlanChange[] = [
  {
    at: daysAgo(0, 0.5),
    email: "maya@laurent.test",
    from: "free",
    id: "p1",
    name: "Maya Laurent",
    source: "admin",
    to: "silver",
  },
  {
    at: daysAgo(0, 15),
    email: "hana@sato.test",
    from: "silver",
    id: "p2",
    name: "Hana Sato",
    source: "user",
    to: "gold",
  },
  {
    at: daysAgo(1, -2),
    email: "ben@carter.test",
    from: "gold",
    id: "p3",
    name: "Ben Carter",
    source: "user",
    to: "silver",
  },
  {
    at: daysAgo(2, -6),
    email: "priya@nair.test",
    from: "free",
    id: "p4",
    name: "Priya Nair",
    source: "promotion",
    to: "silver",
  },
  {
    at: daysAgo(2, 1),
    email: "elena@petrova.test",
    from: "silver",
    id: "p5",
    name: "Elena Petrova",
    source: "user",
    to: "free",
  },
  {
    at: daysAgo(3, -12),
    email: "jonas@weber.test",
    from: "free",
    id: "p6",
    name: "Jonas Weber",
    source: "user",
    to: "gold",
  },
];

/** Sample plan changes, newest first. Swap for a Firestore read when they are logged. */
export const listSamplePlanChanges = (): PlanChange[] =>
  [...changes].sort((a, b) => b.at - a.at);
