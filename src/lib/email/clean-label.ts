/**
 * Makes a user-supplied name safe for an email subject or one line of body text:
 * control characters and line breaks become spaces, runs of whitespace collapse,
 * and anything longer than `max` is cut with an ellipsis.
 *
 * React already escapes markup, so this guards against header-style line breaks
 * and oversized names rather than HTML.
 *
 * @param value - The raw name, for example a document title.
 * @param max - Longest result, ellipsis included.
 * @param fallback - Returned when nothing is left after cleaning.
 *
 * @example
 * cleanEmailLabel("NDA\nBcc: x@evil.com", 80, "a document"); // "NDA Bcc: x@evil.com"
 */
export const cleanEmailLabel = (
  value: string,
  max = 80,
  fallback = "a document",
) => {
  const cleaned = value
    .replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return fallback;
  }

  return cleaned.length > max
    ? `${cleaned.slice(0, max - 1).trimEnd()}…`
    : cleaned;
};

/**
 * Names a person in an email: their display name cleaned and capped at 60
 * characters, or their email address when they have no usable name.
 *
 * @param user - The person, normally `session.user`.
 *
 * @example
 * personLabel({ displayName: "", email: "bob@example.com" }); // "bob@example.com"
 */
export const personLabel = (user: { displayName: string; email: string }) =>
  cleanEmailLabel(user.displayName, 60, user.email);
