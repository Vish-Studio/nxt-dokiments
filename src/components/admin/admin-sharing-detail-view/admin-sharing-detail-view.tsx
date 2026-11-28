"use client";

import { ClockCounterClockwiseIcon, LinkIcon, UsersIcon } from "@phosphor-icons/react";

import { AdminSampleNotice } from "@/components/admin/admin-sample-notice/admin-sample-notice";
import { AdminStatusPill } from "@/components/admin/admin-status-pill/admin-status-pill";
import { DashboardList } from "@/components/dashboard/dashboard-list/dashboard-list";
import { DashboardListRow } from "@/components/dashboard/dashboard-list-row/dashboard-list-row";
import { SettingsCard } from "@/components/dashboard/settings-card/settings-card";
import { usePageHeader } from "@/hooks/use-page-header";
import { formatDate, formatDateTime, pluralise } from "@/lib/admin/format";
import type { SampleShare } from "@/lib/admin/sharing/dummy-data";
import { shareStatusLabels, shareStatusTones } from "@/lib/admin/sharing/share-status";

export interface AdminSharingDetailViewProps {
  /** The share to show. The page resolves it and 404s when it does not exist. */
  share: SampleShare;
}

const recipientColumns = [
  { className: "col-span-5", label: "Recipient" },
  { className: "col-span-2", label: "Role" },
  { className: "col-span-2", label: "Opened" },
  { className: "col-span-3 text-right", label: "Status" },
];

/**
 * One shared document's admin page: who it went to, where each recipient
 * stands, the link's settings and its timeline.
 *
 * Read-only. Resend, extend and revoke belong to the owner in the app; an
 * administrator acting on someone's signature request needs the audit log
 * first. Sample data, like the Sharing list.
 */
export const AdminSharingDetailView = ({ share }: AdminSharingDetailViewProps) => {
  usePageHeader({ back: { href: "/admin/sharing", label: "Sharing" }, title: share.name });

  return (
    <div className="admin-sharing-detail-view grid gap-4">
      <AdminSampleNotice reason="Shared documents are readable only by their owner and recipients, so this share is made up for now." />

      <section className="flex flex-wrap items-center gap-4 rounded-box bg-base-200 p-5 sm:p-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-title text-2xl font-bold text-nox-noir">{share.kind}</h2>
            <AdminStatusPill
              label={shareStatusLabels[share.status]}
              tone={shareStatusTones[share.status]}
            />
          </div>
          <p className="mt-1 text-sm text-nox-noir/70">
            {share.type} sent by <b className="font-title">{share.ownerName}</b> ({share.ownerEmail}) on {formatDateTime(share.sentAt)}
          </p>
          <p className="mt-2 text-xs text-nox-noir/70">
            Share ID <code className="rounded-md bg-base-100 px-2 py-1 font-mono">{share.id}</code>
          </p>
        </div>
      </section>

      <SettingsCard
        description={pluralise(share.recipients.length, "recipient")}
        icon={UsersIcon}
        title="Recipients"
        tone="teal"
      >
        <DashboardList columns={recipientColumns}>
          {share.recipients.map((recipient) => (
            <DashboardListRow key={recipient.email}>
              <span className="truncate font-title text-sm font-bold sm:col-span-5">{recipient.email}</span>
              <span className="text-sm sm:col-span-2">{recipient.role}</span>
              <span className="text-sm text-nox-noir/70 sm:col-span-2">{pluralise(recipient.opens, "time")}</span>
              <span className="sm:col-span-3 sm:text-right">
                <AdminStatusPill
                  label={shareStatusLabels[recipient.status]}
                  tone={shareStatusTones[recipient.status]}
                />
              </span>
            </DashboardListRow>
          ))}
        </DashboardList>
      </SettingsCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SettingsCard
          icon={LinkIcon}
          title="Link"
          tone="blue"
        >
          <dl className="grid gap-2 text-sm">
            {[
              ["Expires", share.expiresAt === null ? "Never" : formatDate(share.expiresAt)],
              ["Reminders sent", String(share.remindersSent)],
            ].map(([term, value]) => (
              <div
                className="flex justify-between gap-3 rounded-field bg-base-200 px-3 py-2.5"
                key={term}
              >
                <dt className="text-nox-noir/70">{term}</dt>
                <dd className="font-title font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </SettingsCard>

        <SettingsCard
          icon={ClockCounterClockwiseIcon}
          title="Timeline"
          tone="golden"
        >
          <ol className="grid gap-3">
            {share.timeline.map((event) => (
              <li
                className="flex gap-3"
                key={`${event.label}-${event.at}`}
              >
                <span
                  aria-hidden
                  className="mt-1.5 size-2.5 shrink-0 rounded-full bg-nox-noir"
                />
                <span className="grid">
                  <span className="font-title text-sm font-bold">{event.label}</span>
                  <time
                    className="text-xs text-nox-noir/60"
                    dateTime={new Date(event.at).toISOString()}
                  >
                    {formatDateTime(event.at)}
                  </time>
                </span>
              </li>
            ))}
          </ol>
        </SettingsCard>
      </div>
    </div>
  );
};

export default AdminSharingDetailView;
