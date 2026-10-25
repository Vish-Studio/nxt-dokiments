import "server-only";

/**
 * Reads the `email_verified` claim from a Firebase ID token.
 *
 * The payload is decoded without checking the signature, which is safe here: the
 * token is received directly from Firebase over TLS, never from the client, and
 * this value only drives UI and the resend/refresh routes. Firestore rules
 * re-check the same claim, cryptographically, on every access that matters.
 *
 * @param idToken - A Firebase ID token (a JWT).
 * @returns `true` only when the claim is exactly `true`. A malformed token or a
 *   missing claim yields `false`.
 */
export const readEmailVerified = (idToken: string): boolean => {
  const payload = idToken.split(".")[1];

  if (!payload) {
    return false;
  }

  try {
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { email_verified?: unknown };

    return claims.email_verified === true;
  } catch {
    return false;
  }
};
