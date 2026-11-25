const avatarColorClasses = [
  "bg-play-blue",
  "bg-play-teal",
  "bg-play-purple",
  "bg-play-pink",
  "bg-play-amber",
  "bg-golden-harvest",
];

/**
 * A stable pastel avatar background for a client or company, derived from its
 * ID (or name when there is no client record), so the same client wears the
 * same colour on My Clients and My Documents and it never changes per render.
 *
 * @param seed - A client ID, or a company name for companies not in the client book.
 * @returns One of the `play-*` / `golden-harvest` background classes.
 */
export const getAvatarColorClass = (seed: string) => {
  const characterTotal = Array.from(seed).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return avatarColorClasses[characterTotal % avatarColorClasses.length];
};
