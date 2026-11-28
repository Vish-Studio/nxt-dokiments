"use client";

import {
  CheckCircleIcon,
  CodeIcon,
  HeartbeatIcon,
  ShieldCheckIcon,
  ToggleRightIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

import { AdminQueryState } from "@/components/admin/admin-query-state/admin-query-state";
import { AdminStatusPill } from "@/components/admin/admin-status-pill/admin-status-pill";
import { Avatar } from "@/components/commons/avatar/avatar";
import { DashboardList } from "@/components/dashboard/dashboard-list/dashboard-list";
import { DashboardListRow } from "@/components/dashboard/dashboard-list-row/dashboard-list-row";
import { SettingsCard } from "@/components/dashboard/settings-card/settings-card";
import { useAdminSystemQuery } from "@/hooks/queries/use-admin";
import { formatDate, pluralise } from "@/lib/admin/format";
import { iconSize } from "@/lib/icons";

const adminColumns = [
  { className: "col-span-6", label: "Administrator" },
  { className: "col-span-3", label: "Role" },
  { className: "col-span-3 text-right", label: "Added" },
];

/**
 * The admin System page: feature switches, configuration checks, the running
 * version and who the administrators are.
 *
 * Real data from `GET /api/admin/system`. Switches are environment variables
 * baked into the build, so they are shown, not toggled: changing one is a
 * redeploy, and the page says which variable to set. Checks report whether a
 * setting is present, never its value.
 */
export const AdminSystemView = () => {
  const system = useAdminSystemQuery();
  const status = system.data;
  const failing = status?.checks.filter((check) => !check.isHealthy).length ?? 0;

  return (
    <AdminQueryState
      errorTitle="We couldn't load system status"
      isError={system.isError}
      isPending={system.isPending}
      loadingMessage="Loading system status"
      onRetry={() => void system.refetch()}
    >
      {status ? (
        <div className="admin-system-view grid gap-4">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <SettingsCard
              description="Set in the environment. Change the variable and redeploy to switch one."
              icon={ToggleRightIcon}
              title="Feature switches"
              tone="blue"
            >
              <ul className="grid gap-2">
                {status.flags.map((flag) => (
                  <li
                    className="flex flex-wrap items-center gap-3 rounded-box bg-base-200 p-3"
                    key={flag.envKey}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-title text-sm font-bold">{flag.label}</span>
                      <span className="block text-xs text-nox-noir/65">{flag.description}</span>
                      <code className="mt-1 block truncate font-mono text-xs text-nox-noir/60">{flag.envKey}</code>
                    </span>
                    <AdminStatusPill
                      label={flag.isOn ? "On" : "Off"}
                      tone={flag.isOn ? "success" : "neutral"}
                    />
                  </li>
                ))}
              </ul>
            </SettingsCard>

            <div className="grid content-start gap-4">
              <SettingsCard
                description={failing === 0 ? "Everything is set." : `${pluralise(failing, "setting")} to look at.`}
                icon={HeartbeatIcon}
                title="Configuration"
                tone={failing === 0 ? "teal" : "golden"}
              >
                <ul className="grid gap-2">
                  {status.checks.map((check) => (
                    <li
                      className="grid gap-1 rounded-field bg-base-200 px-3 py-2.5 text-sm"
                      key={check.label}
                    >
                      <span className="flex items-center gap-2">
                        {check.isHealthy ? (
                          <CheckCircleIcon aria-hidden className="text-success" size={iconSize.control} weight="fill" />
                        ) : (
                          <WarningCircleIcon aria-hidden className="text-error" size={iconSize.control} weight="fill" />
                        )}
                        <span className="flex-1">{check.label}</span>
                        <b className="font-title">{check.isHealthy ? "OK" : "Missing"}</b>
                      </span>
                      {check.hint ? <span className="pl-6 text-xs text-nox-noir/65">{check.hint}</span> : null}
                    </li>
                  ))}
                </ul>
              </SettingsCard>

              <SettingsCard
                icon={CodeIcon}
                title="Version"
                tone="purple"
              >
                <p className="flex justify-between rounded-field bg-base-200 px-3 py-2.5 text-sm">
                  <span className="text-nox-noir/70">Dokiments</span>
                  <b className="font-title">{status.version}</b>
                </p>
              </SettingsCard>
            </div>
          </div>

          <SettingsCard
            description="Accounts with the superadmin role. Roles are changed in the Firebase console for now."
            icon={ShieldCheckIcon}
            title="Administrators"
            tone="golden"
          >
            <DashboardList columns={adminColumns}>
              {status.administrators.map((admin) => (
                <DashboardListRow key={admin.uid}>
                  <span className="flex min-w-0 items-center gap-3 sm:col-span-6">
                    <Avatar
                      name={admin.displayName}
                      size="sm"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-title text-sm font-bold">{admin.displayName}</span>
                      <span className="block truncate text-xs text-nox-noir/60">{admin.email}</span>
                    </span>
                  </span>
                  <span className="sm:col-span-3">
                    <AdminStatusPill
                      label="Superadmin"
                      tone="warning"
                    />
                  </span>
                  <span className="text-sm text-nox-noir/70 sm:col-span-3 sm:text-right">{formatDate(admin.createdAt)}</span>
                </DashboardListRow>
              ))}
            </DashboardList>
          </SettingsCard>
        </div>
      ) : null}
    </AdminQueryState>
  );
};

export default AdminSystemView;
