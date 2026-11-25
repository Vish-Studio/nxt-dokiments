import {
  MagnifyingGlassIcon,
  PlusIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/commons/button/button";
import { EmptyState } from "@/components/commons/empty-state/empty-state";
import { ClientListItem } from "@/components/dashboard/client-list-item/client-list-item";
import { iconSize } from "@/lib/icons";
import type { Client } from "@/types/client";

interface Props {
  clients: Client[];
  /**
   * Whether the user has any clients at all, before search and filters. Tells
   * "No clients yet" (offer Add client) apart from "No clients match" (offer
   * Clear filters). Defaults to `false`.
   */
  hasClients?: boolean;
  /** The first-time empty state's action. Omit to show no button. */
  onAdd?: () => void;
  onDelete: (client: Client) => void;
  onEdit: (client: Client) => void;
  onPreview: (client: Client) => void;
  /** The filtered-empty state's "Clear filters" action. */
  onReset?: () => void;
}

/** Card grid, shared with `ClientListSkeleton` so the layout doesn't shift on load. */
export const clientGridClassName =
  "grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3";

export const ClientList = ({
  clients,
  hasClients = false,
  onAdd,
  onDelete,
  onEdit,
  onPreview,
  onReset,
}: Props) => {
  if (clients.length === 0 && hasClients) {
    return (
      <EmptyState
        action={
          onReset ? (
            <Button
              onClick={onReset}
              size="sm"
              variant="outline"
            >
              Clear filters
            </Button>
          ) : undefined
        }
        className="client-list"
        description="Try another search, or clear the filters to see all your clients."
        icon={
          <MagnifyingGlassIcon
            aria-hidden
            size={iconSize.feature}
            weight="bold"
          />
        }
        title="No clients match"
      />
    );
  }

  if (clients.length === 0) {
    return (
      <EmptyState
        action={
          onAdd ? (
            <Button
              icon={
                <PlusIcon
                  aria-hidden
                  size={iconSize.control}
                  weight="bold"
                />
              }
              iconPosition="left"
              onClick={onAdd}
              size="sm"
              variant="accent"
            >
              Add client
            </Button>
          ) : undefined
        }
        className="client-list"
        description="Add a client to keep the contact details you use while preparing documents close at hand."
        icon={
          <UsersThreeIcon
            aria-hidden
            size={iconSize.feature}
            weight="bold"
          />
        }
        title="No clients yet"
      />
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
