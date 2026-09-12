import "server-only";

import {
  getDocumentId,
  getFirestoreDocument,
  listFirestoreCollection,
  patchFirestoreDocument,
  readInteger,
  readString,
  readTimestamp,
  toIntegerValue,
  toStringValue,
  toTimestampValue,
  type FirestoreDocument,
} from "@/lib/firebase/server-firestore";
import type { AuthSession } from "@/types/auth";
import {
  feedbackTypes,
  type FeedbackEntry,
  type FeedbackInput,
  type FeedbackType,
} from "@/types/feedback";

/**
 * Firestore path for submitted feedback.
 *
 * **Top-level, not `users/{uid}/feedback`** — the only collection in this app that
 * holds per-user data outside the user's own subtree. Every other one is scoped
 * under `users/{uid}` because only its owner ever reads it; feedback inverts that,
 * since the whole point is for an administrator to read *everyone's*. Reading a
 * subcollection across all users needs a Firestore collection-group query, which
 * `server-firestore.ts` does not implement — so a subcollection would have made
 * the deferred admin screen a data-layer project rather than a UI one.
 *
 * The cost of that choice is that ownership is no longer implied by the path, so
 * `firestore.rules` has to assert `uid` on the record instead. That assertion is
 * the load-bearing part of those rules.
 */
const FEEDBACK_COLLECTION = "feedback";
const feedbackDocumentPath = (feedbackId: string) =>
  `${FEEDBACK_COLLECTION}/${feedbackId}`;

/**
 * Firestore path for one user's throttle state.
 *
 * A document of its own rather than two more fields on `users/{uid}`. That profile
 * document's shape is what the `create`/`update` rules for `users/{uid}` assert
 * against (`role`, `email`, `displayName`), and widening it for an unrelated
 * concern means touching those rules — a risk with nothing to gain.
 *
 * A single fixed document ID because there is only ever one answer per user: when
 * they last wrote to us.
 */
const feedbackMetaPath = (uid: string) => `users/${uid}/feedbackMeta/latest`;

/**
 * How long a user must wait between submissions.
 *
 * Not a fairness rule — one minute is far below any real person's rate of writing
 * a considered message. It exists because without it a single signed-in account
 * can fill a collection nobody is actively watching, and the cheapest moment to
 * prevent that is before launch rather than after.
 */
export const FEEDBACK_THROTTLE_MS = 60_000;

/**
 * Ceilings on the sender details copied onto a record, in characters. These are
 * the same numbers `firestore.rules` asserts for `displayName` and `email`, and
 * they must stay in step with them.
 *
 * They are applied by truncation rather than rejection, because these values come
 * from the account rather than from anything the user typed into the dialog. A
 * long-named account would otherwise have every submission refused by the rules
 * and reported as a `500`. Clamping makes the record satisfy the rules by
 * construction: the second gate stays meaningful, and it can never fire on a
 * legitimate user. Losing the tail of an unusual display name costs a reviewer
 * nothing; losing the feedback would.
 *
 * **Kept even though `ProfileSchema` now bounds `displayName` at the same 200.**
 * That schema guards one of three write paths: `POST /api/auth/sign-up` still takes
 * `displayName` off an unvalidated body, and a Google sign-in seeds it from Google's
 * own token via `getUserProfile` — neither goes anywhere near
 * `POST /api/auth/update-profile`. Deliberately not imported from
 * `profileFieldLimits` either: whether this write can satisfy its security rules
 * must not depend on a validation rule belonging to an unrelated route, which is
 * exactly the coupling that would break silently the day someone relaxes it.
 */
const MAX_STORED_DISPLAY_NAME = 200;
const MAX_STORED_EMAIL = 254;

/**
 * Clamps a value to `max` characters, counting by code point rather than by
 * UTF-16 unit.
 *
 * `slice` would count units, which is both stricter than the rules need and able
 * to cut an emoji in half — leaving an unpaired surrogate that is not valid UTF-8
 * for Firestore to store. Counting code points matches what the rules' `size()`
 * measures and cannot split a character.
 */
