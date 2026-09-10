"use client";

import { PencilSimpleIcon } from "@phosphor-icons/react";
import { useCallback, useState } from "react";

import { Avatar } from "@/components/commons/avatar/avatar";
import { Badge } from "@/components/commons/badge/badge";
import { Button } from "@/components/commons/button/button";
import { SidePanel } from "@/components/commons/side-panel/side-panel";
import { ClientForm } from "@/components/dashboard/client-form/client-form";
import { cn } from "@/lib/utils";
import type { Client, ClientInput } from "@/types/client";

export type ClientDetailPanelMode = "detail" | "edit";

export type ClientDetailPanelProps = {
  /** The client to show. `null` closes the panel. */
  client: Client | null;
  mode: ClientDetailPanelMode;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSave: (input: ClientInput) => void;
  isSaving?: boolean;
};

const EDIT_FORM_ID = "edit-client-form";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Read-only view of one saved client, with edit swapped into the same panel.
 *
 * Surfaces `address`, `brn` and `nationalId` — captured by `ClientForm` but shown
 * in no list column, so this panel is the only place a user can read them back.
 *
 * Composes `SidePanel` directly rather than extending `TemplatePreviewDialog`:
 * that component's body is a rendered `TemplateDocument` and its `open` state is
 * derived from a `MarketplaceTemplate`, neither of which a client has.
 */
export const ClientDetailPanel = ({
  client,
  isSaving = false,
  mode,
  onClose,
  onDelete,
  onEdit,
  onSave,
}: ClientDetailPanelProps) => {
  const isEditing = mode === "edit";

  // Dirtiness is tracked per edit session — one client, one visit to edit mode.
  // Recording *which* session was dirtied, rather than a bare boolean, means a
  // stale `true` from an earlier session reads as `false` immediately, with no
  // effect needed to reset it on the way in.
  const editSession = isEditing && client ? client.id : null;
  const [dirtiedSession, setDirtiedSession] = useState<string | null>(null);
  const isDirty = editSession !== null && dirtiedSession === editSession;

  // Stable while the session is: keeps `ClientForm`'s reporting effect from
  // re-running on every render of this panel.
  const handleDirtyChange = useCallback(
    (dirty: boolean) => {
      setDirtiedSession(dirty ? editSession : null);
    },
    [editSession],
  );

  // Mirrors `ClientForm`'s field order so the two modes read the same top to
  // bottom. `name` is omitted: it's already the panel title.
  const details: { label: string; value: string }[] = client
    ? [
        { label: "Company", value: client.companyName },
        { label: "Email", value: client.email },
        { label: "Phone", value: client.phone },
        { label: "National ID", value: client.nationalId },
        { label: "BRN", value: client.brn },
        { label: "Address", value: client.address },
      ]
    : [];

  return (
    <SidePanel
      ariaLabel={
        client
          ? isEditing
            ? `Edit ${client.name}`
            : `${client.name} details`
          : "Client details"
      }
      description={
        isEditing
          ? "Update the details used when prefilling documents for this client."
          : client?.companyName || "Client"
      }
      footer={
        client ? (
          isEditing ? (
            <div
              className="grid w-full grid-cols-2 gap-2"
              key="edit"
            >
              <Button
                className="w-full"
                onClick={onClose}
                size="sm"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                className="w-full disabled:opacity-45"
                disabled={isSaving || !isDirty}
                form={EDIT_FORM_ID}
                size="sm"
                type="submit"
                variant="accent"
              >
                {isSaving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          ) : (
            <div
              className="grid w-full grid-cols-[0.8fr_1.2fr] gap-2"
              key="detail"
            >
              <Button
                className="w-full"
                onClick={onDelete}
                size="sm"
                variant="outline"
              >
                Delete
              </Button>
              <Button
                className="w-full"
                icon={
                  <PencilSimpleIcon
                    aria-hidden
                    size={17}
                    weight="bold"
                  />
                }
                iconPosition="left"
                onClick={onEdit}
                size="sm"
              >
                Edit client
              </Button>
            </div>
          )
        ) : undefined
      }
      onClose={onClose}
      open={Boolean(client)}
      title={isEditing && client ? `Edit ${client.name}` : client?.name}
      tone="golden"
    >
      {client ? (
        isEditing ? (
          <ClientForm
            client={client}
            formId={EDIT_FORM_ID}
            key={client.id}
            onDirtyChange={handleDirtyChange}
            onSubmit={onSave}
          />
        ) : (
          <div className="client-detail-panel bg-base-200 p-3 sm:p-5">
            <section className="rounded-box border border-steel-mist bg-base-100 p-6">
              <div className="flex items-center gap-4">
                <Avatar
                  className="bg-play-teal text-nox-noir"
                  name={client.name}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="truncate font-title text-lg font-bold text-nox-noir">
                    {client.name}
                  </p>
                  <p className="truncate text-sm text-nox-noir/55">
                    {client.email || "—"}
                  </p>
                </div>
              </div>

              <Badge className="mt-4 w-fit">
                Added {dateFormatter.format(new Date(client.createdAt))}
              </Badge>

              <dl className="mt-6 grid gap-4 border-t border-steel-mist pt-6">
                {details.map((detail) => (
                  <div
                    className="grid gap-1"
                    key={detail.label}
                  >
                    <dt className="font-title text-xs font-semibold uppercase tracking-wide text-nox-noir/45">
                      {detail.label}
                    </dt>
                    <dd
                      className={cn(
                        "text-sm wrap-break-word",
                        detail.value
                          ? "font-medium text-nox-noir"
                          : "italic text-nox-noir/40",
                      )}
                    >
                      {detail.value || "Not set"}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        )
      ) : null}
    </SidePanel>
  );
};
