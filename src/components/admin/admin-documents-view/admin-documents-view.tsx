"use client";

import { ChartBarIcon, FileTextIcon, ListNumbersIcon, TrendUpIcon } from "@phosphor-icons/react";

import { AdminBarList } from "@/components/admin/admin-bar-list/admin-bar-list";
import { AdminColumnChart } from "@/components/admin/admin-column-chart/admin-column-chart";
import { AdminSampleNotice } from "@/components/admin/admin-sample-notice/admin-sample-notice";
import { AdminStatTile } from "@/components/admin/admin-stat-tile/admin-stat-tile";
import { DashboardList } from "@/components/dashboard/dashboard-list/dashboard-list";
import { DashboardListRow } from "@/components/dashboard/dashboard-list-row/dashboard-list-row";
import { SettingsCard } from "@/components/dashboard/settings-card/settings-card";
import { getDocumentStats } from "@/lib/admin/documents/dummy-data";
import { formatChange, formatCount, formatDayMonth, formatShare, pluralise } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

const templateColumns = [
  { className: "col-span-5", label: "Template" },
  { className: "col-span-3", label: "Type" },
  { className: "col-span-2 text-right", label: "Documents" },
  { className: "col-span-2 text-right", label: "Change" },
];

/**
 * The admin Documents page: how many documents people make, which kinds, how
 * far they get, and which templates produce them. Counts only, never contents.
 *
 * All sample data (`src/lib/admin/documents/dummy-data.ts`): documents are
 * private to each account and cannot be counted across accounts yet.
 */
export const AdminDocumentsView = () => {
  const stats = getDocumentStats();
  const lastMonth = stats.daily.reduce((sum, day) => sum + day.count, 0);
  const busiest = stats.daily.reduce((top, day) => (day.count > top.count ? day : top), stats.daily[0]);
  const stagesTotal = stats.stages.reduce((sum, stage) => sum + stage.count, 0);

  return (
    <div className="admin-documents-view grid gap-4">
      <AdminSampleNotice reason="Documents are private to each account, so these numbers are made up until they can be counted across accounts." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatTile
          label="All documents"
          note="Since launch"
          toneClassName="bg-play-purple"
          value={formatCount(stats.total)}
        />
        <AdminStatTile
          label="Created, 30 days"
          toneClassName="bg-play-pink"
          value={formatCount(lastMonth)}
        />
        <AdminStatTile
          label="Exported as PDF"
          note={`${formatShare(stats.exported, lastMonth)} of new documents`}
          toneClassName="bg-play-blue"
          value={formatCount(stats.exported)}
        />
        <AdminStatTile
          label="Busiest day"
          note={pluralise(busiest.count, "document")}
          toneClassName="bg-golden-harvest"
          value={formatDayMonth(busiest.day)}
        />
      </div>

      <SettingsCard
        description="Last 30 days."
        icon={ChartBarIcon}
        title="Documents created per day"
        tone="purple"
      >
        <AdminColumnChart
          items={stats.daily.map((day) => ({
            label: formatDayMonth(day.day),
            title: `${formatDayMonth(day.day)}: ${pluralise(day.count, "document")}`,
            value: day.count,
          }))}
          label="Documents created per day"
          labelEvery={7}
        />
      </SettingsCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <SettingsCard
          icon={FileTextIcon}
          title="Documents by type"
          tone="pink"
        >
          <AdminBarList
            barClassName="bg-play-purple"
            items={stats.types.map((type) => ({ label: type.label, value: type.count }))}
            label="Documents by type"
          />
        </SettingsCard>

        <SettingsCard
          description="Where documents created in the last 30 days stand now."
          icon={TrendUpIcon}
          title="How far documents get"
          tone="blue"
        >
          <AdminBarList
            items={stats.stages.map((stage) => ({
              label: stage.label,
              note: formatShare(stage.count, stagesTotal),
              value: stage.count,
            }))}
            label="Documents by stage"
          />
        </SettingsCard>
      </div>

      <SettingsCard
        icon={ListNumbersIcon}
        title="Top templates by documents"
        tone="golden"
      >
        <DashboardList
          columns={templateColumns}
          ordered
        >
          {stats.topTemplates.map((template) => (
            <DashboardListRow key={template.label}>
              <span className="font-title text-sm font-bold sm:col-span-5">{template.label}</span>
              <span className="text-sm text-nox-noir/70 sm:col-span-3">{template.type}</span>
              <span className="font-title text-sm font-bold sm:col-span-2 sm:text-right">{formatCount(template.count)}</span>
              <span
                className={cn(
                  "font-title text-sm font-bold sm:col-span-2 sm:text-right",
                  template.change < 0 ? "text-error" : "text-success",
                )}
              >
                {formatChange(template.change)}
              </span>
            </DashboardListRow>
          ))}
        </DashboardList>
      </SettingsCard>
    </div>
  );
};

export default AdminDocumentsView;
