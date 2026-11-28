"use client";

import { BellIcon, DeviceMobileIcon, PaperPlaneTiltIcon } from "@phosphor-icons/react";

import { AdminBarList } from "@/components/admin/admin-bar-list/admin-bar-list";
import { AdminSampleNotice } from "@/components/admin/admin-sample-notice/admin-sample-notice";
import { AdminStatTile } from "@/components/admin/admin-stat-tile/admin-stat-tile";
import { AdminStatusPill } from "@/components/admin/admin-status-pill/admin-status-pill";
import { DashboardList } from "@/components/dashboard/dashboard-list/dashboard-list";
import { DashboardListRow } from "@/components/dashboard/dashboard-list-row/dashboard-list-row";
import { SettingsCard } from "@/components/dashboard/settings-card/settings-card";
import { formatCount, formatDateTime, formatShare } from "@/lib/admin/format";
import { getSamplePushOverview, type PushDevice, type PushPlatform } from "@/lib/admin/notifications/dummy-data";
import type { AdminStatusTone } from "@/lib/admin/status-tone";
import { pushNotificationsEnabled } from "@/lib/push/feature-flag";
import { cn } from "@/lib/utils";

const platformOrder: PushPlatform[] = ["iOS", "Android", "Web"];

const tokenTones: Record<PushDevice["tokenStatus"], AdminStatusTone> = {
  Expired: "error",
  "Opted out": "neutral",
  Valid: "success",
};

const sendColumns = [
  { className: "col-span-5", label: "Notification" },
  { className: "col-span-3", label: "Sent" },
  { className: "col-span-2 text-right", label: "Delivered" },
  { className: "col-span-2 text-right", label: "Failed" },
];

const deviceColumns = [
  { className: "col-span-4", label: "Account" },
  { className: "col-span-3", label: "Device" },
  { className: "col-span-2", label: "Last seen" },
  { className: "col-span-3 text-right", label: "Token" },
];

/**
 * The admin Notifications page: push devices and how recent sends went.
 *
 * Whether push is switched on is real (`NEXT_PUBLIC_PUSH_NOTIFICATIONS_ENABLED`).
 * Everything else is sample data: device subscriptions are bearer credentials
 * and stay owner-only, so a real version needs a server job that keeps counts.
 */
export const AdminNotificationsView = () => {
  const overview = getSamplePushOverview();
  const totalDevices = platformOrder.reduce((sum, platform) => sum + overview.platforms[platform], 0);
  const delivered = overview.sends.reduce((sum, send) => sum + send.delivered, 0);
  const attempted = overview.sends.reduce((sum, send) => sum + send.devices, 0);
  const failed = overview.sends.reduce((sum, send) => sum + send.failed, 0);

  return (
    <div className="admin-notifications-view grid gap-4">
      <AdminSampleNotice reason="Push devices are private to each account, so these numbers are made up until push stats are recorded." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatTile
          label="Push notifications"
          note="NEXT_PUBLIC_PUSH_NOTIFICATIONS_ENABLED"
          toneClassName={pushNotificationsEnabled ? "bg-success/40" : "bg-steel-mist"}
          value={pushNotificationsEnabled ? "On" : "Off"}
        />
        <AdminStatTile
          label="Registered devices"
          toneClassName="bg-play-blue"
          value={formatCount(totalDevices)}
        />
        <AdminStatTile
          label="Delivered"
          note={`${formatCount(delivered)} of ${formatCount(attempted)}`}
          toneClassName="bg-play-teal"
          value={formatShare(delivered, attempted)}
        />
        <AdminStatTile
          label="Failed"
          note="Mostly expired tokens"
          toneClassName="bg-error/25"
          trend={failed > 0 ? "down" : "neutral"}
          value={formatCount(failed)}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <SettingsCard
          icon={DeviceMobileIcon}
          title="Devices by platform"
          tone="blue"
        >
          <AdminBarList
            items={platformOrder.map((platform) => ({
              label: platform,
              note: formatShare(overview.platforms[platform], totalDevices),
              value: overview.platforms[platform],
            }))}
            label="Devices by platform"
          />
        </SettingsCard>

        <SettingsCard
          icon={PaperPlaneTiltIcon}
          title="Recent sends"
          tone="teal"
        >
          <DashboardList columns={sendColumns}>
            {overview.sends.map((send) => (
              <DashboardListRow key={send.id}>
                <span className="min-w-0 sm:col-span-5">
                  <span className="block truncate font-title text-sm font-bold">{send.title}</span>
                  <span className="block text-xs text-nox-noir/60">{send.kind}</span>
                </span>
                <time
                  className="text-sm text-nox-noir/70 sm:col-span-3"
                  dateTime={new Date(send.sentAt).toISOString()}
                >
                  {formatDateTime(send.sentAt)}
                </time>
                <span className="font-title text-sm font-bold sm:col-span-2 sm:text-right">{formatCount(send.delivered)}</span>
                <span className={cn("font-title text-sm font-bold sm:col-span-2 sm:text-right", send.failed > 0 && "text-error")}>
                  {formatCount(send.failed)}
                </span>
              </DashboardListRow>
            ))}
          </DashboardList>
        </SettingsCard>
      </div>

      <SettingsCard
        description="Endpoints are never shown: they would let anyone push to the device."
        icon={BellIcon}
        title="Devices"
        tone="purple"
      >
        <DashboardList columns={deviceColumns}>
          {overview.devices.map((device) => (
            <DashboardListRow key={device.id}>
              <span className="min-w-0 sm:col-span-4">
                <span className="block truncate font-title text-sm font-bold">{device.name}</span>
                <span className="block truncate text-xs text-nox-noir/60">{device.email}</span>
              </span>
              <span className="text-sm sm:col-span-3">
                {device.platform} · v{device.appVersion}
              </span>
              <time
                className="text-sm text-nox-noir/70 sm:col-span-2"
                dateTime={new Date(device.lastSeenAt).toISOString()}
              >
                {formatDateTime(device.lastSeenAt)}
              </time>
              <span className="sm:col-span-3 sm:text-right">
                <AdminStatusPill
                  label={device.tokenStatus}
                  tone={tokenTones[device.tokenStatus]}
                />
              </span>
            </DashboardListRow>
          ))}
        </DashboardList>
      </SettingsCard>
    </div>
  );
};

export default AdminNotificationsView;
