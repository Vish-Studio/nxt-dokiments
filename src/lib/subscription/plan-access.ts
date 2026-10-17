import {
  canUseTier,
  FREE_SAVED_TEMPLATE_LIMIT,
  getSavedTemplateLimit,
  tierLabels,
} from "@/lib/market-place";
import { templateStyles } from "@/lib/market-place/styles";
import type { UserRole } from "@/types/auth";

export interface PlanFeature {
  /** Whether this account has it right now. */
  included: boolean;
  label: string;
  /** Short qualifier, e.g. which plan unlocks a locked feature. */
  note?: string;
}

export const planNames: Record<UserRole, string> = {
  free: "Free",
  gold: "Gold",
  silver: "Silver",
  special: "Special",
  superadmin: "Super admin",
};

/** "Classic designs" → "Classic templates". */
const styleFeatureLabel = (name: string) =>
  `${name.replace(/\s+designs$/i, "")} templates`;

/**
 * What an account can actually do on its plan, built from the same rules the app
 * enforces (`canUseTier`, `getSavedTemplateLimit`) rather than marketing copy, so
 * the list can never promise or withhold something the product disagrees with.
 *
 * Roles above Gold (special, superadmin) pass every check, so they come out with
 * everything unlocked without any special-casing here.
 */
export const getPlanFeatures = (role: UserRole): PlanFeature[] => {
  const savedLimit = getSavedTemplateLimit(role);

  return [
    { included: true, label: "Create unlimited documents" },
    { included: true, label: "Download documents as PDF" },
    { included: true, label: "Save and reuse client details" },
    ...templateStyles.map((style) => {
      const included = canUseTier(role, style.tier);

      return {
        included,
        label: styleFeatureLabel(style.name),
        note: included ? undefined : `${tierLabels[style.tier]} plan`,
      };
    }),
    Number.isFinite(savedLimit)
      ? {
          included: true,
          label: `Save up to ${FREE_SAVED_TEMPLATE_LIMIT} templates`,
        }
      : { included: true, label: "Unlimited saved templates" },
  ];
};

/** Whether a higher plan would unlock anything for this account. */
export const canUpgrade = (role: UserRole) =>
  getPlanFeatures(role).some((feature) => !feature.included) ||
  Number.isFinite(getSavedTemplateLimit(role));
