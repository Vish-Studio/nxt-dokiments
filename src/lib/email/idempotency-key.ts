import { createHash } from "node:crypto";

/**
 * Builds a Resend idempotency key from what makes an email logically unique.
 * The parts are hashed because Resend rejects keys over 256 characters and an
 * email address alone can reach 254.
 *
 * Use stable facts (ids, the time of the action), never a timestamp taken at
 * send time, so a retry reuses the key and Resend delivers once.
 *
 * @param prefix - Names the kind of email, such as `share`.
 * @param parts - The identifying values, joined with `|` before hashing.
 * @returns `<prefix>-<64 hex characters>`.
 *
 * @example
 * hashedIdempotencyKey("signed", sharedDocumentId, signerUid, signedAt);
 */
export const hashedIdempotencyKey = (
  prefix: string,
  ...parts: (string | number)[]
) => `${prefix}-${createHash("sha256").update(parts.join("|")).digest("hex")}`;