const clampToCharacters = (value: string, max: number) =>
  Array.from(value).slice(0, max).join("");

/** Generates a Firestore-safe document ID for a new submission. */
const makeFeedbackId = () =>
  `feedback_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/** One user's submission history, as far as the throttle needs to know it. */
export type FeedbackThrottle = {
  /** Lifetime submissions by this user. */
  count: number;
  /** Epoch-ms time of their most recent submission. */
  lastFeedbackAt: number;
};

/**
 * Narrows an arbitrary stored string to a `FeedbackType`.
 *
 * Reads that predate a future type — or a record written by something other than
 * this route — must not produce a `FeedbackEntry` that lies about its own type,
 * so anything unrecognised is reported as `"feedback"`, the neutral option.
 */
const parseFeedbackType = (value: string | undefined): FeedbackType =>
  feedbackTypes.find((type) => type === value) ?? "feedback";

/**
 * Deserialises a `feedback/{feedbackId}` document into a `FeedbackEntry`.
 *
 * Takes no `knownId` escape hatch, unlike `parseClient`: the only caller is
 * `listFeedback`, and a `documents:list` response always carries each document's
 * `name`. `submitFeedback` composes its return value from what it wrote instead of
 * coming back through here.
 */
const parseFeedbackEntry = (document: FirestoreDocument): FeedbackEntry => {
  const fields = document.fields;

  return {
    createdAt: Date.parse(readTimestamp(fields?.createdAt) ?? "") || 0,
    displayName: readString(fields?.displayName) ?? "",
    email: readString(fields?.email) ?? "",
    id: getDocumentId(document),
    message: readString(fields?.message) ?? "",
    path: readString(fields?.path) ?? "",
    type: parseFeedbackType(readString(fields?.type)),
    uid: readString(fields?.uid) ?? "",
  };
};

/**
 * Reads how recently, and how often, this account has sent feedback.
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @returns The account's throttle state, or `null` for an account that has never
 *   submitted — which is every account until it does, and is why no back-fill is needed.
 * @throws When the Firestore read fails.
 */
export const readFeedbackThrottle = async (
  session: AuthSession,
): Promise<FeedbackThrottle | null> => {
  const document = await getFirestoreDocument(
    feedbackMetaPath(session.user.uid),
    session.idToken,
  );

  if (!document) return null;

  return {
    count: readInteger(document.fields?.count) ?? 0,
    lastFeedbackAt:
      Date.parse(readTimestamp(document.fields?.lastFeedbackAt) ?? "") || 0,
  };
};

/**
 * Decides whether a submission falls inside the throttle window.
 *
 * A pure function taking the state rather than fetching it, so the route can read
 * once and reuse that read for both the decision and the subsequent stamp.
 *
 * @param throttle - State from `readFeedbackThrottle`; `null` is never throttled.
 * @param now - Epoch-ms comparison point. Injectable for tests.
 * @returns `true` when the caller should be refused with a `429`.
 */
export const isFeedbackThrottled = (
  throttle: FeedbackThrottle | null,
  now: number = Date.now(),
): boolean =>
  throttle !== null && now - throttle.lastFeedbackAt < FEEDBACK_THROTTLE_MS;

/**
 * Stores one submission, stamped with who sent it and when.
 *
 * `uid`, `email` and `displayName` come from the session, never from the request
 * body — a caller cannot submit feedback in someone else's name, and
 * `firestore.rules` refuses the write outright if `uid` disagrees with the token.
 * Those two copied strings are clamped on the way in; see `MAX_STORED_DISPLAY_NAME`
 * for why that matters.
 *
 * Written with an ordinary upsert `PATCH` rather than the create-only variant
 * `redeemPromoCode` uses. The ID is freshly minted per call so there is nothing to
 * collide with, and it is the rules — which grant `create` but neither `update`
 * nor `delete` — that make an existing record impossible to overwrite. Feedback is
 * append-only: a record its author could later edit or erase is not a record.
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @param input - The submission, already validated by `SubmitFeedbackSchema`.
 * @returns The stored `FeedbackEntry`, including its server-assigned `id`.
 * @throws When the Firestore write fails.
 */
export const submitFeedback = async (
  session: AuthSession,
  input: FeedbackInput,
): Promise<FeedbackEntry> => {
  const feedbackId = makeFeedbackId();
  const createdAt = new Date();
  const entry: FeedbackEntry = {
    createdAt: createdAt.getTime(),
    displayName: clampToCharacters(
      session.user.displayName,
      MAX_STORED_DISPLAY_NAME,
    ),
    email: clampToCharacters(session.user.email, MAX_STORED_EMAIL),
    id: feedbackId,
    message: input.message,
    path: input.path ?? "",
    type: input.type,
    uid: session.user.uid,
  };

  await patchFirestoreDocument(
    feedbackDocumentPath(feedbackId),
    {
      createdAt: toTimestampValue(createdAt),
      displayName: toStringValue(entry.displayName),
      email: toStringValue(entry.email),
      message: toStringValue(entry.message),
      path: toStringValue(entry.path),
      type: toStringValue(entry.type),
      uid: toStringValue(entry.uid),
    },
    session.idToken,
  );

  // Returned from what we just wrote rather than parsed back out of the response:
  // a REST `PATCH` response is not guaranteed to carry the document's `name`, so
  // the ID can't be recovered from it — the same reason `parseClient` takes a
  // `knownId`.
  return entry;
};

/**
 * Records that this account has just submitted, opening a fresh throttle window.
 *
 * Deliberately separate from `submitFeedback` and meant to be called *after* it.
 * Stamping first would lock a user out for a minute on a write that then failed,
 * losing the message they had typed — the wrong way round for a guard whose worst
 * case is spam in a private collection.
 *
 * Uses a field mask so this never overwrites fields a later feature adds to the
 * document, and writes the incremented `count` from the caller's existing read
 * rather than re-reading (Firestore's REST API has no atomic increment; a lost
 * update on a purely informational counter is not worth a transaction for).
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @param previous - State from the same `readFeedbackThrottle` the throttle check used,
 *   or `null` on this account's first submission.
 * @throws When the Firestore write fails. Callers should treat that as non-fatal:
 *   the submission itself is already stored, and failing the request would tell the
 *   user their message was lost when it wasn't.
 */
export const stampFeedbackThrottle = async (
  session: AuthSession,
  previous: FeedbackThrottle | null,
): Promise<void> => {
  await patchFirestoreDocument(
    feedbackMetaPath(session.user.uid),
    {
      count: toIntegerValue((previous?.count ?? 0) + 1),
      lastFeedbackAt: toTimestampValue(),
    },
    session.idToken,
    ["count", "lastFeedbackAt"],
  );
};

/**
 * Lists every submission, newest first.
 *
 * **Not yet reachable from the app.** Written now, alongside the write path, so
 * the deferred admin screen at `/admin/feedback` is a UI-only change rather than
 * one that reopens this module. Reading requires a `superadmin` account: the rules
 * grant `read` on this collection to nobody else. Note that browsing the Firebase
 * console — how feedback is reviewed at launch — bypasses rules entirely and needs
 * no such account.
 *
 * Sorted here rather than left in Firestore's read order, matching `listClients`.
 * Document IDs happen to start with a base36 timestamp, so read order is already
 * close to chronological, but "close" is not something a consumer should depend on.
 *
 * Fetches the whole collection, as every list in this module does. That is fine
 * for launch-week volume and is the reason paging is on the deferred list: it needs
 * Firestore's query API (`runQuery`), which `server-firestore.ts` does not wrap.
 *
 * @param session - Active server-side session for a `superadmin` account.
 * @returns Every submission, most recent first.
 * @throws When the Firestore read fails — including `PERMISSION_DENIED` for a
 *   caller who is not a `superadmin`.
 */
export const listFeedback = async (
  session: AuthSession,
): Promise<FeedbackEntry[]> => {
  const documents = await listFirestoreCollection(
    FEEDBACK_COLLECTION,
    session.idToken,
  );

  return documents
    .map(parseFeedbackEntry)
    .sort((a, b) => b.createdAt - a.createdAt);
};
