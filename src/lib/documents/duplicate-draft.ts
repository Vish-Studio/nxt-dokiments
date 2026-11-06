import type { UserDocument } from "@/types/template";

const COPY_PREFIX = "Copy of ";

/** Matches the 200 character cap on a saved document name. */
const MAX_NAME_LENGTH = 200;

/**
 * Builds the unsaved draft shown in the editor when the user duplicates a
 * document.
 *
 * The name and, when present, the `title` value get a `Copy of ` prefix so the
 * copy is visibly distinct in the list; every other value is kept verbatim.
 * Nothing is persisted here: the copy only exists once the user confirms it.
 *
 * @param source - The saved document being duplicated.
 * @returns The draft `name` (capped at 200 characters) and `values`.
 */
export const buildDuplicateDraft = (source: UserDocument) => {
  const title = source.values.title?.trim();

  return {
    name: `${COPY_PREFIX}${source.name}`.slice(0, MAX_NAME_LENGTH),
    values: title
      ? { ...source.values, title: `${COPY_PREFIX}${title}` }
      : { ...source.values },
  };
};
