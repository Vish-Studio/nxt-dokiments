import type { DocumentMeta, MarketplaceTemplate, TemplateStyle } from "@/types/template";

/** Compose a marketplace template from a style and a document blueprint. */
export const createTemplate = (
  style: TemplateStyle,
  blueprint: DocumentMeta,
): MarketplaceTemplate => ({
  description: blueprint.description,
  documentType: blueprint.type,
  fields: blueprint.fields,
  id: `${style.id}-${blueprint.type}`,
  name: blueprint.name,
  style,
  tier: style.tier,
});
