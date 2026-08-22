import { TrashIcon, UsersThreeIcon } from "@phosphor-icons/react";

import { Avatar } from "@/components/commons/avatar/avatar";
import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import {
  DashboardList,
  type DashboardListColumn,
} from "@/components/dashboard/dashboard-list/dashboard-list";
import type { Client } from "@/types/client";

interface Props {
  clients: Client[];
  onDelete: (client: Client) => void;
}

/**
 * Exported so `ClientListSkeleton` renders the same header and column widths —
 * the loading state and the loaded list can't drift apart.
 */
export const clientListColumns: DashboardListColumn[] = [
  { className: "col-span-5", label: "Client" },
  { className: "col-span-2", label: "Company" },
  { className: "col-span-3", label: "Contact" },
  { className: "col-span-2 text-right", label: "Actions" },
];

export const ClientList = ({ clients, onDelete }: Props) => {
  if (clients.length === 0) {
    return (
      <section className="client-list grid place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-box bg-base-200 text-nox-noir">
          <UsersThreeIcon aria-hidden size={23} weight="bold" />
        </span>
        <h2 className="mt-4 font-title text-lg font-bold text-nox-noir">No clients yet</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-nox-noir/60">
          Add a client to keep the contact details you use while preparing documents close at hand.
        </p>
      </section>
    );
  }

  return (
    <DashboardList columns={clientListColumns}>
      {clients.map((client) => (
          <li className="client-list-item grid gap-4 border-t border-steel-mist/70 p-4 first:border-t-0 sm:grid-cols-12 sm:items-center sm:px-5 sm:first:border-t" key={client.id}>
            <div className="flex min-w-0 items-center gap-3 sm:col-span-5">
              <Avatar className="bg-play-teal text-nox-noir" name={client.name} />
              <div className="min-w-0">
                <p className="truncate font-title text-sm font-bold text-nox-noir sm:text-base">{client.name}</p>
                <p className="mt-0.5 truncate text-xs text-nox-noir/50 sm:hidden">
                  {client.companyName || client.phone || "No contact details"}
                </p>
              </div>
            </div>
            <p className="hidden truncate text-sm text-nox-noir/60 sm:col-span-2 sm:block">{client.companyName || "—"}</p>
            <div className="hidden min-w-0 sm:col-span-3 sm:block">
              <p className="truncate text-sm text-nox-noir/60">{client.email || "—"}</p>
              <p className="mt-1 truncate text-xs text-nox-noir/45">{client.phone || "No phone"}</p>
            </div>
            <div className="flex justify-end sm:col-span-2">
              <ButtonIcon
                aria-label={`Delete ${client.name}`}
                icon={<TrashIcon aria-hidden size={17} weight="bold" />}
                onClick={() => onDelete(client)}
                shape="square"
                size="sm"
                variant="danger"
              />
            </div>
          </li>
      ))}
    </DashboardList>
  );
};
