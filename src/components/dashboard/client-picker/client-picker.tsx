"use client";

import {
  AddressBookIcon,
  CaretDownIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/commons/confirm-dialog/confirm-dialog";
import { Dropdown } from "@/components/commons/dropdown/dropdown";
import { ClientSourceOption } from "@/components/dashboard/client-source-option/client-source-option";
import { ClientSummaryCard } from "@/components/dashboard/client-summary-card/client-summary-card";
import { SaveClientPrompt } from "@/components/dashboard/save-client-prompt/save-client-prompt";
import {
  useClientsQuery,
  useCreateClientMutation,
} from "@/hooks/queries/use-clients";
import { findMatchingClient } from "@/lib/clients/clients";
import {
  clientFieldKeys,
  clientInputFromValues,
  supportsClientPrefill,
} from "@/lib/market-place/prefill";
import { useToastStore } from "@/stores/toast-store";
import type { Client, ClientInput } from "@/types/client";
import type { TemplateField } from "@/types/template";

type ClientSource = "saved" | "new";

export type ClientPickerProps = {
  /** The recipient inputs rendered by `TemplateForm`; shown only for a new client. */
  children?: ReactNode;
  /** The target template's fields — decides whether this template can be prefilled at all. */
  fields: TemplateField[];
  /** Clears the recipient fields, e.g. when switching between a saved and a new client. */
  onClear?: () => void;
  onSelect: (client: Client) => void;
  /** The document's current values: matched against saved clients and used to seed saving. */
  values?: Record<string, string>;
};

/**
 * A document's Client details section. **Saved client** picks from My Clients and shows that
 * client read-only (no inputs); **New client** shows the recipient inputs and, once a name is
 * typed, offers to save them to My Clients (after a confirm dialog) unless they are already there.
 *
 * A reopened document starts on the right side: its recipient matches a saved client → Saved
 * client with that client shown; details typed by hand → New client, so they are never hidden.
 * Renders just `children` for document types with no counterparty.
 */
export const ClientPicker = ({
  children,
  fields,
  onClear,
  onSelect,
  values = {},
}: ClientPickerProps) => {
  const canPrefill = supportsClientPrefill(fields);
  // Skip the fetch entirely for templates that have no recipient block to fill.
  const { data: clients = [] } = useClientsQuery({ enabled: canPrefill });
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  // `null` until the user chooses, so the starting side can follow the document's details.
  const [chosenSource, setChosenSource] = useState<ClientSource | null>(null);
  const [isConfirmingSave, setIsConfirmingSave] = useState(false);
  const { isPending: isSavingClient, mutate: createClient } =
    useCreateClientMutation();
  const showToast = useToastStore((state) => state.showToast);

  if (!canPrefill) {
    return children;
  }

  const draftClient = clientInputFromValues(values, fields);
  const recipientName = draftClient.companyName ?? "";
  const matchedClient = findMatchingClient(clients, draftClient);
  // A client needs an email and phone (see ClientSchema). Templates without those recipient
  // fields can never supply them, so they get no save prompt at all.
  const recipientKeys = clientFieldKeys(fields);
  const canSaveFromTemplate =
    recipientKeys.includes("toEmail") && recipientKeys.includes("toPhone");
  const hasValidEmail = /\S+@\S+\.\S+/.test(draftClient.email ?? "");
  const missingForSave = [
    hasValidEmail ? null : "email",
    draftClient.phone ? null : "phone",
  ]
    .filter(Boolean)
    .join(" and ");
  const hasClients = clients.length > 0;
  const source: ClientSource = !hasClients
    ? "new"
    : (chosenSource ?? (recipientName && !matchedClient ? "new" : "saved"));
  const selectedClient =
    clients.find((client) => client.id === selectedClientId) ??
    (source === "saved" ? matchedClient : undefined);

  const selectClient = (client: Client) => {
    setSelectedClientId(client.id);
    // Start from a clean recipient so a field the client lacks doesn't keep an old value.
    onClear?.();
    onSelect(client);
  };

  const contactSummary = [draftClient.email, draftClient.phone]
    .filter(Boolean)
    .join(" · ");

  const saveTypedClient = () => {
    // The document has one recipient name, so it stands in for both the company and the
    // contact; the user can rename the contact later in My Clients.
    const input: ClientInput = {
      address: draftClient.address ?? "",
      brn: draftClient.brn ?? "",
      companyName: recipientName,
      email: draftClient.email ?? "",
      name: recipientName,
      nationalId: "",
      phone: draftClient.phone ?? "",
    };

    createClient(input, {
      onError: (error) => {
        setIsConfirmingSave(false);
        showToast({ message: error.message, tone: "error" });
      },
      onSuccess: (client) => {
        setIsConfirmingSave(false);
        showToast({
          message: `${client.companyName || client.name} saved to My Clients.`,
          tone: "success",
        });
        // The new client is now a saved one: show it read-only, filled from its saved record.
        setChosenSource("saved");
        selectClient(client);
      },
    });
  };

  const changeSource = (next: ClientSource) => {
    if (next === source) {
      return;
    }
    // Each side starts empty: a picked client's details shouldn't leak into a new client,
    // and hand-typed details shouldn't sit hidden behind the saved-client view.
    setSelectedClientId(null);
    onClear?.();
    setChosenSource(next);
  };

  return (
    <div className="client-picker grid gap-4">
      {hasClients ? (
        <div
          aria-label="Client source"
          className="grid gap-2 sm:grid-cols-2"
          role="radiogroup"
        >
          <ClientSourceOption
            accent="bg-play-blue"
            detail="Pick from My Clients"
            icon={AddressBookIcon}
            isSelected={source === "saved"}
            label="Saved client"
            onSelect={() => changeSource("saved")}
          />
          <ClientSourceOption
            accent="bg-golden-harvest"
            detail="Type their details"
            icon={UserPlusIcon}
            isSelected={source === "new"}
            label="New client"
            onSelect={() => changeSource("new")}
          />
        </div>
      ) : null}

      {source === "saved" ? (
        <>
          <Dropdown
            ariaLabel="Prefill from client (optional)"
            buttonClassName="w-full justify-between"
            className="w-full"
            groups={[
              {
                label: "Saved clients",
                onChange: (value) => {
                  const client = clients.find(
                    (candidate) => candidate.id === value,
                  );
                  if (client) {
                    selectClient(client);
                  }
                },
                options: clients.map((client) => ({
                  label: client.companyName || client.name,
                  value: client.id,
                })),
                value: selectedClient?.id ?? "",
              },
            ]}
            menuClassName="w-full"
            trigger={
              <>
                <span className="min-w-0 truncate text-left">
                  {selectedClient
                    ? selectedClient.companyName || selectedClient.name
                    : "Choose a saved client"}
                </span>
                <CaretDownIcon
                  aria-hidden
                  className="shrink-0"
                  size={14}
                />
              </>
            }
          />
          {selectedClient ? (
            <ClientSummaryCard client={selectedClient} />
          ) : (
            <p className="text-xs text-nox-noir/55">
              Choose a client and their details fill in for you.
            </p>
          )}
        </>
      ) : (
        <>
          {children}
          {recipientName && canSaveFromTemplate ? (
            <SaveClientPrompt
              clientName={recipientName}
              isSaved={Boolean(matchedClient)}
              missing={missingForSave || undefined}
              onSave={() => setIsConfirmingSave(true)}
            />
          ) : null}
        </>
      )}

      <ConfirmDialog
        confirmLabel="Save client"
        confirmLoading={isSavingClient}
        description={`${recipientName}${contactSummary ? ` (${contactSummary})` : ""} will be added to My Clients. Next time, pick them as a saved client and their details fill in for you.`}
        onClose={() => setIsConfirmingSave(false)}
        onConfirm={saveTypedClient}
        open={isConfirmingSave}
        title={`Save ${recipientName} to My Clients?`}
      />
    </div>
  );
};
