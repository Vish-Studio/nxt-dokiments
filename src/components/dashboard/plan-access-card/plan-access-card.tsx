import {
  CheckCircleIcon,
  CrownSimpleIcon,
  LockSimpleIcon,
} from "@phosphor-icons/react";

import { Badge } from "@/components/commons/badge/badge";
import { LinkButton } from "@/components/commons/link-button/link-button";
import { SettingsCard } from "@/components/dashboard/settings-card/settings-card";
import {
  canUpgrade,
  getPlanFeatures,
  planNames,
} from "@/lib/subscription/plan-access";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

export interface PlanAccessCardProps {
  role: UserRole;
}

/**
 * Settings → Plan: the account's current plan and exactly what it can use, from
 * `getPlanFeatures` — included features ticked, locked ones greyed with the plan
 * that unlocks them. Offers an upgrade only while one would unlock something, so
 * a superadmin sees the whole list unlocked and no upsell.
 */
export const PlanAccessCard = ({ role }: PlanAccessCardProps) => {
  const features = getPlanFeatures(role);
  const unlocked = features.filter((feature) => feature.included).length;

  return (
    <SettingsCard
      action={<Badge variant={role}>{planNames[role]} plan</Badge>}
      className="plan-access-card"
      description={`${unlocked} of ${features.length} features unlocked on your plan.`}
      icon={CrownSimpleIcon}
      title="Your plan"
      tone="golden"
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {features.map((feature) => (
          <li
            className={cn(
              "flex items-center gap-3 rounded-field border px-4 py-3 text-sm",
              feature.included
                ? "border-steel-mist bg-base-100 font-medium text-nox-noir"
                : "border-dashed border-steel-mist bg-base-200/60 text-nox-noir/45",
            )}
            key={feature.label}
          >
            {feature.included ? (
              <CheckCircleIcon
                aria-label="Included"
                className="shrink-0 text-success"
                size={18}
                weight="fill"
              />
            ) : (
              <LockSimpleIcon
                aria-label="Locked"
                className="shrink-0"
                size={18}
                weight="bold"
              />
            )}
            <span className="min-w-0 flex-1">{feature.label}</span>
            {feature.note ? (
              <span className="shrink-0 text-xs font-semibold">
                {feature.note}
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-steel-mist pt-5">
        {canUpgrade(role) ? (
          <>
            <p className="text-sm text-nox-noir/60">
              Unlock more template styles and an unlimited library.
            </p>
            <LinkButton
              href="/subscription"
              size="sm"
            >
              Upgrade plan
            </LinkButton>
          </>
        ) : (
          <p className="text-sm font-medium text-nox-noir/70">
            Every feature is unlocked on your account.
          </p>
        )}
      </div>
    </SettingsCard>
  );
};

export default PlanAccessCard;
