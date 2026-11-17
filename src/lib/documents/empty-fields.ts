import { readLineItems } from "@/lib/market-place/line-items";
import { RECIPIENT_SIGNATURE_KEY } from "@/lib/sharing/signable";
import type { TemplateField } from "@/types/template";

/**
 * Fields that may stay empty without a warning on save.
 *
 * - `title` falls back to the template's display name, so it never prints blank.
 * - Party phone, email and BRN are optional contact details that the document
 *   hides entirely when empty (see `TemplateParties`).
 * - The recipient signature is filled in by the recipient on a shared copy,
 *   never by the author.
 */
export const optionalDocumentFieldKeys: ReadonlySet<string> = new Set([
  "title",
  "fromPhone",
  "fromEmail",
  "toPhone",
  "toEmail",
  "toBrn",
  RECIPIENT_SIGNATURE_KEY,
]);

/**
 * Whether a saved value counts as not filled in.
 *
 * Whitespace is empty, and so is a line-items value whose rows are all blank,
 * because `LineItemsEditor` stores an empty table as a JSON string rather than
 * as an empty value.
 */
export const isBlankFieldValue = (value: string | undefined) => {
  const text = value?.trim() ?? "";

  if (!text) {
    return true;
  }

  const rows = readLineItems(text);

  return (
    rows !== null &&
    rows.every(
      (row) => !row.description.trim() && !row.quantity.trim() && !row.price.trim(),
    )
  );
};

/**
 * The fields of a document the author has not filled in yet, in template order.
 *
 * Drives the "some fields are empty" warning and the yellow highlight in the
 * editor preview. Optional fields ({@link optionalDocumentFieldKeys}) are never
 * returned. Pure: it reads `values` and never changes them.
 *
 * @param fields - The template's fields (a document's frozen snapshot fields).
 * @param values - The current draft values, keyed by field key.
 * @returns The empty required fields; an empty array when everything is filled.
 *
 * @example
 * getEmptyDocumentFields(template.fields, draftValues).map((field) => field.label);
 * // ["Client address", "Agreement reference"]
 */
export const getEmptyDocumentFields = (
  fields: readonly TemplateField[],
  values: Readonly<Record<string, string>>,
): TemplateField[] =>
  fields.filter(
    (field) =>
      !optionalDocumentFieldKeys.has(field.key) &&
      isBlankFieldValue(values[field.key]),
  );
