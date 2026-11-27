"use client";

import { CaretDownIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { Dropdown } from "@/components/commons/dropdown/dropdown";
import { useClientsQuery } from "@/hooks/queries/use-clients";
import { iconSize } from "@/lib/icons";
import { supportsClientPrefill } from "@/lib/market-place/prefill";
import { getInitials } from "@/lib/utils";
import type { Client } from "@/types/client";
import type { TemplateField } from "@/types/template";

export type ClientPickerProps = {
  /** The target template's fields — decides whether this template can be prefilled at all. */
  fields: TemplateField[];
  onSelect: (client: Client) => void;
};

/**
 * "Choose a client": fills a document's client block from one of the user's
 * saved clients. Once one is picked, the trigger shows who (initials tile,
 * name, email, "Change") and a green line confirms the details were filled
 * in, and that edits only change this document.
 *
 * Renders nothing for document types with no counterparty. With no saved
 * clients it says so and points to "New client" (in `ClientDetailsChooser`).
 * Reads the same `useClientsQuery` cache entry as My Clients, so a client
 * saved in one place is immediately pickable here.
 */
export const ClientPicker = ({ fields, onSelect }: ClientPickerProps) => {
  const canPrefill = supportsClientPrefill(fields);
  // Skip the fetch entirely for templates that have no client block to fill.
  const { data: clients = [] } = useClientsQuery({ enabled: canPrefill });
  const [selectedClientId, setSelectedClientId] = useState("");

  if (!canPrefill) {
    return null;
  }

  if (clients.length === 0) {
    return (
      <p className="client-picker rounded-field bg-base-200 px-4 py-3.5 text-sm leading-5 text-nox-noir/70">
        No saved clients yet. Choose{" "}
        <span className="font-semibold text-nox-noir">New client</span> to add
        one.
      </p>
    );
  }

  const selectedClient = clients.find(
    (client) => client.id === selectedClientId,
  );
  const selectedName = selectedClient
    ? selectedClient.companyName || selectedClient.name
    : "";

  return (
    <div className="client-picker grid gap-2">
      <p className="font-title text-sm font-semibold text-nox-noir">
        Choose a client
      </p>
      <Dropdown
        ariaLabel="Choose a client"
        buttonClassName="h-auto! min-h-12 w-full justify-between gap-3 py-2! text-left"
        className="w-full"
        groups={[
          {
            label: "Saved clients",
            onChange: (value) => {
              const client = clients.find(
                (candidate) => candidate.id === value,
              );
              if (client) {
                setSelectedClientId(value);
                onSelect(client);
              }
            },
            options: clients.map((client) => ({
              description: client.email,
              label: client.companyName || client.name,
              value: client.id,
            })),
            value: selectedClientId,
          },
        ]}
        menuClassName="w-full"
        sheetTitle="Choose a client"
        trigger={
          selectedClient ? (
            <>
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-field bg-play-blue font-title text-xs font-bold text-nox-noir"
              >
                {getInitials(selectedName)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-title text-[0.9375rem] font-bold text-nox-noir">
                  {selectedName}
                </span>
                <span className="block truncate text-xs font-normal text-nox-noir/60">
                  {selectedClient.email}
                </span>
              </span>
              <span className="shrink-0 text-xs font-semibold text-nox-noir/70">
                Change
              </span>
              <CaretDownIcon
                aria-hidden
                className="shrink-0"
                size={14}
              />
            </>
          ) : (
            <>
              <span className="min-w-0 flex-1 truncate text-nox-noir/60">
                Choose a client
              </span>
              <CaretDownIcon
                aria-hidden
                className="shrink-0"
                size={14}
              />
            </>
          )
        }
      />
      {selectedClient ? (
        <p
          className="mt-1 flex items-start gap-2 text-sm leading-5 text-nox-noir/75"
          role="status"
        >
          <CheckCircleIcon
            aria-hidden
            className="mt-0.5 shrink-0 text-success"
            size={iconSize.control}
            weight="bold"
          />
          Details filled in. Edits below only change this document.
        </p>
      ) : null}
    </div>
  );
};
