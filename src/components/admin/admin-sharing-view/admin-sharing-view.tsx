"use client";

import { ShareNetworkIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminSampleNotice } from "@/components/admin/admin-sample-notice/admin-sample-notice";
import { AdminStatTile } from "@/components/admin/admin-stat-tile/admin-stat-tile";
import { AdminStatusPill } from "@/components/admin/admin-status-pill/admin-status-pill";
import { EmptyState } from "@/components/commons/empty-state/empty-state";
import { TabMenu } from "@/components/commons/tab-menu/tab-menu";
import { DashboardList } from "@/components/dashboard/dashboard-list/dashboard-list";
import { DashboardListRow } from "@/components/dashboard/dashboard-list-row/dashboard-list-row";
import { formatCount, formatDate } from "@/lib/admin/format";
import { getSampleShareTotals, listSampleShares } from "@/lib/admin/sharing/dummy-data";
import {
  filterSharesByTab,
  type ShareTab,
  shareStatusLabels,
  shareStatusTones,
} from "@/lib/admin/sharing/share-status";
import { iconSize } from "@/lib/icons";

const tabs: Array<{ id: ShareTab; label: string }> = [
  { id: "all", label: "All" },
  { id: "awaiting", label: "Awaiting signature" },
  { id: "signed", label: "Signed" },
  { id: "expired", label: "Expired" },
];

const columns = [
  { className: "col-span-4", label: "Document" },
  { className: "col-span-3", label: "Owner" },
  { className: "col-span-2", label: "Sent" },
  { className: "col-span-3 text-right", label: "Status" },
];

/**
 * The admin Sharing page: shared links and signature requests, by status, each
 * opening its detail page.
 *
 * Sample data until superadmins may read `sharedDocuments` (a rule change that
 * needs a security review, since it would expose signatures and field values).
 */
export const AdminSharingView = () => {
  const router = useRouter();
  const [tab, setTab] = useState<ShareTab>("all");
  const shares = listSampleShares();
  const totals = getSampleShareTotals();
  const visible = filterSharesByTab(shares, tab);

  return (
    <div className="admin-sharing-view grid gap-2">
      <AdminSampleNotice reason="Shared documents are readable only by their owner and recipients, so this list is made up for now." />

      <div className="my-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatTile
          label="Shared, 30 days"
          toneClassName="bg-play-teal"
          value={formatCount(totals.shared)}
        />
        <AdminStatTile
          label="Awaiting signature"
          toneClassName="bg-golden-harvest"
          value={formatCount(totals.awaiting)}
        />
        <AdminStatTile
          label="Signed, 30 days"
          toneClassName="bg-success/40"
          value={formatCount(totals.signed)}
        />
        <AdminStatTile
          label="Expired"
          toneClassName="bg-steel-mist"
          value={formatCount(totals.expired)}
        />
      </div>

      <TabMenu
        ariaLabel="Filter shares by status"
        className="mb-2 self-start"
        items={tabs.map((item) => ({
          badge: formatCount(filterSharesByTab(shares, item.id).length),
          id: item.id,
          label: item.label,
        }))}
        onChange={(id) => setTab(id as ShareTab)}
        value={tab}
      />

      {visible.length === 0 ? (
        <EmptyState
          description="Nothing has this status right now."
          icon={<ShareNetworkIcon aria-hidden size={iconSize.feature} weight="bold" />}
          title="No shares here"
        />
      ) : (
        <DashboardList columns={columns}>
          {visible.map((share) => (
            <DashboardListRow
              key={share.id}
              onSelect={() => router.push(`/admin/sharing/${share.id}`)}
              selectLabel={`Open ${share.name}`}
            >
              <span className="pointer-events-none relative z-10 min-w-0 sm:col-span-4">
                <span className="block truncate font-title text-sm font-bold">{share.name}</span>
                <span className="block truncate text-xs text-nox-noir/60">
                  {share.type} · {share.kind}
                </span>
              </span>
              <span className="pointer-events-none relative z-10 min-w-0 sm:col-span-3">
                <span className="block truncate text-sm">{share.ownerName}</span>
                <span className="block truncate text-xs text-nox-noir/60">
                  To {share.recipients.length === 1 ? share.recipients[0].email : `${share.recipients.length} recipients`}
                </span>
              </span>
              <span className="pointer-events-none relative z-10 text-sm text-nox-noir/70 sm:col-span-2">
                {formatDate(share.sentAt)}
              </span>
              <span className="pointer-events-none relative z-10 sm:col-span-3 sm:text-right">
                <AdminStatusPill
                  label={shareStatusLabels[share.status]}
                  tone={shareStatusTones[share.status]}
                />
              </span>
            </DashboardListRow>
          ))}
        </DashboardList>
      )}
    </div>
  );
};

export default AdminSharingView;
