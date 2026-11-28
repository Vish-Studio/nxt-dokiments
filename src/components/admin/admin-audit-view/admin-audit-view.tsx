"use client";

import { ClockCounterClockwiseIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { AdminSampleNotice } from "@/components/admin/admin-sample-notice/admin-sample-notice";
import CollectionToolbar from "@/components/commons/collection-toolbar/collection-toolbar";
import { EmptyState } from "@/components/commons/empty-state/empty-state";
import { DashboardList } from "@/components/dashboard/dashboard-list/dashboard-list";
import { DashboardListRow } from "@/components/dashboard/dashboard-list-row/dashboard-list-row";
import { type AuditArea, listSampleAuditEntries } from "@/lib/admin/audit/dummy-data";
import { formatDateTime, pluralise } from "@/lib/admin/format";
import { iconSize } from "@/lib/icons";
import { cn } from "@/lib/utils";

const areas: AuditArea[] = ["Feedback", "Notifications", "Plans", "Promotions", "Sharing", "System", "Templates", "Users"];

const areaToneClassNames: Record<AuditArea, string> = {
  Feedback: "bg-golden-harvest/45",
  Notifications: "bg-play-blue/45",
  Plans: "bg-play-purple/45",
  Promotions: "bg-golden-harvest/45",
  Sharing: "bg-play-teal/35",
  System: "bg-base-200",
  Templates: "bg-play-pink/45",
  Users: "bg-play-blue/45",
};

const columns = [
  { className: "col-span-2", label: "When" },
  { className: "col-span-3", label: "Administrator" },
  { className: "col-span-4", label: "Action" },
  { className: "col-span-3 text-right", label: "Area" },
];

/**
 * The admin Audit log: every admin action, newest first, searchable and
 * filterable by area and administrator.
 *
 * Sample data until actions are recorded (`src/lib/admin/audit/dummy-data.ts`
 * describes the `auditLog` collection to add). Destructive actions are in red.
 */
// Sample data is fixed, so it is read once rather than on every render.
const entries = listSampleAuditEntries();
const admins = [...new Set(entries.map((entry) => entry.adminName))].sort();

export const AdminAuditView = () => {
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("all");
  const [admin, setAdmin] = useState("all");

  const query = search.trim().toLowerCase();
  const visible = entries.filter(
    (entry) =>
      (area === "all" || entry.area === area) &&
      (admin === "all" || entry.adminName === admin) &&
      (!query || `${entry.action} ${entry.target}`.toLowerCase().includes(query)),
  );

  return (
    <div className="admin-audit-view grid gap-2">
      <AdminSampleNotice reason="Nothing records admin actions yet, so this log is made up. Entries will be permanent once it's real." />

      <div className="mt-2">
        <CollectionToolbar
          appearance="compact"
          ariaLabel="Search and filter the audit log"
          canReset={Boolean(search) || area !== "all" || admin !== "all"}
          filterStyle="chips"
          filters={[
            {
              defaultValue: "all",
              id: "area",
              label: "Area",
              onChange: setArea,
              options: [{ label: "All areas", value: "all" }, ...areas.map((value) => ({ label: value, value }))],
              value: area,
            },
            {
              defaultValue: "all",
              id: "admin",
              label: "Administrator",
              onChange: setAdmin,
              options: [{ label: "Everyone", value: "all" }, ...admins.map((value) => ({ label: value, value }))],
              value: admin,
            },
          ]}
          onReset={() => {
            setSearch("");
            setArea("all");
            setAdmin("all");
          }}
          onSearch={setSearch}
          onSort={() => undefined}
          resultLabel={pluralise(visible.length, "action")}
          search={search}
          searchLabel="Search the audit log"
          searchPlaceholder="Search actions or targets"
          sort="newest"
          sortOptions={[{ label: "Newest first", value: "newest" }]}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          description="Try another word, or clear the filters."
          icon={<ClockCounterClockwiseIcon aria-hidden size={iconSize.feature} weight="bold" />}
          title="No matching actions"
        />
      ) : (
        <DashboardList
          columns={columns}
          ordered
        >
          {visible.map((entry) => (
            <DashboardListRow key={entry.id}>
              <time
                className="text-sm text-nox-noir/70 sm:col-span-2"
                dateTime={new Date(entry.at).toISOString()}
              >
                {formatDateTime(entry.at)}
              </time>
              <span className="text-sm sm:col-span-3">{entry.adminName}</span>
              <span className="min-w-0 sm:col-span-4">
                <span className={cn("block font-title text-sm font-bold", entry.isDestructive && "text-error")}>
                  {entry.action}
                </span>
                <span className="block truncate text-xs text-nox-noir/60">{entry.target}</span>
              </span>
              <span className="sm:col-span-3 sm:text-right">
                <span className={cn("inline-flex h-6 items-center rounded-field px-2 text-xs font-semibold", areaToneClassNames[entry.area])}>
                  {entry.area}
                </span>
              </span>
            </DashboardListRow>
          ))}
        </DashboardList>
      )}
    </div>
  );
};

export default AdminAuditView;
