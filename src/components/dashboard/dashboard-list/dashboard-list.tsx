import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type DashboardListColumn = {
  className: string;
  label: string;
};

interface Props {
  children: ReactNode;
  columns: DashboardListColumn[];
  ordered?: boolean;
}

export const DashboardList = ({ children, columns, ordered = false }: Props) => {
  const List = ordered ? "ol" : "ul";

  return (
    <section className="dashboard-list min-h-0 w-full flex-1 overflow-hidden rounded-box border border-steel-mist bg-base-100">
      <div className="hidden grid-cols-12 items-center px-5 py-3 sm:grid">
        {columns.map((column) => (
          <span
            className={cn(
              "font-title text-xs font-bold uppercase tracking-wide text-nox-noir/45",
              column.className,
            )}
            key={column.label}
          >
            {column.label}
          </span>
        ))}
      </div>
      <List>{children}</List>
    </section>
  );
};

export default DashboardList;
