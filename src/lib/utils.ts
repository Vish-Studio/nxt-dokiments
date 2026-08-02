export const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

/**
 * Derives up to two uppercase initials from a display name, for avatar
 * placeholders.
 *
 * Splits on whitespace and takes the first letter of each of the first two
 * words — "Anthony Alverizko" -> "AA", "Anthony" -> "A". Falls back to "DU"
 * ("Dokiments User") when `name` is empty or contains no letters, so callers
 * never need their own empty-string guard.
 *
 * @param name - A user's display name. Not validated or trimmed beyond
 *   splitting on spaces — pass an already-sanitised value.
 * @returns One or two uppercase letters, or `"DU"` if none could be derived.
 */
export const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "DU";
