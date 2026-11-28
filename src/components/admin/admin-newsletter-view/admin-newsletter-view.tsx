"use client";

import { DownloadSimpleIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { AdminQueryState } from "@/components/admin/admin-query-state/admin-query-state";
import { AdminStatTile } from "@/components/admin/admin-stat-tile/admin-stat-tile";
import { AdminStatusPill } from "@/components/admin/admin-status-pill/admin-status-pill";
import { Button } from "@/components/commons/button/button";
import CollectionToolbar from "@/components/commons/collection-toolbar/collection-toolbar";
import { EmptyState } from "@/components/commons/empty-state/empty-state";
import { DashboardList } from "@/components/dashboard/dashboard-list/dashboard-list";
import { DashboardListRow } from "@/components/dashboard/dashboard-list-row/dashboard-list-row";
import { useAdminNewsletterQuery, useAdminUsersQuery } from "@/hooks/queries/use-admin";
import { formatCount, formatDate, pluralise } from "@/lib/admin/format";
import { toSubscribersCsv } from "@/lib/admin/newsletter/subscribers-csv";
import { iconSize } from "@/lib/icons";

const DAY_MS = 86_400_000;

const columns = [
  { className: "col-span-6", label: "Email" },
  { className: "col-span-3", label: "Account" },
  { className: "col-span-3 text-right", label: "Subscribed" },
];

/**
 * The admin Newsletter page: every subscriber, whether they also have an
 * account, and a CSV export.
 *
 * Real data from `GET /api/admin/newsletter`, which needs the superadmin read
 * rule on `newsletter` to be deployed. The export is built in the browser from
 * what is already loaded, so it never adds a server round trip or a stored file.
 */
export const AdminNewsletterView = () => {
  const newsletter = useAdminNewsletterQuery();
  const users = useAdminUsersQuery();
  const [search, setSearch] = useState("");

  const subscribers = useMemo(() => newsletter.data ?? [], [newsletter.data]);
  const accountEmails = useMemo(
    () => new Set((users.data ?? []).map((account) => account.email.toLowerCase())),
    [users.data],
  );
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return subscribers.filter((subscriber) => !query || subscriber.email.toLowerCase().includes(query));
  }, [search, subscribers]);

  // "Now" is when the list was loaded, so the count matches the data on screen.
  const now = newsletter.dataUpdatedAt;
  const lastMonth = subscribers.filter((subscriber) => (subscriber.createdAt ?? 0) >= now - 30 * DAY_MS).length;
  const withAccount = subscribers.filter((subscriber) => accountEmails.has(subscriber.email.toLowerCase())).length;

  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([toSubscribersCsv(subscribers)], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "dokiments-newsletter-subscribers.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminQueryState
      errorTitle="We couldn't load subscribers"
      isError={newsletter.isError}
      isPending={newsletter.isPending}
      loadingMessage="Loading subscribers"
      onRetry={() => void newsletter.refetch()}
    >
      <div className="admin-newsletter-view grid gap-2">
        <div className="mb-2 grid gap-4 sm:grid-cols-3">
          <AdminStatTile
            label="Subscribers"
            toneClassName="bg-play-teal"
            value={formatCount(subscribers.length)}
          />
          <AdminStatTile
            label="New, 30 days"
            toneClassName="bg-play-blue"
            trend={lastMonth > 0 ? "up" : "neutral"}
            value={formatCount(lastMonth)}
          />
          <AdminStatTile
            label="Also have an account"
            note={users.isPending ? "Checking accounts" : undefined}
            toneClassName="bg-play-purple"
            value={formatCount(withAccount)}
          />
        </div>

        <CollectionToolbar
          appearance="compact"
          ariaLabel="Search subscribers"
          canReset={Boolean(search)}
          endAction={
            <Button
              disabled={subscribers.length === 0}
              icon={<DownloadSimpleIcon aria-hidden size={iconSize.control} weight="bold" />}
              iconPosition="left"
              onClick={exportCsv}
              size="sm"
              variant="accent"
            >
              Export CSV
            </Button>
          }
          onReset={() => setSearch("")}
          onSearch={setSearch}
          onSort={() => undefined}
          resultLabel={pluralise(visible.length, "subscriber")}
          search={search}
          searchLabel="Search subscribers"
          searchPlaceholder="Search by email"
          sort="newest"
          sortOptions={[{ label: "Newest first", value: "newest" }]}
        />

        {visible.length === 0 ? (
          <EmptyState
            description={search ? "Try another address." : "People who sign up on the website will appear here."}
            icon={<EnvelopeSimpleIcon aria-hidden size={iconSize.feature} weight="bold" />}
            title={search ? "No matching subscribers" : "No subscribers yet"}
          />
        ) : (
          <DashboardList columns={columns}>
            {visible.map((subscriber) => (
              <DashboardListRow key={subscriber.id}>
                <span className="truncate font-title text-sm font-bold sm:col-span-6">{subscriber.email}</span>
                <span className="sm:col-span-3">
                  <AdminStatusPill
                    label={accountEmails.has(subscriber.email.toLowerCase()) ? "Has an account" : "Website only"}
                    tone={accountEmails.has(subscriber.email.toLowerCase()) ? "success" : "neutral"}
                  />
                </span>
                <span className="text-sm text-nox-noir/70 sm:col-span-3 sm:text-right">{formatDate(subscriber.createdAt)}</span>
              </DashboardListRow>
            ))}
          </DashboardList>
        )}
      </div>
    </AdminQueryState>
  );
};

export default AdminNewsletterView;
