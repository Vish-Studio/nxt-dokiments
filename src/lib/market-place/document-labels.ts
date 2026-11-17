import type { DocumentType, MarketplaceTemplate } from "@/types/template";

import { documentBlueprints } from "./documents";

/**
 * Plain-language names shown in the UI for each document type, readable by
 * individuals and businesses alike.
 *
 * Display only: `documentBlueprints[type].name` stays the canonical name that
 * is seeded into Firestore and frozen into saved document snapshots, so it
 * must not be renamed. Render names through these helpers instead.
 */
export const documentTypeLabels: Record<DocumentType, string> = {
  "change-order": "Change Request",
  contract: "Contract",
  cv: "CV",
  "contract-addendum": "Contract Update",
  "formal-business-letter": "Business Letter",
  invoice: "Invoice",
  "letter-of-intent": "Letter of Intent",
  "meeting-minutes-action-brief": "Meeting Notes",
  nda: "NDA",
  "project-status-report": "Status Report",
  proposal: "Proposal",
  "purchase-order": "Purchase Order",
  quotation: "Quotation",
  receipt: "Receipt",
  "statement-of-work": "Scope of Work",
};

export const getDocumentTypeLabel = (documentType: DocumentType) =>
  documentTypeLabels[documentType] ??
  documentBlueprints[documentType]?.name ??
  documentType;

/**
 * The name to show for a template or snapshot. Templates still carrying their
 * canonical catalog name get the plain label; custom names are kept as-is.
 */
export const getTemplateDisplayName = (
  template: Pick<MarketplaceTemplate, "documentType" | "name">,
) =>
  template.name === documentBlueprints[template.documentType]?.name
    ? getDocumentTypeLabel(template.documentType)
    : template.name;

/**
 * The document types people reach for most, in the order the marketplace's
 * "Browse by category" rail and type filter show them, straight after
 * "All templates".
 */
export const featuredDocumentTypes: readonly DocumentType[] = [
  "invoice",
  "quotation",
  "cv",
  "nda",
  "contract",
  "statement-of-work",
];

/**
 * Orders document types for category menus: {@link featuredDocumentTypes}
 * first, in their fixed order, then every other type alphabetically by its
 * {@link getDocumentTypeLabel} label.
 *
 * Returns a new array and leaves the input untouched. Types missing from the
 * input are not added, so a catalog without CVs simply skips them.
 *
 * @example
 * sortDocumentTypes(["receipt", "nda", "invoice"]); // ["invoice", "nda", "receipt"]
 */
export const sortDocumentTypes = (
  documentTypes: readonly DocumentType[],
): DocumentType[] => {
  const rank = (documentType: DocumentType) => {
    const index = featuredDocumentTypes.indexOf(documentType);

    return index === -1 ? featuredDocumentTypes.length : index;
  };

  return [...documentTypes].sort(
    (first, second) =>
      rank(first) - rank(second) ||
      getDocumentTypeLabel(first).localeCompare(getDocumentTypeLabel(second)),
  );
};
