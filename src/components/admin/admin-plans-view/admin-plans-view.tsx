"use client";

import { ArrowRightIcon, CheckCircleIcon, ClockCounterClockwiseIcon } from "@phosphor-icons/react";

import { AdminQueryState } from "@/components/admin/admin-query-state/admin-query-state";
import { AdminSampleNotice } from "@/components/admin/admin-sample-notice/admin-sample-notice";
import { AdminStatusPill } from "@/components/admin/admin-status-pill/admin-status-pill";
import { roleBadgeVariants } from "@/components/admin/admin-users-view/admin-users-view";
import { Badge } from "@/components/commons/badge/badge";
import { DashboardList } from "@/components/dashboard/dashboard-list/dashboard-list";
import { DashboardListRow } from "@/components/dashboard/dashboard-list-row/dashboard-list-row";
import { SettingsCard } from "@/components/dashboard/settings-card/settings-card";
import { useAdminUsersQuery } from "@/hooks/queries/use-admin";
import { formatCount, formatDateTime, formatShare } from "@/lib/admin/format";
import { listSamplePlanChanges, type PlanChangeSource } from "@/lib/admin/plans/dummy-data";
import { type AdminStatusTone } from "@/lib/admin/status-tone";
import { countByRole } from "@/lib/admin/users/user-stats";
import { iconSize } from "@/lib/icons";
import { getPlanFeatures, planNames } from "@/lib/subscription/plan-access";
import type { UserRole } from "@/types/auth";

/** The customer plans, in upgrade order. Special and staff accounts are counted on the Users page. */
const customerPlans: UserRole[] = ["free", "silver", "gold"];

const planOrder: Record<UserRole, number> = { free: 0, gold: 2, silver: 1, special: 3, superadmin: 4 };

const sourceLabels: Record<PlanChangeSource, string> = {
  admin: "By an administrator",
  promotion: "Promo code",
  user: "By the customer",
};

const columns = [
  { className: "col-span-4", label: "Account" },
  { className: "col-span-3", label: "Change" },
  { className: "col-span-3", label: "How" },
  { className: "col-span-2 text-right", label: "When" },
];

/**
 * The admin Plans page: how many accounts are on each customer plan, what each
 * plan includes, and the latest plan changes.
 *
 * Counts are real (from `users`) and features come from the same rules the app
 * enforces (`getPlanFeatures`). The change history is sample data until plan
 * changes are logged.
 */
export const AdminPlansView = () => {
  const users = useAdminUsersQuery();
  const accounts = users.data ?? [];
  const counts = countByRole(accounts);
  const changes = listSamplePlanChanges();

  return (
    <AdminQueryState
      errorTitle="We couldn't load plans"
      isError={users.isError}
      isPending={users.isPending}
      loadingMessage="Loading plans"
      onRetry={() => void users.refetch()}
    >
      <div className="admin-plans-view grid gap-4">
        <div className="grid gap-4 lg:grid-cols-3">
          {customerPlans.map((role) => (
            <section
              className="flex flex-col gap-4 rounded-box border border-steel-mist bg-base-100 p-5 sm:p-6"
              key={role}
            >
              <div className="flex items-center justify-between gap-3">
                <Badge variant={roleBadgeVariants[role]}>{planNames[role]}</Badge>
                <span className="text-sm text-nox-noir/60">{formatShare(counts[role], accounts.length)} of accounts</span>
              </div>
              <p className="font-title text-4xl font-bold leading-tight text-nox-noir">
                {formatCount(counts[role])}
                <span className="ml-2 text-sm font-semibold text-nox-noir/60">accounts</span>
              </p>
              <ul className="grid gap-1.5 border-t border-steel-mist/70 pt-4 text-sm">
                {getPlanFeatures(role)
                  .filter((feature) => feature.included)
                  .map((feature) => (
                    <li
                      className="flex items-center gap-2 text-nox-noir/80"
                      key={feature.label}
                    >
                      <CheckCircleIcon
                        aria-hidden
                        className="shrink-0 text-success"
                        size={iconSize.inline}
                        weight="fill"
                      />
                      {feature.label}
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>

        <SettingsCard
          description="Upgrades, downgrades and promo unlocks, newest first."
          icon={ClockCounterClockwiseIcon}
          title="Plan changes"
          tone="purple"
        >
          <div className="grid gap-3">
            <AdminSampleNotice reason="Plan changes aren't logged yet, so this history is made up." />
            <DashboardList columns={columns}>
              {changes.map((change) => {
                const isUpgrade = planOrder[change.to] > planOrder[change.from];
                const tone: AdminStatusTone = isUpgrade ? "success" : "warning";

                return (
                  <DashboardListRow key={change.id}>
                    <span className="min-w-0 sm:col-span-4">
                      <span className="block truncate font-title text-sm font-bold">{change.name}</span>
                      <span className="block truncate text-xs text-nox-noir/60">{change.email}</span>
                    </span>
                    <span className="flex flex-wrap items-center gap-2 sm:col-span-3">
                      <Badge variant={roleBadgeVariants[change.from]}>{planNames[change.from]}</Badge>
                      <ArrowRightIcon
                        aria-label="to"
                        size={iconSize.inline}
                        weight="bold"
                      />
                      <Badge variant={roleBadgeVariants[change.to]}>{planNames[change.to]}</Badge>
                    </span>
                    <span className="flex flex-wrap items-center gap-2 text-sm sm:col-span-3">
                      <AdminStatusPill
                        label={isUpgrade ? "Upgrade" : "Downgrade"}
                        tone={tone}
                      />
                      <span className="text-nox-noir/70">{sourceLabels[change.source]}</span>
                    </span>
                    <time
                      className="text-sm text-nox-noir/70 sm:col-span-2 sm:text-right"
                      dateTime={new Date(change.at).toISOString()}
                    >
                      {formatDateTime(change.at)}
                    </time>
                  </DashboardListRow>
                );
              })}
            </DashboardList>
          </div>
        </SettingsCard>
      </div>
    </AdminQueryState>
  );
};

export default AdminPlansView;
