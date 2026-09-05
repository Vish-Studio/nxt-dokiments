import "server-only";

import {
  createFirestoreDocument,
  getDocumentId,
  getFirestoreDocument,
  listFirestoreCollection,
  readString,
  readTimestamp,
  toStringValue,
  toTimestampValue,
  type FirestoreDocument,
  type FirestoreFields,
} from "@/lib/firebase/server-firestore";
import type { AuthSession } from "@/types/auth";
import type { PromoCode, PromoRedemption } from "@/types/promo";

/**
 * Firestore subcollection path for the promo codes an account has redeemed.
 *
 * Doc ID is the campaign's own `PromoCode.id`, following `savedTemplates`: a
 * natural key makes the record's existence the whole answer to "has this account
 * redeemed it?", and makes a second redemption unrepresentable rather than merely
 * discouraged. The rules in `firestore.rules` grant `create` but neither `update`
 * nor `delete` on this path, so that constraint is enforced by the database.
 */
const promoRedemptionsPath = (uid: string) => `users/${uid}/promoRedemptions`;
const promoRedemptionPath = (uid: string, promoId: string) =>
  `${promoRedemptionsPath(uid)}/${promoId}`;

/**
 * The outcome of attempting a redemption.
 *
 * `"already_redeemed"` is a normal answer rather than an error here: the caller —
 * `POST /api/promo-redemptions` and the auth routes — decides what status or copy
 * it deserves, and both concurrent and sequential repeats arrive as this same value.
 */
export type RedeemPromoResult =
  | { redemption: PromoRedemption; status: "redeemed" }
  | { status: "already_redeemed" };

/**
 * Deserialises a `users/{uid}/promoRedemptions/{promoId}` document into a `PromoRedemption`.
 *
 * @param document - Firestore document fetched from the subcollection.
 * @returns The redemption, with `promoId` taken from the document's own ID.
 */
const parsePromoRedemption = (
  document: FirestoreDocument,
): PromoRedemption => ({
  code: readString(document.fields?.code) ?? "",
  promoId: getDocumentId(document),
  redeemedAt: Date.parse(readTimestamp(document.fields?.redeemedAt) ?? "") || 0,
});

/**
 * Lists every promo code the authenticated account has redeemed.
 *
 * Returns an empty array for an account that has redeemed none — which is every
 * account that existed before this feature shipped, and is exactly why no
 * back-fill or migration is needed: absence of a record *is* "not redeemed".
 *
 * Redemptions of campaigns no longer in the registry are returned as-is rather
 * than filtered out (unlike `listSavedTemplates`, which drops references to
 * deleted templates) — a retired campaign is still a true fact about the account,
 * and callers look up the campaign they care about by `promoId`.
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @returns The account's redemptions, in server-returned order.
 * @throws When the Firestore request fails.
 */
export const listPromoRedemptions = async (
  session: AuthSession,
): Promise<PromoRedemption[]> => {
  const documents = await listFirestoreCollection(
    promoRedemptionsPath(session.user.uid),
    session.idToken,
  );

  return documents.map(parsePromoRedemption);
};

/**
 * Redeems one promo code for the authenticated account, at most once ever.
 *
 * Validation of the code itself belongs to the caller (`findPromoCode`); by the
 * time a `PromoCode` reaches this function the code is known-good, and what is
 * left to decide is whether this account has already used it.
 *
 * Three layers answer that, in order of authority:
 * 1. A read up front, so the ordinary repeat gets a clean answer with no failed write.
 * 2. The create-only write, which Firestore refuses if a record already exists —
 *    the layer that holds when two requests race past step 1 together.
 * 3. A re-read after any write failure. Rules that grant `create` but not `update`
 *    can report the losing racer as `PERMISSION_DENIED` rather than an exists-status,
 *    and this is what tells that apart from rules never having been deployed: if the
 *    record is there, someone else wrote it and this is a repeat; if it is not, the
 *    failure is real and must surface rather than be reported as "already done".
 *
 * @param session - Active server-side session containing the Firebase `idToken` and user `uid`.
 * @param promo - The registry entry being redeemed. Its canonical `code` is stored,
 *   never the string the user typed.
 * @returns `{ status: "redeemed", redemption }` on the one write that succeeds, or
 *   `{ status: "already_redeemed" }` for every attempt after it.
 * @throws When the Firestore read or write fails for any reason other than the
 *   record already existing.
 */
export const redeemPromoCode = async (
  session: AuthSession,
  promo: PromoCode,
): Promise<RedeemPromoResult> => {
  const path = promoRedemptionPath(session.user.uid, promo.id);

  if (await getFirestoreDocument(path, session.idToken)) {
    return { status: "already_redeemed" };
  }

  const redeemedAt = new Date();
  const fields: FirestoreFields = {
    code: toStringValue(promo.code),
    redeemedAt: toTimestampValue(redeemedAt),
  };

  let created: FirestoreDocument | null;

  try {
    created = await createFirestoreDocument(path, fields, session.idToken);
  } catch (error) {
    // Distinguishes "someone else won the race" from "this write is genuinely
    // broken" — see (3) above. A failed re-read tells us nothing, so it must not
    // mask the original error.
    const existing = await getFirestoreDocument(path, session.idToken).catch(
      () => null,
    );

    if (existing) {
      return { status: "already_redeemed" };
    }

    throw error;
  }

  if (!created) {
    return { status: "already_redeemed" };
  }

  // Composed locally rather than parsed back out of the response: a REST `PATCH`
  // response is not guaranteed to carry the document's `name`, so its ID can't be
  // recovered from it (the same reason `parseClient` accepts a `knownId`).
  return {
    redemption: {
      code: promo.code,
      promoId: promo.id,
      redeemedAt: redeemedAt.getTime(),
    },
    status: "redeemed",
  };
};
