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

export const templateStyleIds = ["classic", "modern", "brutalist", "minimalist"] as const;

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

/** A concrete document the user created from one of their saved templates. */
export type UserDocument = {
  createdAt: number;
  id: string;
  name: string;
  templateId: string;
  updatedAt: number;
  values: Record<string, string>;
};
