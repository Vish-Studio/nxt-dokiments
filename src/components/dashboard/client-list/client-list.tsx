import { UsersThreeIcon } from "@phosphor-icons/react";

import { ClientListItem } from "@/components/dashboard/client-list-item/client-list-item";
import {
  DashboardList,
  type DashboardListColumn,
} from "@/components/dashboard/dashboard-list/dashboard-list";
import type { Client } from "@/types/client";

interface Props {
  clients: Client[];
  onDelete: (client: Client) => void;
  onPreview: (client: Client) => void;
}

/**
 * Exported so the loading skeleton renders the same header and column widths —
 * the loading state and the loaded list can't drift apart.
 */
export const clientListColumns: DashboardListColumn[] = [
  { className: "col-span-5", label: "Client" },
  { className: "col-span-2", label: "Company" },
  { className: "col-span-3", label: "Contact" },
  { className: "col-span-2 text-right", label: "Actions" },
];

/**
 * Shimmer cells for one `ClientListItem`, kept beside `clientListColumns` so the
 * two stay in step. Passed to `DashboardListSkeleton`, which supplies the row.
 */
export const clientSkeletonRow = (
  <>
    <div className="flex min-w-0 items-center gap-3 sm:col-span-5">
      <div className="skeleton size-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="skeleton h-4 w-2/3 rounded-field" />
        <div className="skeleton h-3 w-1/2 rounded-field sm:hidden" />
      </div>
    </div>

    <div className="hidden sm:col-span-2 sm:block">
      <div className="skeleton h-3 w-4/5 rounded-field" />
    </div>

    <div className="hidden space-y-2 sm:col-span-3 sm:block">
      <div className="skeleton h-3 w-full rounded-field" />
      <div className="skeleton h-3 w-1/2 rounded-field" />
    </div>

    <div className="flex justify-end sm:col-span-2">
      <div className="skeleton size-10 rounded-field" />
    </div>
  </>
);

export const ClientList = ({ clients, onDelete, onPreview }: Props) => {
  if (clients.length === 0) {
    return (
      <section className="client-list grid place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-box bg-base-200 text-nox-noir">
          <UsersThreeIcon
            aria-hidden
            size={23}
            weight="bold"
          />
        </span>
        <h2 className="mt-4 font-title text-lg font-bold text-nox-noir">
          No clients yet
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-nox-noir/60">
          Add a client to keep the contact details you use while preparing
          documents close at hand.
        </p>
      </section>
    );
  }

  return (
    <DashboardList columns={clientListColumns}>
      {clients.map((client) => (
        <ClientListItem
          client={client}
          key={client.id}
          onDelete={onDelete}
          onPreview={onPreview}
        />
      ))}
    </DashboardList>
  );
};
