import { TrashIcon } from "@phosphor-icons/react";

import { Avatar } from "@/components/commons/avatar/avatar";
import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { DashboardListRow } from "@/components/dashboard/dashboard-list-row/dashboard-list-row";
import { isOptimisticClient } from "@/hooks/queries/use-clients";
import type { Client } from "@/types/client";

export interface ClientListItemProps {
  client: Client;
  onDelete: (client: Client) => void;
  onPreview: (client: Client) => void;
}

export const ClientListItem = ({
  client,
  onDelete,
  onPreview,
}: ClientListItemProps) => {
  const isPending = isOptimisticClient(client);

  return (
    <DashboardListRow
      className="client-list-item grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-12 sm:gap-4"
      onSelect={isPending ? undefined : () => onPreview(client)}
      selectLabel={`View details for ${client.name}`}
    >
      <div className="pointer-events-none relative z-10 flex min-w-0 items-center gap-3 sm:col-span-5">
        <Avatar
          className="bg-play-teal text-nox-noir"
          name={client.name}
        />
        <div className="min-w-0">
          <p className="truncate font-title text-md md:text-lg lg:text-sm font-bold text-nox-noir sm:text-base">
            {client.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-nox-noir/50 sm:hidden">
            {client.companyName || "No company"}
          </p>
        </div>
      </div>

      <p className="pointer-events-none relative z-10 hidden truncate text-sm text-nox-noir/60 sm:col-span-2 sm:block">
        {client.companyName || "—"}
      </p>

      <div className="pointer-events-none relative z-10 hidden min-w-0 sm:col-span-3 sm:block">
        <p className="truncate text-sm text-nox-noir/60">
          {client.email || "—"}
        </p>
        <p className="mt-1 truncate text-xs text-nox-noir/45">
          {client.phone || "No phone"}
        </p>
      </div>

      <div className="relative z-20 flex justify-end sm:col-span-2">
        <ButtonIcon
          aria-label={`Delete ${client.name}`}
          disabled={isPending}
          icon={
            <TrashIcon
              aria-hidden
              size={17}
              weight="bold"
            />
          }
          onClick={() => onDelete(client)}
          shape="square"
          size="sm"
          variant="danger"
        />
      </div>
    </DashboardListRow>
  );
};
