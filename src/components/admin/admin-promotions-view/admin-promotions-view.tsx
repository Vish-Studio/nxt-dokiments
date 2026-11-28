"use client";

import { TicketIcon } from "@phosphor-icons/react";

import { AdminSampleNotice } from "@/components/admin/admin-sample-notice/admin-sample-notice";
import { AdminStatusPill } from "@/components/admin/admin-status-pill/admin-status-pill";
import { DashboardList } from "@/components/dashboard/dashboard-list/dashboard-list";
import { DashboardListRow } from "@/components/dashboard/dashboard-list-row/dashboard-list-row";
import { SettingsCard } from "@/components/dashboard/settings-card/settings-card";
import { formatCount, formatDateTime } from "@/lib/admin/format";
import { getSamplePromoUsage } from "@/lib/admin/promotions/dummy-data";
import { activePromoCode, promoCodes } from "@/lib/promo/promo-codes";

const redemptionColumns = [
  { className: "col-span-5", label: "Account" },
  { className: "col-span-4", label: "Campaign" },
  { className: "col-span-3 text-right", label: "Redeemed" },
];

/**
 * The admin Promotions page: each campaign in the promo registry and how it
 * has been used.
 *
 * Campaigns are real (`src/lib/promo/promo-codes.ts`, the same list sign-up
 * checks codes against) and read-only: adding one is a code change, as the
 * registry's own comment explains. Redemption counts are sample data until a
 * per-campaign counter exists.
 */
export const AdminPromotionsView = () => {
  const campaigns = promoCodes.map((promo) => ({ promo, usage: getSamplePromoUsage(promo.id) }));
  const recent = campaigns
    .flatMap(({ promo, usage }) => usage.recent.map((redemption) => ({ ...redemption, campaign: promo.label })))
    .sort((a, b) => b.at - a.at);

  return (
    <div className="admin-promotions-view grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.map(({ promo, usage }) => (
          <SettingsCard
            action={
              <AdminStatusPill
                label={promo.id === activePromoCode.id ? "Live" : "Inactive"}
                tone={promo.id === activePromoCode.id ? "success" : "neutral"}
              />
            }
            description={promo.description}
            icon={TicketIcon}
            key={promo.id}
            title={promo.label}
            tone="golden"
          >
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-3 rounded-field bg-base-200 px-3 py-2.5">
                <dt className="text-nox-noir/70">Code</dt>
                <dd>
                  <code className="rounded-md border border-dashed border-nox-noir px-2 py-0.5 font-mono text-xs font-bold">{promo.code}</code>
                </dd>
              </div>
              <div className="flex justify-between gap-3 rounded-field bg-base-200 px-3 py-2.5">
                <dt className="text-nox-noir/70">Campaign ID</dt>
                <dd className="font-mono text-xs">{promo.id}</dd>
              </div>
              <div className="flex justify-between gap-3 rounded-field bg-base-200 px-3 py-2.5">
                <dt className="text-nox-noir/70">Redemptions (sample)</dt>
                <dd className="font-title font-bold">{formatCount(usage.redeemed)}</dd>
              </div>
            </dl>
          </SettingsCard>
        ))}
      </div>

      <p className="text-sm text-nox-noir/60">
        Campaigns are defined in code (<code className="font-mono text-xs">src/lib/promo/promo-codes.ts</code>). Adding or ending one is a code change and a deploy.
      </p>

      <SettingsCard
        icon={TicketIcon}
        title="Recent redemptions"
        tone="teal"
      >
        <div className="grid gap-3">
          <AdminSampleNotice reason="Redemptions are stored under each account and can't be counted across accounts yet." />
          <DashboardList columns={redemptionColumns}>
            {recent.map((redemption) => (
              <DashboardListRow key={`${redemption.email}-${redemption.at}`}>
                <span className="min-w-0 sm:col-span-5">
                  <span className="block truncate font-title text-sm font-bold">{redemption.name}</span>
                  <span className="block truncate text-xs text-nox-noir/60">{redemption.email}</span>
                </span>
                <span className="text-sm sm:col-span-4">{redemption.campaign}</span>
                <time
                  className="text-sm text-nox-noir/70 sm:col-span-3 sm:text-right"
                  dateTime={new Date(redemption.at).toISOString()}
                >
                  {formatDateTime(redemption.at)}
                </time>
              </DashboardListRow>
            ))}
          </DashboardList>
        </div>
      </SettingsCard>
    </div>
  );
};

export default AdminPromotionsView;
