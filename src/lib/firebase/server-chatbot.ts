import "server-only";

import { prepareUnansweredMessage } from "@/lib/chatbot/unanswered";
import {
  patchFirestoreDocument,
  toStringValue,
  toTimestampValue,
} from "@/lib/firebase/server-firestore";

/**
 * Firestore collection of questions Docsy had no answer for, reviewed in the
 * Firebase console to decide which rules to add next. Top-level and anonymous:
 * visitors who are not signed in ask most of them.
 */
const UNANSWERED_COLLECTION = "chatbotUnanswered";

const makeUnansweredId = () =>
  `unanswered_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export interface UnansweredQuestion {
  message: string;
  /** Page the question was asked on, e.g. `/my-documents`. */
  path: string;
}

/**
 * Stores one unanswered question, with personal details redacted. Written without
 * an ID token: `firestore.rules` allows anyone to create a record of exactly this
 * shape, and nobody to read, change or delete one.
 *
 * @throws When the Firestore write fails.
 */
export const logUnansweredQuestion = async ({
  message,
  path,
}: UnansweredQuestion): Promise<void> => {
  await patchFirestoreDocument(`${UNANSWERED_COLLECTION}/${makeUnansweredId()}`, {
    createdAt: toTimestampValue(),
    message: toStringValue(prepareUnansweredMessage(message)),
    path: toStringValue(path),
  });
};
