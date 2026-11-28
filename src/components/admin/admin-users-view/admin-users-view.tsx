"use client";

import { UsersIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AdminQueryState } from "@/components/admin/admin-query-state/admin-query-state";
import { Avatar } from "@/components/commons/avatar/avatar";
import { Badge, type BadgeVariant } from "@/components/commons/badge/badge";
import CollectionToolbar from "@/components/commons/collection-toolbar/collection-toolbar";
import { EmptyState } from "@/components/commons/empty-state/empty-state";
import { TabMenu } from "@/components/commons/tab-menu/tab-menu";
import { DashboardList } from "@/components/dashboard/dashboard-list/dashboard-list";
import { DashboardListRow } from "@/components/dashboard/dashboard-list-row/dashboard-list-row";
import { useAdminUsersQuery } from "@/hooks/queries/use-admin";
import { formatCount, formatDate, pluralise } from "@/lib/admin/format";
import { type AccountSort, countByRole, filterAccounts } from "@/lib/admin/users/user-stats";
import { iconSize } from "@/lib/icons";
import { planNames } from "@/lib/subscription/plan-access";
import type { UserRole } from "@/types/auth";

/** Badge colour per plan, the same pills the app's profile and plan cards use. */
export const roleBadgeVariants: Record<UserRole, BadgeVariant> = {
  free: "free",
  gold: "gold",
  silver: "silver",
  special: "special",
  superadmin: "superadmin",
};

const tabRoles: Array<UserRole | "all"> = ["all", "free", "silver", "gold", "special", "superadmin"];

const columns = [
  { className: "col-span-5", label: "Account" },
  { className: "col-span-2", label: "Plan" },
  { className: "col-span-2", label: "Sign-in" },
  { className: "col-span-3 text-right", label: "Joined" },
];

const sortOptions = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Name A to Z", value: "name" },
];

/**
 * The admin Users list: every account, with plan tabs, search and sort, each row
 * opening the account's page.
 *
 * Real data from `GET /api/admin/users`. Plan changes and suspensions are not
 * offered: nothing records admin actions yet, and changing a customer's plan
 * without a trail is the one thing an admin tool must not do.
 */
export const AdminUsersView = () => {
  const router = useRouter();
  const users = useAdminUsersQuery();
  const [role, setRole] = useState<UserRole | "all">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<AccountSort>("newest");

  const accounts = useMemo(() => users.data ?? [], [users.data]);
  const counts = countByRole(accounts);
  const visible = useMemo(
    () => filterAccounts(accounts, { role, search, sort }),
    [accounts, role, search, sort],
  );

  return (
    <AdminQueryState
      errorTitle="We couldn't load accounts"
      isError={users.isError}
      isPending={users.isPending}
      loadingMessage="Loading accounts"
      onRetry={() => void users.refetch()}
    >
      <div className="admin-users-view flex min-h-0 flex-1 flex-col gap-2">
        <TabMenu
          ariaLabel="Filter accounts by plan"
          className="mb-2 self-start"
          items={tabRoles.map((id) => ({
            badge: formatCount(id === "all" ? accounts.length : counts[id]),
            id,
            label: id === "all" ? "All" : planNames[id],
          }))}
          onChange={(id) => setRole(id as UserRole | "all")}
          value={role}
        />

        <CollectionToolbar
          appearance="compact"
          ariaLabel="Search and sort accounts"
          canReset={Boolean(search) || sort !== "newest"}
          onReset={() => {
            setSearch("");
            setSort("newest");
          }}
          onSearch={setSearch}
          onSort={(value) => setSort(value as AccountSort)}
          resultLabel={pluralise(visible.length, "account")}
          search={search}
          searchLabel="Search accounts"
          searchPlaceholder="Search by name, email, company or UID"
          sort={sort}
          sortOptions={sortOptions}
        />

        {visible.length === 0 ? (
          <EmptyState
            description={search ? "Try another name, email or UID." : "No account is on this plan yet."}
            icon={<UsersIcon aria-hidden size={iconSize.feature} weight="bold" />}
            title={search ? "No matching accounts" : "No accounts here"}
          />
        ) : (
          <DashboardList columns={columns}>
            {visible.map((account) => (
              <DashboardListRow
                key={account.uid}
                onSelect={() => router.push(`/admin/users/${account.uid}`)}
                selectLabel={`Open ${account.displayName}`}
              >
                <div className="pointer-events-none relative z-10 flex min-w-0 items-center gap-3 sm:col-span-5">
                  <Avatar
                    name={account.displayName}
                    size="md"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-title text-sm font-bold text-nox-noir">
                      {account.displayName}
                    </span>
                    <span className="block truncate text-xs text-nox-noir/60">
                      {account.email}
                      {account.companyName ? ` · ${account.companyName}` : ""}
                    </span>
                  </span>
                </div>
                {/* One line on phones; `sm:contents` hands the three cells back to the row's grid on desktop. */}
                <div className="pointer-events-none relative z-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-nox-noir/70 sm:contents">
                  <span className="flex items-center sm:col-span-2">
                    <Badge variant={roleBadgeVariants[account.role]}>{planNames[account.role]}</Badge>
                  </span>
                  <span className="sm:col-span-2">{account.provider === "google" ? "Google" : "Email"}</span>
                  <span className="sm:col-span-3 sm:text-right">
                    <span className="sm:hidden">Joined </span>
                    {formatDate(account.createdAt)}
                  </span>
                </div>
              </DashboardListRow>
            ))}
          </DashboardList>
        )}
      </div>
    </AdminQueryState>
  );
};

export default AdminUsersView;
