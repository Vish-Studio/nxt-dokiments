import type {
  MarketplaceTemplate,
  TemplateStyleId,
  TemplateTier,
} from "@/types/template";
import type { UserRole } from "@/types/auth";

import { classicContract } from "./classic/contract";
import { classicInvoice } from "./classic/invoice";
import { classicNda } from "./classic/nda";
import { classicProposal } from "./classic/proposal";
import { classicQuotation } from "./classic/quotation";
import { minimalContract } from "./minimal/contract";
import { minimalInvoice } from "./minimal/invoice";
import { minimalNda } from "./minimal/nda";
import { minimalProposal } from "./minimal/proposal";
import { minimalQuotation } from "./minimal/quotation";
import { modernContract } from "./modern/contract";
import { modernInvoice } from "./modern/invoice";
import { modernNda } from "./modern/nda";
import { modernProposal } from "./modern/proposal";
import { modernQuotation } from "./modern/quotation";

export { documentIcons } from "./documents";
export { templateStyles } from "./styles";

export const marketplaceTemplates: MarketplaceTemplate[] = [
  classicContract,
  classicProposal,
  classicQuotation,
  classicInvoice,
  classicNda,
  modernContract,
  modernProposal,
  modernQuotation,
  modernInvoice,
  modernNda,
  minimalContract,
  minimalProposal,
  minimalQuotation,
  minimalInvoice,
  minimalNda,
];

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
  silver: 1,
  gold: 2,
};

export const tierLabels: Record<TemplateTier, string> = {
  free: "Free",
  silver: "Silver",
  gold: "Gold",
};

/** Whether a user's role unlocks a given subscription tier. */
export const canUseTier = (role: UserRole | undefined, tier: TemplateTier) =>
  roleRanks[role ?? "free"] >= tierRanks[tier];
