import "server-only";

import {
  getFirestoreDocument,
  patchFirestoreDocument,
  readTimestamp,
  toTimestampValue,
} from "@/lib/firebase/server-firestore";
import type { AuthSession } from "@/types/auth";

/**
 * One document per user holding when they last opened the notification center.
 * A document of its own (not fields on `users/{uid}`) for the same reason as
 * `feedbackMeta`: the profile document's shape is asserted by its security rules.
 */
const notificationStatePath = (uid: string) =>
  `users/${uid}/notificationMeta/state`;

/**
 * When the user last marked their notifications as read.
 *
 * @returns Epoch milliseconds, or `0` if they never have (everything is unread).
 */
export const getNotificationsSeenAt = async (
  session: AuthSession,
): Promise<number> => {
  const document = await getFirestoreDocument(
    notificationStatePath(session.user.uid),
    session.idToken,
  );
  const seenAt = readTimestamp(document?.fields?.lastSeenAt);
  return seenAt ? Date.parse(seenAt) : 0;
};

/**
 * Marks everything up to now as read.
 *
 * @returns The new `lastSeenAt`, in epoch milliseconds.
 */
export const markNotificationsSeen = async (
  session: AuthSession,
): Promise<number> => {
  const now = new Date();
  await patchFirestoreDocument(
    notificationStatePath(session.user.uid),
    { lastSeenAt: toTimestampValue(now) },
    session.idToken,
    ["lastSeenAt"],
  );
  return now.getTime();
};
