"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { Button } from "@/components/commons/button/button";
import { ConfirmDialog } from "@/components/commons/confirm-dialog/confirm-dialog";
import { FloatingActionButton } from "@/components/commons/floating-action-button/floating-action-button";
import { SidePanel } from "@/components/commons/side-panel/side-panel";
import { ClientForm } from "@/components/dashboard/client-form/client-form";
import { ClientListSkeleton } from "@/components/dashboard/client-list-skeleton/client-list-skeleton";
import { ClientList } from "@/components/dashboard/client-list/client-list";
import {
  useClientsQuery,
  useCreateClientMutation,
  useDeleteClientMutation,
} from "@/hooks/queries/use-clients";
import type { Client, ClientInput } from "@/types/client";

export const MyClientsView = () => {
  const { data: clients = [], isError, isLoading } = useClientsQuery();
  const { mutate: createClient } = useCreateClientMutation();
  const { mutate: deleteClient } = useDeleteClientMutation();
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<Client | null>(null);

  const handleAdd = (input: ClientInput) => {
    createClient(input);
    setIsAddPanelOpen(false);
  };

  const confirmDelete = () => {
    if (pendingDeletion) {
      deleteClient(pendingDeletion.id);
    }
    setPendingDeletion(null);
  };

  return (
    <div className="my-clients-view flex w-full flex-col gap-6">
      {isLoading ? (
        <ClientListSkeleton />
      ) : isError ? (
        // Distinct from the empty state on purpose: showing "No clients yet"
        // after a failed request would tell the user their clients are gone.
        <section className="grid place-items-center rounded-box border border-dashed border-error/40 bg-base-100 p-10 text-center">
          <h2 className="font-title text-lg font-bold text-nox-noir">
            Couldn&apos;t load your clients
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-nox-noir/60">
            Your clients are saved to your account — nothing has been lost.
            Check your connection and try again.
          </p>
        </section>
      ) : (
        <ClientList
          clients={clients}
          onDelete={setPendingDeletion}
        />
      )}

      <FloatingActionButton
        icon={
          <PlusIcon
            aria-hidden
            size={18}
            weight="bold"
          />
        }
        label="Add client"
        onClick={() => setIsAddPanelOpen(true)}
      />

      <SidePanel
        ariaLabel="Add client"
        description="Add the client details you use when preparing documents."
        footer={
          <div className="grid w-full grid-cols-2 gap-2">
            <Button
              className="w-full"
              onClick={() => setIsAddPanelOpen(false)}
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
        onClose={() => setIsAddPanelOpen(false)}
        open={isAddPanelOpen}
        title="Add client"
        tone="golden"
      >
        <ClientForm
          formId="add-client-form"
          onAdd={handleAdd}
        />
      </SidePanel>

      <ConfirmDialog
        confirmLabel="Delete client"
        confirmVariant="danger"
        description={`Delete ${pendingDeletion?.name ?? "this client"} from your clients? This cannot be undone. Documents you already prepared for them are not affected.`}
        onClose={() => setPendingDeletion(null)}
        onConfirm={confirmDelete}
        open={Boolean(pendingDeletion)}
        title="Delete client?"
      />
    </div>
  );
};
