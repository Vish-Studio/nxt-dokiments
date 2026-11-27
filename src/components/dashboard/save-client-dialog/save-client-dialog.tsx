"use client";

import { UserPlusIcon } from "@phosphor-icons/react";

import { Button } from "@/components/commons/button/button";
import { Modal } from "@/components/commons/modal/modal";
import type { MissingClientField } from "@/lib/documents/client-from-document";

/** The client the document holds, as shown in the dialog's summary. */
export interface SaveClientSummary {
  address?: string;
  email?: string;
  name: string;
  phone?: string;
}

export interface SaveClientDialogProps {
  client: SaveClientSummary;
  /**
   * Required details the document lacks. When set, the client can't be saved
   * yet: the dialog says what to add and offers only "Not now".
   */
  missing?: MissingClientField[];
  /** "Not now", the close button, Escape or the backdrop: continue without saving. */
  onSkip: () => void;
  /** "Save client": add them to My Clients, then continue. */
  onSave: () => void;
  open: boolean;
}

const missingLabels: Record<MissingClientField, string> = {
  email: "an email",
  name: "a name",
  phone: "a phone number",
};

const joinMissing = (missing: MissingClientField[]) => {
  const labels = missing.map((field) => missingLabels[field]);
  return labels.length > 1
    ? `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`
    : labels[0];
};

/**
 * Asked once when Next leaves "Client details" with a new client typed in:
 * "Save this client?". A centred dialog on desktop, a bottom sheet on phones.
 *
 * Either answer keeps the details in the document and moves on; only "Save
 * client" adds them to My Clients. When the server would refuse the client
 * (no name, email or phone; see `clientFromDocument`), it says what is
 * missing instead of offering a save that would fail.
 */
export const SaveClientDialog = ({
  client,
  missing = [],
  onSave,
  onSkip,
  open,
}: SaveClientDialogProps) => {
  const canSave = missing.length === 0;
  const contact = [client.email, client.phone].filter(Boolean).join(" · ");

  return (
    <Modal
      actions={
        <div className="grid w-full gap-3">
          <div className="grid gap-3 max-sm:flex max-sm:flex-col-reverse sm:grid-cols-2">
            <Button
              className="w-full"
              onClick={onSkip}
              size="lg"
              variant="outline"
            >
              Not now
            </Button>
            {canSave ? (
              <Button
                className="w-full"
                onClick={onSave}
                size="lg"
                variant="primary"
              >
                Save client
              </Button>
            ) : null}
          </div>
          <p className="text-center text-sm text-nox-noir/60">
            Either way, this document keeps these details.
          </p>
        </div>
      }
      className="save-client-dialog"
      description={
        canSave
          ? `Add ${client.name} to My Clients, so their details fill in for you next time.`
          : `To save this client, add ${joinMissing(missing)} first. You can still continue without saving.`
      }
      icon={UserPlusIcon}
      onClose={onSkip}
      open={open}
      title="Save this client?"
      tone="info"
    >
      <div className="grid gap-1.5 rounded-field bg-base-200 p-4 text-sm">
        <span className="font-title text-[0.9375rem] font-bold text-nox-noir">
          {client.name || "No name yet"}
        </span>
        {contact ? <span className="text-nox-noir/65">{contact}</span> : null}
        {client.address ? (
          <span className="text-nox-noir/65">{client.address}</span>
        ) : null}
      </div>
    </Modal>
  );
};

export default SaveClientDialog;
