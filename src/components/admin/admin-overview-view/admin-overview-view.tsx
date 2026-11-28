"use client";

import {
  ChartBarIcon,
  ClockCounterClockwiseIcon,
  CreditCardIcon,
  FileTextIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import Link from "next/link";

import { AdminBarList } from "@/components/admin/admin-bar-list/admin-bar-list";
import { AdminColumnChart } from "@/components/admin/admin-column-chart/admin-column-chart";
import { AdminQueryState } from "@/components/admin/admin-query-state/admin-query-state";
import { AdminSampleNotice } from "@/components/admin/admin-sample-notice/admin-sample-notice";
import { AdminStatTile } from "@/components/admin/admin-stat-tile/admin-stat-tile";
import { Avatar } from "@/components/commons/avatar/avatar";
import { SettingsCard } from "@/components/dashboard/settings-card/settings-card";
import { useAdminFeedbackQuery, useAdminUsersQuery } from "@/hooks/queries/use-admin";
import { listSampleAuditEntries } from "@/lib/admin/audit/dummy-data";
import { getDocumentStats } from "@/lib/admin/documents/dummy-data";
import { formatCount, formatDateTime, formatDayMonth, formatShare, pluralise } from "@/lib/admin/format";
import { countByRole, countJoinedSince, countPaidAccounts, weeklySignups } from "@/lib/admin/users/user-stats";
import { planNames } from "@/lib/subscription/plan-access";
import type { UserRole } from "@/types/auth";

const WEEK_MS = 7 * 86_400_000;

/** Plans in the order a customer moves through them; staff and complimentary last. */
const planOrder: UserRole[] = ["free", "silver", "gold", "special", "superadmin"];

/**
 * The admin Overview: KPI tiles, sign-ups, plan mix, document mix, what needs a
 * look and the latest admin actions.
 *
 * Accounts and feedback are real (`/api/admin/*`). Document volume and the
 * admin actions are sample data until those collections exist, and their cards
 * say so.
 */
export const AdminOverviewView = () => {
  const users = useAdminUsersQuery();
  const feedback = useAdminFeedbackQuery();
  const documents = getDocumentStats();
  const recentActions = listSampleAuditEntries().slice(0, 4);

  const accounts = users.data ?? [];
  const entries = feedback.data ?? [];
  // "Now" is when accounts were loaded, so every number agrees with the data on screen.
  const now = users.dataUpdatedAt;
  const roleCounts = countByRole(accounts);
  const paid = countPaidAccounts(accounts);
  const newThisWeek = countJoinedSince(accounts, now - WEEK_MS);
  const signups = weeklySignups(accounts, now, 12);
  const problems = entries.filter((entry) => entry.type === "problem");
  const lastMonthDocuments = documents.daily.reduce((sum, day) => sum + day.count, 0);

  return (
    <AdminQueryState
      errorTitle="We couldn't load the overview"
      isError={users.isError || feedback.isError}
      isPending={users.isPending || feedback.isPending}
      loadingMessage="Loading the overview"
      onRetry={() => {
        void users.refetch();
        void feedback.refetch();
      }}
    >
      <div className="admin-overview-view grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatTile
            href="/admin/users"
            label="Accounts"
            note={`${pluralise(newThisWeek, "new account")} this week`}
            toneClassName="bg-play-blue"
            trend={newThisWeek > 0 ? "up" : "neutral"}
            value={formatCount(accounts.length)}
          />
          <AdminStatTile
            href="/admin/plans"
            label="Paid subscribers"
            note={`${formatShare(paid, accounts.length)} of accounts on Silver or Gold`}
            toneClassName="bg-play-purple"
            value={formatCount(paid)}
          />
          <AdminStatTile
            href="/admin/feedback"
            label="Feedback received"
            note={pluralise(problems.length, "problem report")}
            toneClassName="bg-golden-harvest"
            trend={problems.length > 0 ? "down" : "neutral"}
            value={formatCount(entries.length)}
          />
          <AdminStatTile
            href="/admin/documents"
            label="Documents, 30 days"
            note="Sample data"
            toneClassName="bg-play-pink"
            value={formatCount(lastMonthDocuments)}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <SettingsCard
            className="xl:col-span-2"
            description={`${pluralise(signups.reduce((sum, week) => sum + week.count, 0), "sign-up")} in the last 12 weeks.`}
            icon={ChartBarIcon}
            title="New sign-ups per week"
            tone="blue"
          >
            <AdminColumnChart
              items={signups.map((week) => ({
                label: formatDayMonth(week.weekStart),
                title: `Week of ${formatDayMonth(week.weekStart)}: ${pluralise(week.count, "sign-up")}`,
                value: week.count,
              }))}
              label="New sign-ups per week"
              labelEvery={2}
            />
          </SettingsCard>

          <SettingsCard
            action={
              <Link
                className="font-title text-sm font-bold text-nox-noir underline-offset-4 hover:underline"
                href="/admin/plans"
              >
                View plans
              </Link>
            }
            description="Every account, by plan."
            icon={CreditCardIcon}
            title="Who is on which plan"
            tone="purple"
          >
            <AdminBarList
              items={planOrder.map((role) => ({
                label: planNames[role],
                note: formatShare(roleCounts[role], accounts.length),
                value: roleCounts[role],
              }))}
              label="Accounts by plan"
            />
          </SettingsCard>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <SettingsCard
            description="Last 30 days."
            icon={FileTextIcon}
            title="Documents by type"
            tone="pink"
          >
            <div className="grid gap-4">
              <AdminSampleNotice reason="Documents are private to each account, so they can't be counted across accounts yet." />
              <AdminBarList
                barClassName="bg-play-purple"
                items={documents.types.map((type) => ({ label: type.label, value: type.count }))}
                label="Documents by type"
              />
            </div>
          </SettingsCard>

          <div className="grid content-start gap-4">
            <SettingsCard
              description="Things waiting on an administrator."
              icon={WarningCircleIcon}
              title="Needs attention"
              tone="golden"
            >
              <ul className="grid gap-2">
                <li>
                  <Link
                    className="flex items-center gap-3 rounded-box bg-base-200 p-3 text-sm transition-colors hover:bg-steel-mist/40"
                    href="/admin/feedback"
                  >
                    <span className="grid h-8 min-w-11 place-items-center rounded-field bg-nox-noir px-2 font-title font-bold text-white">
                      {formatCount(problems.length)}
                    </span>
                    <span className="flex-1">Problem reports in the feedback inbox</span>
                  </Link>
                </li>
                <li>
                  <Link
                    className="flex items-center gap-3 rounded-box bg-base-200 p-3 text-sm transition-colors hover:bg-steel-mist/40"
                    href="/admin/users"
                  >
                    <span className="grid h-8 min-w-11 place-items-center rounded-field bg-nox-noir px-2 font-title font-bold text-white">
                      {formatCount(newThisWeek)}
                    </span>
                    <span className="flex-1">New accounts this week</span>
                  </Link>
                </li>
              </ul>
            </SettingsCard>

            <SettingsCard
              action={
                <Link
                  className="font-title text-sm font-bold text-nox-noir underline-offset-4 hover:underline"
                  href="/admin/audit"
                >
                  Audit log
                </Link>
              }
              icon={ClockCounterClockwiseIcon}
              title="Recent admin actions"
              tone="teal"
            >
              <div className="grid gap-3">
                <AdminSampleNotice reason="Nothing records admin actions yet." />
                <ul className="grid gap-3">
                  {recentActions.map((entry) => (
                    <li
                      className="flex items-center gap-3 text-sm"
                      key={entry.id}
                    >
                      <Avatar
                        name={entry.adminName}
                        size="sm"
                      />
                      <span className="min-w-0 flex-1">
                        <b className="font-title">{entry.adminName}</b> {entry.action.toLowerCase()} · {entry.target}
                      </span>
                      <time
                        className="shrink-0 text-xs text-nox-noir/60"
                        dateTime={new Date(entry.at).toISOString()}
                      >
                        {formatDateTime(entry.at)}
                      </time>
                    </li>
                  ))}
                </ul>
              </div>
            </SettingsCard>
          </div>
        </div>
      </div>
    </AdminQueryState>
  );
};

export default AdminOverviewView;
