"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { Button } from "@/components/commons/button/button";
import { ConfirmDialog } from "@/components/commons/confirm-dialog/confirm-dialog";
import { FloatingActionButton } from "@/components/commons/floating-action-button/floating-action-button";
import { SidePanel } from "@/components/commons/side-panel/side-panel";
import { ClientForm } from "@/components/dashboard/client-form/client-form";
import { ClientList } from "@/components/dashboard/client-list/client-list";
import { useAuthStore } from "@/stores/auth-store";
import { useClientsStore } from "@/stores/clients-store";
import type { Client, ClientInput } from "@/types/client";

const emptyClients: Client[] = [];

export const MyClientsView = () => {
  const userId = useAuthStore((state) => state.user?.uid);
  const clients = useClientsStore((state) =>
    userId ? (state.clientsByUser[userId] ?? emptyClients) : emptyClients,
  );
  const addClient = useClientsStore((state) => state.addClient);
  const removeClient = useClientsStore((state) => state.removeClient);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<Client | null>(null);

  const handleAdd = (input: ClientInput) => {
    if (userId) {
      addClient(userId, input);
      setIsAddPanelOpen(false);
    }
  };

  const confirmDelete = () => {
    if (userId && pendingDeletion) {
      removeClient(userId, pendingDeletion.id);
    }
    setPendingDeletion(null);
  };

  return (
    <div className="my-clients-view flex w-full flex-col gap-6">
      <ClientList clients={clients} onDelete={setPendingDeletion} />

      <FloatingActionButton
        icon={<PlusIcon aria-hidden size={18} weight="bold" />}
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
              icon={<PlusIcon aria-hidden size={17} weight="bold" />}
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
        <ClientForm formId="add-client-form" onAdd={handleAdd} />
      </SidePanel>

      <ConfirmDialog
        confirmLabel="Delete client"
        confirmVariant="danger"
        description={`Delete ${pendingDeletion?.name ?? "this client"} from your local client list? This cannot be undone.`}
        onClose={() => setPendingDeletion(null)}
        onConfirm={confirmDelete}
        open={Boolean(pendingDeletion)}
        title="Delete client?"
      />
    </div>
  );
};
