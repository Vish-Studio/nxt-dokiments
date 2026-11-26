"use client";

import { FilePdfIcon, ShareNetworkIcon } from "@phosphor-icons/react";

import { Button } from "@/components/commons/button/button";
import { Modal } from "@/components/commons/modal/modal";
import { iconSize } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface DocumentSavedModalProps {
  /** The saved document's display name, shown under the title. */
  documentName: string;
  /**
   * The close X, Escape or the backdrop: closes the modal and keeps the user
   * in the editor.
   */
  onClose: () => void;
  /** "Back to documents": leaves the editor for the documents list. */
  onDone: () => void;
  /** Opens the PDF export for the document that was just saved. */
  onDownload: () => void;
  /**
   * Opens the share dialog for the saved document. Omit it when sharing is
   * switched off (`NEXT_PUBLIC_DOCUMENT_SHARING_ENABLED`); Download PDF is
   * then the main button.
   */
  onShare?: () => void;
  open: boolean;
}

/**
 * Confirms a successful save and offers what to do next, with one clear
 * order of importance. A success-toned {@link Modal}: centred on desktop, a
 * bottom sheet on phones.
 *
 * 1. **Share** (black, main): the step most people take after saving.
 * 2. **Download PDF** (outline), beside it.
 * 3. **Back to documents** (ghost, full width) to leave the editor.
 *
 * The close X, Escape and the backdrop keep the user in the editor. Share and
 * Download close this first, so overlays never stack.
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
      <Button
        className="w-full"
        onClick={onDone}
        size="sm"
        variant="ghost"
      >
        Back to documents
      </Button>
    }
    className="document-saved-modal"
    description={documentName}
    onClose={onClose}
    open={open}
    title="Document saved"
    tone="success"
  >
    <div className={cn("grid gap-2", onShare && "grid-cols-2")}>
      {onShare ? (
        <Button
          className="w-full"
          icon={
            <ShareNetworkIcon
              aria-hidden
              size={iconSize.control}
              weight="bold"
            />
          }
          iconPosition="left"
          onClick={onShare}
          variant="primary"
        >
          Share
        </Button>
      ) : null}
      <Button
        className="w-full"
        icon={
          <FilePdfIcon
            aria-hidden
            size={iconSize.control}
            weight="bold"
          />
        }
        iconPosition="left"
        onClick={onDownload}
        variant={onShare ? "outline" : "primary"}
      >
        Download PDF
      </Button>
    </div>
  </Modal>
);

export default DocumentSavedModal;
