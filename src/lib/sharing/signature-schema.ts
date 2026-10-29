import { z } from "zod";

/** The longest typed signature accepted; the Firestore rules enforce the same bound. */
export const MAX_SIGNATURE_LENGTH = 200;

/** A typed signature: free text, trimmed and non-empty, for the form and the route alike. */
export const typedSignatureSchema = z
  .string()
  .trim()
  .min(1, "Type your name to sign.")
  .max(MAX_SIGNATURE_LENGTH);
