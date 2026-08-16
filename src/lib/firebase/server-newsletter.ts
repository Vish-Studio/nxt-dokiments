import "server-only";

import { createHash } from "node:crypto";

import {
  patchFirestoreDocument,
  toStringValue,
  toTimestampValue,
} from "@/lib/firebase/server-firestore";

const newsletterPath = (email: string) => {
  const subscriberId = createHash("sha256").update(email).digest("hex");

  return `newsletter/${subscriberId}`;
};

/**
 * Creates or refreshes a newsletter subscription without exposing the email
 * address in the Firestore document path. Re-subscribing with the same address
 * updates the existing document rather than creating a duplicate record.
 */
export const subscribeToNewsletter = async (email: string): Promise<void> => {
  await patchFirestoreDocument(newsletterPath(email), {
    createdAt: toTimestampValue(),
    email: toStringValue(email),
    status: toStringValue("subscribed"),
  });
};
