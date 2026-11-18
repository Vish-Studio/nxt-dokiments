import {
  ClockIcon,
  FileTextIcon,
  PencilSimpleLineIcon,
  TrayArrowDownIcon,
} from "@phosphor-icons/react";

import type { CompanyDocumentGroup } from "@/lib/documents/company-groups";
import { formatRelativeDate } from "@/lib/documents/format-document-date";
import { cn } from "@/lib/utils";

export interface CompanyOverviewCardProps {
  group: CompanyDocumentGroup;
}

/**
 * "Overview" on a company page, built exactly like the dashboard's "Workspace
 * snapshot": a titled white card with a one-line explanation, then grey rows
 * each holding a small tinted icon tile, a label and the figure.
 */
export const CompanyOverviewCard = ({ group }: CompanyOverviewCardProps) => {
  const name = group.name ?? "these documents";
  const rows = [
    { icon: FileTextIcon, label: "Documents in total", tone: "bg-play-purple", value: String(group.entries.length) },
    { icon: PencilSimpleLineIcon, label: "Created by you", tone: "bg-golden-harvest", value: String(group.createdCount) },
    { icon: TrayArrowDownIcon, label: "Shared with you", tone: "bg-play-teal", value: String(group.receivedCount) },
    { icon: ClockIcon, label: "Last activity", tone: "bg-play-blue", value: formatRelativeDate(group.latestAt) },
  ];

  return (
    <section
      aria-label="Overview"
      className="company-overview-card rounded-box border border-steel-mist bg-base-100 p-5 sm:p-6"
    >
      <h3 className="font-title text-xl font-bold text-nox-noir">Overview</h3>
      <p className="mt-1 text-sm leading-6 text-nox-noir/60">
        What you and {name} have exchanged so far.
      </p>
      <dl className="mt-5 grid gap-3">
        {rows.map(({ icon: RowIcon, label, tone, value }) => (
          <div
            className="flex items-center justify-between gap-4 rounded-box bg-base-200 p-3"
            key={label}
          >
            <dt className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-box text-nox-noir",
                  tone,
                )}
              >
                <RowIcon
                  aria-hidden
                  size={19}
                  weight="bold"
                />
              </span>
              <span className="truncate text-sm text-nox-noir/60">{label}</span>
            </dt>
            <dd className="shrink-0 font-title text-base font-bold text-nox-noir">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default CompanyOverviewCard;
