import "server-only";

import { createHash } from "node:crypto";

import {
  deleteFirestoreDocument,
  getDocumentId,
  getFirestoreDocument,
  listFirestoreCollection,
  patchFirestoreDocument,
  readString,
  readTimestamp,
  toStringValue,
  toTimestampValue,
  type FirestoreDocument,
} from "@/lib/firebase/server-firestore";
import type { AuthSession } from "@/types/auth";
import type {
  PushSubscriptionInput,
  StoredPushSubscription,
} from "@/types/push";

const subscriptionsPath = (uid: string) => `users/${uid}/pushSubscriptions`;

/**
 * Document ID for a device: a hash of its push endpoint.
 *
 * Hashed because endpoints are long URLs that are not valid document IDs. Derived
 * from the endpoint so a browser that subscribes again overwrites its own record
 * instead of piling up duplicates, which would make every push arrive twice.
 */
export const pushSubscriptionId = (endpoint: string): string =>
  createHash("sha256").update(endpoint).digest("hex");

const toStoredSubscription = (
  document: FirestoreDocument,
): StoredPushSubscription | null => {
  const fields = document.fields ?? {};
  const endpoint = readString(fields.endpoint);
  const auth = readString(fields.auth);
  const p256dh = readString(fields.p256dh);

  // A record missing any key cannot be encrypted for, so it is skipped rather
  // than failing the whole send.
  if (!endpoint || !auth || !p256dh) return null;

  const createdAt = readTimestamp(fields.createdAt);

  return {
    createdAt: createdAt ? Date.parse(createdAt) : 0,
    deviceLabel: readString(fields.deviceLabel) || undefined,
    endpoint,
    id: getDocumentId(document),
    keys: { auth, p256dh },
  };
};

/**
 * Saves a device's subscription for the signed-in user. Idempotent: the same
 * endpoint updates its existing record and keeps the original `createdAt`.
 *
 * @throws When Firestore rejects the write.
 */
export const savePushSubscription = async (
  session: AuthSession,
  input: PushSubscriptionInput,
): Promise<void> => {
  const path = `${subscriptionsPath(session.user.uid)}/${pushSubscriptionId(input.endpoint)}`;
  const existing = await getFirestoreDocument(path, session.idToken);

  const fields = {
    auth: toStringValue(input.keys.auth),
    deviceLabel: toStringValue(input.deviceLabel ?? ""),
    endpoint: toStringValue(input.endpoint),
    p256dh: toStringValue(input.keys.p256dh),
    updatedAt: toTimestampValue(),
  };

  await patchFirestoreDocument(
    path,
    existing ? fields : { ...fields, createdAt: toTimestampValue() },
    session.idToken,
    Object.keys(fields),
  );
};

/**
 * Lists the signed-in user's subscribed devices.
 *
 * @returns Valid subscriptions only, in server order. Empty when none.
 * @throws When Firestore rejects the read.
 */
export const listPushSubscriptions = async (
  session: AuthSession,
): Promise<StoredPushSubscription[]> => {
  const documents = await listFirestoreCollection(
    subscriptionsPath(session.user.uid),
    session.idToken,
  );

  return documents.flatMap((document) => {
    const subscription = toStoredSubscription(document);
    return subscription ? [subscription] : [];
  });
};

/**
 * Removes one device's subscription. Succeeds when it was already gone, so an
 * opt-out and a push-service cleanup racing each other both end cleanly.
 */
export const deletePushSubscription = async (
  session: AuthSession,
  endpoint: string,
): Promise<void> =>
  deleteFirestoreDocument(
    `${subscriptionsPath(session.user.uid)}/${pushSubscriptionId(endpoint)}`,
    session.idToken,
  );
