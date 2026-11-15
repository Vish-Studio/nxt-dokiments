/**
 * Longest question stored. The same ceiling is asserted by `firestore.rules`, so
 * keep them in step. Generous for a chat question; anything longer is not one.
 */
export const MAX_UNANSWERED_LENGTH = 300;

const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/g;

/** Digit runs that may be broken up by spaces, dashes, dots or brackets. */
const NUMBER_PATTERN = /\+?\d[\d\s().-]*\d/g;

/** Below this many digits it is a quantity or a year, not a phone or card number. */
const MIN_REDACTED_DIGITS = 6;

/**
 * Clamps to `max` characters by code point, so an emoji is never cut in half
 * into something Firestore refuses to store.
 */
export const clampToCharacters = (value: string, max: number) =>
  Array.from(value).slice(0, max).join("");

/**
 * Replaces email addresses and phone/card-like numbers with placeholders. People
 * type these into chat boxes, and the unanswered-question log is meant to show
 * what was asked, not who asked it.
 */
export const redactPersonalDetails = (text: string) =>
  text
    .replace(EMAIL_PATTERN, "[email]")
    .replace(NUMBER_PATTERN, (match) =>
      match.replace(/\D/g, "").length >= MIN_REDACTED_DIGITS
        ? "[number]"
        : match,
    );

/**
 * What gets stored for a question: redacted, then clamped, since a placeholder
 * can be longer than the address it replaced.
 */
export const prepareUnansweredMessage = (text: string) =>
  clampToCharacters(redactPersonalDetails(text.trim()), MAX_UNANSWERED_LENGTH);
