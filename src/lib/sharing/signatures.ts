import type { ShareSignature, SharedDocument } from "@/types/sharing";

import { SENDER_SIGNATURE_KEY } from "./signable";

type SignedRecord = Pick<SharedDocument, "ownerId" | "signatures">;

/**
 * The owner's signature on a shared copy, recorded when they shared it. It is
 * keyed by their uid, like every entry in `signatures`.
 */
export const senderSignatureOf = (
  document: SignedRecord | undefined,
): ShareSignature | undefined =>
  document ? document.signatures[document.ownerId] : undefined;

/**
 * Every signature that is not the owner's. Whatever means "a recipient has
 * signed" (the status, the signed email, the bell, the lock) must read this and
 * never `signatures` directly, or the owner's entry would count as a signing.
 */
export const recipientSignatures = (
  document: SignedRecord,
): Record<string, ShareSignature> =>
  Object.fromEntries(
    Object.entries(document.signatures).filter(
      ([uid]) => uid !== document.ownerId,
    ),
  );

/** The first recipient signature, as the single-recipient views show it. */
export const recipientSignatureOf = (
  document: SignedRecord,
): ShareSignature | undefined =>
  Object.values(recipientSignatures(document))[0];

/**
 * Returns `values` with the sender signature taken from the verified record,
 * so what is rendered is what the owner signed rather than a draft that was
 * editable until sharing. Unchanged when there is no signature.
 */
export const withSenderSignature = (
  values: Record<string, string>,
  signature: ShareSignature | undefined,
): Record<string, string> =>
  signature ? { ...values, [SENDER_SIGNATURE_KEY]: signature.value } : values;
