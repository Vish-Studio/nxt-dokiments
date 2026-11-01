import type { TemplateField } from "@/types/template";

/** The field a counterparty signs; only documents with it can be shared for signature. */
export const RECIPIENT_SIGNATURE_KEY = "recipientSignature";

/**
 * Whether a document has somewhere for a recipient to sign, so sharing it makes
 * sense. Takes anything with `fields` (a template snapshot or a marketplace
 * template); a missing snapshot is not signable.
 */
export const isSignableDocument = (
  template: { fields: readonly TemplateField[] } | null | undefined,
): boolean =>
  template?.fields.some((field) => field.key === RECIPIENT_SIGNATURE_KEY) ??
  false;
