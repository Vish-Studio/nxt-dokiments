import type { TemplateField } from "@/types/template";

/** The field a counterparty signs; only documents with it can be signed once shared. */
export const RECIPIENT_SIGNATURE_KEY = "recipientSignature";

/**
 * Whether a document has somewhere for a recipient to sign. Every document can
 * be shared; one that is not signable is shared view-only, so the recipient can
 * open it but not sign it. Takes anything with `fields` (a template snapshot or
 * a marketplace template); a missing snapshot is not signable.
 */
export const isSignableDocument = (
  template: { fields: readonly TemplateField[] } | null | undefined,
): boolean =>
  template?.fields.some((field) => field.key === RECIPIENT_SIGNATURE_KEY) ??
  false;

/**
 * Whether a shared copy is view-only: its layout is known and has no recipient
 * signature. A copy whose layout is missing is not called view-only, because
 * nothing says what it was shared for.
 */
export const isViewOnlyShare = (document: {
  templateSnapshot?: { fields: readonly TemplateField[] };
}): boolean =>
  Boolean(document.templateSnapshot) &&
  !isSignableDocument(document.templateSnapshot);
