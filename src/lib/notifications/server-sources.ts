import "server-only";

import type { AuthenticatedSession } from "@/lib/api/with-session";
import { listActiveTemplates } from "@/lib/firebase/server-catalog";
import type { AppNotification } from "@/types/notification";

/** What a server source returns: everything except `read`, which the aggregator decides. */
export type ServerNotification = Omit<AppNotification, "read">;

/**
 * A producer of notifications that can be computed server-side for one user.
 *
 * To add a kind of notification, write one of these and add it to
 * `serverNotificationSources`. Sources are independent: one that throws is
 * dropped from the response without affecting the others.
 */
export type ServerNotificationSource = {
  kind: string;
  list: (context: {
    now: number;
    session: AuthenticatedSession;
  }) => Promise<ServerNotification[]>;
};

/** How far back a notification stays in the list. */
export const NOTIFICATION_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

/** Templates added within this gap of one another are announced together. */
const TEMPLATE_BATCH_GAP_MS = 10 * 60 * 1000;

/**
 * "New template" notifications, derived from `templates/{id}.createdAt` — no
 * per-user records are written. Templates without a `createdAt` (everything seeded
 * before this existed) never notify.
 */
const templateSource: ServerNotificationSource = {
  kind: "template",
  list: async ({ now, session }) => {
    const templates = (await listActiveTemplates(session.idToken))
      .filter(
        (template) =>
          template.createdAt !== undefined &&
          now - template.createdAt <= NOTIFICATION_WINDOW_MS,
      )
      .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));

    const batches: (typeof templates)[] = [];
    for (const template of templates) {
      const current = batches[batches.length - 1];
      const last = current?.[current.length - 1];
      if (
        current &&
        last &&
        (template.createdAt ?? 0) - (last.createdAt ?? 0) <=
          TEMPLATE_BATCH_GAP_MS
      ) {
        current.push(template);
      } else {
        batches.push([template]);
      }
    }

    return batches.map((batch) => {
      const newest = batch[batch.length - 1];
      const [first] = batch;

      return {
        action: { href: "/marketplace", label: "View in marketplace" },
        body:
          batch.length === 1
            ? `${first.style.name} style · ${first.tier} plan`
            : batch
                .slice(0, 3)
                .map((template) => template.name)
                .join(", ") + (batch.length > 3 ? ", and more" : ""),
        createdAt: newest.createdAt ?? now,
        id: `template:${first.id}`,
        kind: "template",
        title:
          batch.length === 1
            ? `New template: ${first.name}`
            : `${batch.length} new templates added`,
      };
    });
  },
};

/** Register new server-side notification sources here. */
export const serverNotificationSources: ServerNotificationSource[] = [
  templateSource,
];
