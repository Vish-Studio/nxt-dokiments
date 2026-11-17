"use client";

import {
  CheckIcon,
  FilePdfIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";
import { useEffect } from "react";

import { Button } from "@/components/commons/button/button";
import { iconSize } from "@/lib/icons";

import { DocumentSavedAction } from "./document-saved-action";

export interface DocumentSavedDialogProps {
  /** The saved document's display name, quoted in the confirmation. */
  documentName: string;
  /** Leaves the editor for the documents list. The only way to close the dialog. */
  onContinue: () => void;
  /** Opens the PDF export for the document that was just saved. */
  onDownload: () => void;
  /**
   * Opens the share dialog for the saved document. Omit it when sharing is
   * switched off (`NEXT_PUBLIC_DOCUMENT_SHARING_ENABLED`), and the Share action
   * is not shown.
   */
  onShare?: () => void;
  open: boolean;
}

/**
 * Confirms a successful save and offers the natural next step: share the
 * document or download it as a PDF, or continue back to the documents list.
 *
 * A golden success panel (the brand's "done" colour, as on the welcome card)
 * sits above two tinted next-step cards; Continue is a quieter outline button
 * so the next steps lead. Like the plain confirmation it replaces, it cannot be
 * dismissed with Escape or a backdrop click, so the user always picks a step.
 */
export const DocumentSavedDialog = ({
  documentName,
  onContinue,
  onDownload,
  onShare,
  open,
}: DocumentSavedDialogProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-label="Document saved"
      aria-modal="true"
      className="document-saved-dialog fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-nox-noir/55"
      />

      {/* Scrolls inside the viewport on short or landscape phones. */}
      <div className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-box border border-steel-mist bg-base-100 p-3">
        <div className="rounded-box bg-golden-harvest p-5">
          <span className="grid size-11 place-items-center rounded-box bg-nox-noir text-golden-harvest">
            <CheckIcon
              aria-hidden
              size={iconSize.feature}
              weight="bold"
            />
          </span>
          <h3 className="mt-4 font-title text-2xl font-bold text-nox-noir">
            Document saved
          </h3>
          <p className="mt-1 text-sm leading-6 text-nox-noir/70">
            <span className="font-semibold text-nox-noir">
              &quot;{documentName}&quot;
            </span>{" "}
            is saved and ready to go.
          </p>
        </div>

        <div className="px-2 pt-5 pb-2">
          <p className="font-title text-xs font-semibold uppercase tracking-wide text-nox-noir/45">
            What&apos;s next?
          </p>
          <div
            className={
              onShare ? "mt-3 grid gap-3 sm:grid-cols-2" : "mt-3 grid"
            }
          >
            {onShare ? (
              <DocumentSavedAction
                description="Send it to your client by email."
                icon={ShareNetworkIcon}
                label="Share"
                onClick={onShare}
                tone="teal"
              />
            ) : null}
            <DocumentSavedAction
              description="Get a print-ready A4 copy."
              icon={FilePdfIcon}
              label="Download PDF"
              onClick={onDownload}
              tone="purple"
            />
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              onClick={onContinue}
              size="sm"
              variant="outline"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSavedDialog;
