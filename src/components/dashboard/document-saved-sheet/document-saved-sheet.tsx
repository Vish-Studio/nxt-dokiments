"use client";

import {
  CheckCircleIcon,
  FilePdfIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";

import { BottomSheet } from "@/components/commons/bottom-sheet/bottom-sheet";
import { Button } from "@/components/commons/button/button";
import { iconSize } from "@/lib/icons";

export interface DocumentSavedSheetProps {
  /** The saved document's display name, quoted in the confirmation. */
  documentName: string;
  /** Dismisses the sheet (Escape, backdrop, close button) and keeps the user in the editor. */
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
 * Confirms a successful save in a {@link BottomSheet} and offers the next
 * step: Share (main action), Download PDF, or Done back to the documents list.
 *
 * A sheet rather than a centred dialog because nothing here needs a decision:
 * it is a lightweight "what's next" moment, so it stays quiet (a success
 * check, one line of copy, standard buttons) and can be dismissed to keep
 * editing.
 */
export const DocumentSavedSheet = ({
  documentName,
  onClose,
  onDone,
  onDownload,
  onShare,
  open,
}: DocumentSavedSheetProps) => (
  <BottomSheet
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
    className="document-saved-sheet"
    description={
      <>
        <span className="font-semibold text-nox-noir">
          &quot;{documentName}&quot;
        </span>{" "}
        is saved. What would you like to do next?
      </>
    }
    icon={
      <CheckCircleIcon
        aria-hidden
        className="text-success"
        size={iconSize.feature}
        weight="fill"
      />
    }
    onClose={onClose}
    open={open}
    title="Document saved"
  />
);

export default DocumentSavedSheet;
