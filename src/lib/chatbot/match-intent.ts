import type { ChatIntent } from "./intents";

/** Dropped before matching, so "create an account" still matches "create account". */
const FILLER_WORDS = new Set([
  "a",
  "an",
  "my",
  "our",
  "please",
  "some",
  "that",
  "the",
  "this",
  "your",
]);

const SUFFIXES = ["ing", "ed", "es", "s", "e"];

/**
 * Crude suffix stripping, applied to messages and keywords alike, so "signing",
 * "signed" and "signs" all meet "sign". Only needs to be consistent, not correct
 * English.
 */
export const stem = (word: string) => {
  for (const suffix of SUFFIXES) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      return word.slice(0, -suffix.length);
    }
  }

  return word;
};

/** Lowercase, accent-free, punctuation-free stemmed words. */
export const tokenize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter((word) => word && !FILLER_WORDS.has(word))
    .map(stem);

/** Shorter words are too easily one letter away from a different word. */
const MIN_TYPO_LENGTH = 5;

/**
 * Whether `a` turns into `b` with one inserted, deleted, substituted or swapped
 * adjacent letter: "invoce", "pasword", "donwload".
 */
export const isOneTypoAway = (a: string, b: string) => {
  if (Math.abs(a.length - b.length) > 1) return false;

  let i = 0;
  let j = 0;
  let edits = 0;

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }

    if (++edits > 1) return false;

    if (a.length > b.length) {
      i++;
    } else if (a.length < b.length) {
      j++;
    } else if (a[i] === b[j + 1] && a[i + 1] === b[j]) {
      i += 2;
      j += 2;
    } else {
      i++;
      j++;
    }
  }

  return edits + (a.length - i) + (b.length - j) <= 1;
};

/**
 * Swaps a word the chatbot doesn't know for a keyword word one typo away. Known
 * words are never touched, so "contract" stays "contract" rather than becoming
 * "contact".
 */
const correctTypo = (word: string, vocabulary: ReadonlySet<string>) => {
  if (vocabulary.has(word)) return word;

  for (const known of vocabulary) {
    // Same first letter: people rarely mistype it, and it stops "great" becoming "create".
    if (
      known.length >= MIN_TYPO_LENGTH &&
      known[0] === word[0] &&
      isOneTypoAway(word, known)
    ) {
      return known;
    }
  }

  return word;
};

/** How many of the message's words are covered by the intent's keywords. */
const scoreIntent = (words: string[], intent: ChatIntent) => {
  const covered = new Set<number>();

  for (const keyword of intent.keywords) {
    const phrase = tokenize(keyword);

    for (let start = 0; start + phrase.length <= words.length; start++) {
      if (phrase.every((word, offset) => words[start + offset] === word)) {
        phrase.forEach((_, offset) => covered.add(start + offset));
      }
    }
  }

  return covered.size;
};

/**
 * Picks the intent covering the most words of `message`, after correcting words
 * with one typo. Ties go to the intent listed first.
 *
 * @returns The best intent, or `null` when no keyword matches at all.
 */
export const matchIntent = (
  message: string,
  intents: readonly ChatIntent[],
): ChatIntent | null => {
  const vocabulary = new Set(
    intents.flatMap((intent) => intent.keywords.flatMap(tokenize)),
  );
  const words = tokenize(message).map((word) => correctTypo(word, vocabulary));
  let best: ChatIntent | null = null;
  let bestScore = 0;

  for (const intent of intents) {
    const score = scoreIntent(words, intent);

    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }

  return best;
};
