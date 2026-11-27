"use client";

import { InfoIcon, UserPlusIcon, UsersIcon } from "@phosphor-icons/react";

import { TabMenu } from "@/components/commons/tab-menu/tab-menu";
import { ClientPicker } from "@/components/dashboard/client-picker/client-picker";
import { iconSize, navIconWeight } from "@/lib/icons";
import { supportsClientPrefill } from "@/lib/market-place/prefill";
import type { Client } from "@/types/client";
import type { TemplateField } from "@/types/template";

/**
 * How the user fills in who a document is for.
 * - `saved`: pick from My Clients; the fields fill in.
 * - `new`: type the details; Next then offers to save them to My Clients.
 */
export type ClientMode = "saved" | "new";

export interface ClientDetailsChooserProps {
  /** The template's fields; nothing renders for documents with no client. */
  fields: TemplateField[];
  mode: ClientMode;
  onModeChange: (mode: ClientMode) => void;
  /** A saved client was picked: prefill the client fields from it. */
  onSelect: (client: Client) => void;
}

/**
 * Top of the "Client details" section: the question "Who is this document
 * for?", a Saved client / New client switch (`TabMenu`), then either
 * `ClientPicker` or a tip that says what to type and that Next will offer to
 * save them, so the save prompt never comes as a surprise.
 *
 * The mode lives with the caller, which decides on Next whether to ask
 * "Save this client?". See docs/dashboard-ux-flow.md.
 */
export const ClientDetailsChooser = ({
  fields,
  mode,
  onModeChange,
  onSelect,
}: ClientDetailsChooserProps) => {
  if (!supportsClientPrefill(fields)) {
    return null;
  }

  return (
    // The dashed rule separates choosing who from the client's fields below.
    <div className="client-details-chooser mb-2 grid gap-6 border-b border-dashed border-steel-mist pb-6">
      <div className="grid gap-3">
        <div>
          <p className="font-title text-[0.9375rem] font-bold text-nox-noir">
            Who is this document for?
          </p>
          <p className="mt-1 text-sm leading-5 text-nox-noir/65">
            Pick someone you&apos;ve worked with, or add a new client.
          </p>
        </div>
        <TabMenu
          ariaLabel="Client"
          className="[&_[role=tab]]:flex-1 [&_[role=tab]]:justify-center"
          items={[
            {
              icon: (isActive: boolean) => (
                <UsersIcon
                  aria-hidden
                  size={iconSize.tab}
                  weight={navIconWeight(isActive)}
                />
              ),
              id: "saved",
              label: "Saved client",
            },
            {
              icon: (isActive: boolean) => (
                <UserPlusIcon
                  aria-hidden
                  size={iconSize.tab}
                  weight={navIconWeight(isActive)}
                />
              ),
              id: "new",
              label: "New client",
            },
          ]}
          onChange={(id) => onModeChange(id === "new" ? "new" : "saved")}
          value={mode}
        />
      </div>

      {mode === "saved" ? (
        <ClientPicker
          fields={fields}
          onSelect={onSelect}
        />
      ) : (
        <p className="flex items-start gap-3 rounded-field bg-play-blue/25 px-4 py-3.5 text-sm leading-5 text-nox-noir/80">
          <InfoIcon
            aria-hidden
            className="mt-0.5 shrink-0 text-nox-noir"
            size={iconSize.control}
            weight="bold"
          />
          Type the client&apos;s details below. When you press Next, you can
          save them to My Clients for next time.
        </p>
      )}
    </div>
  );
};

export default ClientDetailsChooser;
