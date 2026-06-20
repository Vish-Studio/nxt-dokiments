import type {
  MarketplaceTemplate,
  TemplateStyleId,
  TemplateTier,
} from "@/types/template";
import type { UserRole } from "@/types/auth";

import { documentBlueprints } from "./documents";
import { templateStyles } from "./styles";

export { documentIcons } from "./documents";
export { templateStyles } from "./styles";
export { getSampleValues, sampleValues } from "./sample-data";

export const marketplaceTemplates: MarketplaceTemplate[] = templateStyles.flatMap((style) =>
  Object.values(documentBlueprints).map((blueprint) => ({
    description: blueprint.description,
    documentType: blueprint.type,
    fields: blueprint.fields,
    id: `${style.id}-${blueprint.type}`,
    name: blueprint.name,
    style,
    tier: style.tier,
  })),
);

export const getTemplateById = (templateId: string): MarketplaceTemplate | undefined =>
  marketplaceTemplates.find((template) => template.id === templateId);

export const listTemplatesByStyle = (styleId: TemplateStyleId): MarketplaceTemplate[] =>
  marketplaceTemplates.filter((template) => template.style.id === styleId);

const roleRanks: Record<UserRole, number> = {
  free: 0,
  silver: 1,
  gold: 2,
  special: 3,
  superadmin: 4,
};

const tierRanks: Record<TemplateTier, number> = {
  free: 0,
  gold: 2,
  silver: 1,
};

export const tierLabels: Record<TemplateTier, string> = {
  free: "Free",
  gold: "Gold",
  silver: "Silver",
};

/**
 * Tier badge colours. Free uses the conventional green; paid tiers mirror their
 * subscription plan-card background (Silver = golden accent, Gold = noir).
 */
export const tierBadgeClasses: Record<TemplateTier, string> = {
  free: "bg-success text-success-content",
  gold: "bg-nox-noir text-white",
  silver: "bg-golden-harvest text-nox-noir",
};

/** Whether a user's role unlocks a given subscription tier. */
export const canUseTier = (role: UserRole | undefined, tier: TemplateTier) =>
  roleRanks[role ?? "free"] >= tierRanks[tier];

/** Free accounts may keep at most this many saved templates. */
export const FREE_SAVED_TEMPLATE_LIMIT = 2;

/** Max number of templates a user may save to their account (free is capped). */
export const getSavedTemplateLimit = (role: UserRole | undefined) =>
  !role || role === "free" ? FREE_SAVED_TEMPLATE_LIMIT : Number.POSITIVE_INFINITY;
