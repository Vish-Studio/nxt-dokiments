import { UsersThreeIcon } from "@phosphor-icons/react";

import { ClientListItem } from "@/components/dashboard/client-list-item/client-list-item";
import type { Client } from "@/types/client";

interface Props {
  clients: Client[];
  onDelete: (client: Client) => void;
  onEdit: (client: Client) => void;
  onPreview: (client: Client) => void;
}

/** Card grid, shared with `ClientListSkeleton` so the layout doesn't shift on load. */
export const clientGridClassName =
  "grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3";

export const ClientList = ({ clients, onDelete, onEdit, onPreview }: Props) => {
  if (clients.length === 0) {
    return (
      <section className="client-list grid min-h-72 w-full place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-10 text-center">
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
    <section className={`client-list ${clientGridClassName}`}>
      {clients.map((client) => (
        <ClientListItem
          client={client}
          key={client.id}
          onDelete={onDelete}
          onEdit={onEdit}
          onPreview={onPreview}
        />
      ))}
    </section>
  );
};
