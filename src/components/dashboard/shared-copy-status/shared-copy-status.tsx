import { LockSimpleIcon } from "@phosphor-icons/react";

import { Button } from "@/components/commons/button/button";
import type { SharedDocument } from "@/types/sharing";

export interface SharedCopyStatusProps {
  /** The shared copy of the document being edited. */
  document: SharedDocument;
  /** The field's own label, e.g. "Recipient signature". */
  label: string;
  /** Opens the shared copy, where the signature lives. */
  onView: () => void;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Stands in for the recipient signature input in the owner's editor once the
 * document has been shared: only the recipient can sign, so the owner sees who
 * the document is waiting on, or who signed, and a way to open the shared copy.
 */
export const SharedCopyStatus = ({
  document,
  label,
  onView,
}: SharedCopyStatusProps) => {
  const signature = Object.values(document.signatures)[0];
  const recipient = document.recipients[0]?.email;

  return (
    <div className="shared-copy-status grid gap-2">
      <span className="font-title text-sm font-semibold text-nox-noir">
        {label}
      </span>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-field border border-steel-mist bg-base-200 px-3 py-2.5">
        <p className="flex min-w-0 items-center gap-2 text-sm text-nox-noir/70">
          <LockSimpleIcon
            aria-hidden
            className="shrink-0"
            size={16}
            weight="bold"
          />
          <span className="min-w-0 wrap-break-word">
            {signature
              ? `Signed by ${signature.email} on ${dateFormatter.format(signature.signedAt)}`
              : `Waiting for ${recipient} to sign`}
          </span>
        </p>
        <Button
          onClick={onView}
          size="sm"
          type="button"
          variant="outline"
        >
          View shared copy
        </Button>
      </div>
    </div>
  );
};
