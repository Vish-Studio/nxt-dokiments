"use client";

import {
  PlusIcon,
  TrashIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { Button } from "@/components/commons/button/button";
import CollectionToolbar from "@/components/commons/collection-toolbar/collection-toolbar";
import { EmptyState } from "@/components/commons/empty-state/empty-state";
import { ConfirmDialog } from "@/components/commons/confirm-dialog/confirm-dialog";
import { FloatingActionButton } from "@/components/commons/floating-action-button/floating-action-button";
import { SidePanel } from "@/components/commons/side-panel/side-panel";
import { ClientDetailPanel } from "@/components/dashboard/client-detail-panel/client-detail-panel";
import { ClientForm } from "@/components/dashboard/client-form/client-form";
import { ClientList } from "@/components/dashboard/client-list/client-list";
import { ClientListSkeleton } from "@/components/dashboard/client-list/client-list-skeleton";
import { ResponsiveHeaderControls } from "@/components/dashboard/responsive-header-controls/responsive-header-controls";
import {
  useClientsQuery,
  useCreateClientMutation,
  useDeleteClientMutation,
  useUpdateClientMutation,
} from "@/hooks/queries/use-clients";
import { useScrollContentToTopOnMobile } from "@/hooks/use-scroll-content-to-top-on-mobile";
import { iconSize } from "@/lib/icons";
import type { Client, ClientInput } from "@/types/client";

/**
 * Which side panel is showing. A single value rather than one boolean each,
 * because `SidePanel` is a modal overlay — only one can be open, and the detail
 * and edit panels are two modes of the same one.
 *
 * The open client is held by ID, not by value: `useUpdateClientMutation` patches
 * the query cache optimistically, so deriving the client from `clients` on every
 * render means a saved edit is reflected immediately and a deleted client closes
 * the panel on its own.
 */
type Panel =
  | { kind: "none" }
  | { kind: "add" }
  | { kind: "detail"; clientId: string }
  | { kind: "edit"; clientId: string };

const CLOSED: Panel = { kind: "none" };

export const MyClientsView = () => {
  const {
    data: clients = [],
    isError,
    isLoading,
    refetch,
  } = useClientsQuery();
  const { mutate: createClient } = useCreateClientMutation();
  const { mutate: deleteClient } = useDeleteClientMutation();
  const { isPending: isSaving, mutate: updateClient } =
    useUpdateClientMutation();
  const [panel, setPanel] = useState<Panel>(CLOSED);
  const [pendingDeletion, setPendingDeletion] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const [contactFilter, setContactFilter] = useState("all");
  const [sort, setSort] = useState("name");
  const scrollContentToTop = useScrollContentToTopOnMobile();

  const visibleClients = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const matches = clients.filter((client) => {
      const hasContact = Boolean(client.email || client.phone);
      return (
        (contactFilter === "all" ||
          (contactFilter === "with-contact" && hasContact) ||
          (contactFilter === "without-contact" && !hasContact)) &&
        `${client.name} ${client.companyName} ${client.email} ${client.phone}`
          .toLocaleLowerCase()
          .includes(query)
      );
    });

    return matches.sort((first, second) => {
      if (sort === "company") {
        return (first.companyName || first.name).localeCompare(
          second.companyName || second.name,
        );
      }
      return first.name.localeCompare(second.name);
    });
  }, [clients, contactFilter, search, sort]);

  // Reset clears search and filters, never the sort.
  const resetControls = () => {
    setSearch("");
    setContactFilter("all");
  };

  const toolbar = (
    <CollectionToolbar
      ariaLabel="Search, sort, and filter clients"
      appearance="compact"
      canReset={Boolean(search || contactFilter !== "all")}
      endAction={
        <Button
          icon={<PlusIcon aria-hidden size={16} weight="bold" />}
          iconPosition="left"
          onClick={() => setPanel({ kind: "add" })}
          size="sm"
          variant="accent"
        >
          Add client
        </Button>
      }
      filterStyle="chips"
      filters={[
        {
          id: "contact",
          label: "Contact",
          value: contactFilter,
          defaultValue: "all",
          options: [
            { label: "Any contact details", value: "all" },
            { label: "With contact details", value: "with-contact" },
            { label: "Without contact details", value: "without-contact" },
          ],
          onChange: setContactFilter,
        },
      ]}
      onReset={resetControls}
      onCollectionChange={scrollContentToTop}
      onSearch={setSearch}
      onSort={setSort}
      resultLabel={`${visibleClients.length} ${visibleClients.length === 1 ? "client" : "clients"}`}
      search={search}
      searchLabel="Search clients"
      searchPlaceholder="Search clients…"
      sort={sort}
      sortOptions={[
        { label: "Name: A–Z", value: "name" },
        { label: "Company: A–Z", value: "company" },
      ]}
    />
  );
  const headerSearch = (
    <CollectionToolbar
      appearance="header-dark"
      ariaLabel="Search clients"
      layout="header-search"
      onReset={resetControls}
      onCollectionChange={scrollContentToTop}
      onSearch={setSearch}
      onSort={setSort}
      search={search}
      searchLabel="Search clients"
      searchPlaceholder="Search clients…"
      sort={sort}
      sortOptions={[]}
    />
  );

  const activeClient =
    panel.kind === "detail" || panel.kind === "edit"
      ? (clients.find((client) => client.id === panel.clientId) ?? null)
      : null;

  const closePanel = () => setPanel(CLOSED);

  const handleAdd = (input: ClientInput) => {
    createClient(input);
    closePanel();
  };

  const handleSave = (input: ClientInput) => {
    if (panel.kind !== "edit") {
      return;
    }

    updateClient({ clientId: panel.clientId, patch: input });
    // Straight back to the detail view so the user sees the change land, rather
    // than closing out to the list and having to reopen to confirm it saved.
    setPanel({ clientId: panel.clientId, kind: "detail" });
  };

  const requestDeletionFromPanel = () => {
    if (!activeClient) {
      return;
    }

    // Close first: a confirm dialog stacked over an open panel would leave two
    // overlays fighting for the Escape key.
    setPendingDeletion(activeClient);
    closePanel();
  };

  const confirmDelete = () => {
    if (pendingDeletion) {
      deleteClient(pendingDeletion.id);
    }
    setPendingDeletion(null);
  };

  return (
    <div className="my-clients-view flex min-h-0 w-full flex-1 flex-col gap-2 pt-6">
      <ResponsiveHeaderControls desktopContent={toolbar} desktopHeader={headerSearch}>
        {toolbar}
      </ResponsiveHeaderControls>
      {isLoading ? (
        <ClientListSkeleton />
      ) : isError ? (
        // Distinct from the empty state on purpose: showing "No clients yet"
        // after a failed request would tell the user their clients are gone.
        <EmptyState
          action={
            <Button onClick={() => void refetch()} size="sm" variant="outline">
              Try again
            </Button>
          }
          description="Your clients are saved to your account, nothing has been lost. Check your connection and try again."
          icon={<WarningCircleIcon aria-hidden size={iconSize.feature} weight="bold" />}
          title="Couldn't load your clients"
          tone="error"
        />
      ) : (
        <ClientList
          clients={visibleClients}
          hasClients={clients.length > 0}
          onAdd={() => setPanel({ kind: "add" })}
          onReset={resetControls}
          onDelete={setPendingDeletion}
          onEdit={(client) => setPanel({ clientId: client.id, kind: "edit" })}
          onPreview={(client) =>
            setPanel({ clientId: client.id, kind: "detail" })
          }
        />
      )}

      {panel.kind === "none" && !pendingDeletion ? (
        <FloatingActionButton
          className="lg:hidden"
          icon={
            <PlusIcon
              aria-hidden
              size={18}
              weight="bold"
            />
          }
          label="Add client"
          onClick={() => setPanel({ kind: "add" })}
        />
      ) : null}

      <ClientDetailPanel
        client={activeClient}
        isSaving={isSaving}
        mode={panel.kind === "edit" ? "edit" : "detail"}
        onClose={closePanel}
        onDelete={requestDeletionFromPanel}
        onEdit={() => {
          if (activeClient) {
            setPanel({ clientId: activeClient.id, kind: "edit" });
          }
        }}
        onSave={handleSave}
      />

      <SidePanel
        ariaLabel="Add client"
        description="Add the client details you use when preparing documents."
        footer={
          <div className="grid w-full grid-cols-2 gap-2">
            <Button
              className="w-full"
              onClick={closePanel}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="w-full"
              form="add-client-form"
              icon={
                <PlusIcon
                  aria-hidden
                  size={17}
                  weight="bold"
                />
              }
              iconPosition="left"
              type="submit"
              variant="accent"
            >
              Add client
            </Button>
          </div>
        }
        onClose={closePanel}
        open={panel.kind === "add"}
        title="Add client"
        tone="golden"
      >
        <ClientForm
          formId="add-client-form"
          onSubmit={handleAdd}
        />
      </SidePanel>

      <ConfirmDialog
        confirmLabel="Delete client"
        confirmVariant="danger"
        icon={TrashIcon}
        description={`Delete ${pendingDeletion?.name ?? "this client"} from your clients? This cannot be undone. Documents you already prepared for them are not affected.`}
        onClose={() => setPendingDeletion(null)}
        onConfirm={confirmDelete}
        open={Boolean(pendingDeletion)}
        title="Delete client?"
      />
    </div>
  );
};
