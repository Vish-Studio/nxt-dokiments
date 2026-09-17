"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

import { Dropdown } from "@/components/commons/dropdown/dropdown";
import { useClientsQuery } from "@/hooks/queries/use-clients";
import { supportsClientPrefill } from "@/lib/market-place/prefill";
import type { Client } from "@/types/client";
import type { TemplateField } from "@/types/template";

export type ClientPickerProps = {
  /** The target template's fields — decides whether this template can be prefilled at all. */
  fields: TemplateField[];
  onSelect: (client: Client) => void;
};

/**
 * Fills a document's recipient block from one of the user's saved clients.
 *
 * Renders nothing for document types with no counterparty, so the editor doesn't
 * show a control that could never do anything. Reads the same
 * `useClientsQuery` cache entry as My Clients and the Dashboard tile, so a client
 * added in one place is immediately pickable here without a refetch.
 */
export const ClientPicker = ({ fields, onSelect }: ClientPickerProps) => {
  const { data: clients = [] } = useClientsQuery();
  const [selectedClientId, setSelectedClientId] = useState("");

  if (!supportsClientPrefill(fields)) {
    return null;
  }

  if (clients.length === 0) {
    return (
      <p className="client-picker text-xs leading-5 text-nox-noir/55">
        Save a client under{" "}
        <Link className="link font-semibold text-nox-noir" href="/my-clients">
          My clients
        </Link>{" "}
        to fill recipient details in one step.
      </p>
    );
  }

  const selectedClient = clients.find((client) => client.id === selectedClientId);
  const selectedLabel = selectedClient
    ? selectedClient.companyName || selectedClient.name
    : "Choose a client";

  return (
    <div className="client-picker">
      <p className="mb-2 font-title text-sm font-semibold text-nox-noir">
        Prefill from client (optional)
      </p>
      <Dropdown
        ariaLabel="Prefill from client (optional)"
        buttonClassName="w-full justify-between"
        className="w-full"
        groups={[
          {
            label: "Saved clients",
            onChange: (value) => {
              const client = clients.find((candidate) => candidate.id === value);
              if (client) {
                setSelectedClientId(value);
                onSelect(client);
              }
            },
            options: clients.map((client) => ({
              label: client.companyName || client.name,
              value: client.id,
            })),
            value: selectedClientId,
          },
        ]}
        menuClassName="w-full"
        trigger={
          <>
            <span className="min-w-0 truncate text-left">{selectedLabel}</span>
            <CaretDownIcon aria-hidden className="shrink-0" size={14} />
          </>
        }
      />
    </div>
  );
};
