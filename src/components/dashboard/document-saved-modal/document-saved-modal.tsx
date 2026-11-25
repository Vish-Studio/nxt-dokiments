"use client";

import { FilePdfIcon, ShareNetworkIcon } from "@phosphor-icons/react";

import { Button } from "@/components/commons/button/button";
import { Modal } from "@/components/commons/modal/modal";
import { iconSize } from "@/lib/icons";

export interface DocumentSavedModalProps {
  /** The saved document's display name, quoted in the confirmation. */
  documentName: string;
  /** Dismisses the modal (Escape, backdrop, close button) and keeps the user in the editor. */
  onClose: () => void;
  /** "Done": leaves the editor for the documents list. */
  onDone: () => void;
  /** Opens the PDF export for the document that was just saved. */
  onDownload: () => void;
  /**
   * Opens the share dialog for the saved document. Omit it when sharing is
   * switched off (`NEXT_PUBLIC_DOCUMENT_SHARING_ENABLED`); Download PDF then
   * becomes the main action.
   */
  onShare?: () => void;
  open: boolean;
}

/**
 * Confirms a successful save and offers the next step: Share (main action),
 * Download PDF, or Done back to the documents list. A success-toned
 * {@link Modal}: centred on desktop, a bottom sheet on phones.
 *
 * Nothing here needs a decision, so it stays light: the success tile says
 * "done" at a glance, one sentence names the document, and the buttons name
 * the next steps in plain words. Dismissing it keeps the user in the editor.
 */
export const DocumentSavedModal = ({
  documentName,
  onClose,
  onDone,
  onDownload,
  onShare,
  open,
}: DocumentSavedModalProps) => (
  <Modal
    actions={
      <>
        <Button
          onClick={onDone}
          size="sm"
          variant="ghost"
        >
          Done
        </Button>
        <Button
          icon={
            <FilePdfIcon
              aria-hidden
              size={iconSize.control}
              weight="bold"
            />
          }
          iconPosition="left"
          onClick={onDownload}
          size="sm"
          variant={onShare ? "outline" : "primary"}
        >
          Download PDF
        </Button>
        {onShare ? (
          <Button
            icon={
              <ShareNetworkIcon
                aria-hidden
                size={iconSize.control}
                weight="bold"
              />
            }
            iconPosition="left"
            onClick={onShare}
            size="sm"
            variant="primary"
          >
            Share
          </Button>
        ) : null}
      </>
    }
    className="document-saved-modal"
    description={
      <>
        <span className="font-semibold text-nox-noir">
          &quot;{documentName}&quot;
        </span>{" "}
        is saved. Share it with your client or download a PDF copy.
      </>
    }
    onClose={onClose}
    open={open}
    title="Document saved"
    tone="success"
  />
);

export default DocumentSavedModal;
