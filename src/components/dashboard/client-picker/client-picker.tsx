"use client";

import Link from "next/link";

import { Select } from "@/components/commons/select/select";
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

  return (
    <div className="client-picker">
      <Select
        label="Prefill from client (optional)"
        onChange={(event) => {
          const client = clients.find(
            (candidate) => candidate.id === event.target.value,
          );
          if (client) {
            onSelect(client);
          }
        }}
        options={clients.map((client) => ({
          label: client.companyName || client.name,
          value: client.id,
        }))}
        placeholder="Choose a client"
        // Uncontrolled on purpose: this is an action, not a stored field. The
        // document records the filled values, not which client they came from,
        // so there is no selection state to keep in sync with the draft.
        defaultValue=""
      />
    </div>
  );
};
