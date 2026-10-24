/**
 * The canonical form of an email address for sharing: trimmed and lower-cased.
 * Every place that stores, compares or counts a recipient goes through this, so
 * `Bob@Example.com ` and `bob@example.com` are always the same person.
 */
export const normaliseEmail = (email: string): string =>
  email.trim().toLowerCase();
