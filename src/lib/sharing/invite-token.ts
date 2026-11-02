import { createHash, randomBytes } from "node:crypto";

/** How long an invite link works: 14 days, in milliseconds. */
export const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000;

/** A freshly minted invite token and the hash that identifies it in Firestore. */
export type InviteToken = {
  /** SHA-256 of `token`, hex. Used as the `sharedInvites` document ID. */
  hash: string;
  /** 256 random bits, base64url. Goes in the emailed link and nowhere else. */
  token: string;
};

/** Matches what `generateInviteToken` produces: 32 bytes of base64url, 43 characters. */
const TOKEN_SHAPE = /^[A-Za-z0-9_-]{43}$/;

/**
 * Hashes an invite token into the ID of its `sharedInvites` document.
 *
 * Only the hash is ever stored, so the token cannot be recovered from the
 * database. SHA-256 with no salt is enough here: the input is 256 random bits,
 * not a human-chosen secret, so there is nothing to brute force.
 */
export const hashInviteToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

/**
 * Whether `value` could be an invite token. Checked before touching Firestore so
 * junk in the URL never costs a read.
 */
export const isInviteTokenShape = (value: string) => TOKEN_SHAPE.test(value);

/**
 * Mints a new invite token.
 *
 * @example
 * const { token, hash } = generateInviteToken();
 * // email `${siteUrl}/shared/${token}`, store the invite under `hash`
 */
export const generateInviteToken = (): InviteToken => {
  const token = randomBytes(32).toString("base64url");
  return { hash: hashInviteToken(token), token };
};
