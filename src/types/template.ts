export const documentTypes = [
  "contract",
  "proposal",
  "nda",
  "statement-of-work",
  "invoice",
  "quotation",
  "receipt",
  "change-order",
  "contract-addendum",
  "letter-of-intent",
  "project-status-report",
  "meeting-minutes-action-brief",
  "formal-business-letter",
  "purchase-order",
] as const;

export type DocumentType = (typeof documentTypes)[number];

export const templateStyleIds = [
  "classic",
  "modern",
  "brutalist",
  "minimalist",
] as const;

export type TemplateStyleId = (typeof templateStyleIds)[number];

export type TemplateTier = "free" | "silver" | "gold";

export type TemplateFieldType = "text" | "textarea" | "date" | "number";

export type TemplateField = {
  key: string;
  label: string;
  placeholder?: string;
  type: TemplateFieldType;
};

export type TemplateStyle = {
  description: string;
  id: TemplateStyleId;
  name: string;
  tier: TemplateTier;
};

export type DocumentMeta = {
  description: string;
  fields: TemplateField[];
  name: string;
  type: DocumentType;
};

/** A concrete marketplace offering = a document type rendered in a given style. */
export type MarketplaceTemplate = {
  description: string;
  documentType: DocumentType;
  fields: TemplateField[];
  id: string;
  name: string;
  style: TemplateStyle;
  tier: TemplateTier;
};

/** A template a user has added to their account (ownership only — no values). */
export type SavedTemplate = {
  savedAt: number;
  savedId: string;
  templateId: string;
};

/**
 * A frozen copy of a template's shape, taken at the moment a `UserDocument` was
 * created from it. Rendering/exporting a document always uses this, never a live
 * lookup — so a later edit or deactivation of the source template in the catalog
 * cannot retroactively change or break a document a user has already finished.
 */
export type TemplateSnapshot = {
  description: string;
  documentType: DocumentType;
  fields: TemplateField[];
  name: string;
  style: TemplateStyle;
};

/**
 * Reconstructs a `MarketplaceTemplate`-shaped object from a `TemplateSnapshot`,
 * for components that render a template but don't care whether it's still live
 * in the catalog (`TemplatePreviewDialog`, `DocumentExportDialog`). `tier` is
 * always the snapshot's style's tier — a template's tier is never independent
 * of its style, both in the live catalog and in a frozen snapshot.
 */
export const snapshotToMarketplaceTemplate = (
  snapshot: TemplateSnapshot,
  templateId: string,
): MarketplaceTemplate => ({
  description: snapshot.description,
  documentType: snapshot.documentType,
  fields: snapshot.fields,
  id: templateId,
  name: snapshot.name,
  style: snapshot.style,
  tier: snapshot.style.tier,
});

/** A concrete document the user created from one of their saved templates. */
export type UserDocument = {
  createdAt: number;
  id: string;
  name: string;
  /** ID of the template this document was created from — kept only for "recreate from this template" convenience. */
  templateId: string;
  updatedAt: number;
  values: Record<string, string>;
  /**
   * The template's shape as it was at creation time. See `TemplateSnapshot`.
   * Optional because documents created before this field existed (or via the
   * legacy localStorage-only `documents-store.ts`, not yet wired to the API)
   * predate it — new documents created through `POST /api/documents` always have one.
   */
  templateSnapshot?: TemplateSnapshot;
};
