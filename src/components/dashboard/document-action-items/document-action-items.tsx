import {
  ArrowSquareOutIcon,
  CopyIcon,
  DownloadSimpleIcon,
  PencilSimpleIcon,
  ShareNetworkIcon,
  TrashIcon,
} from "@phosphor-icons/react";

import { DropdownMenuItem } from "@/components/commons/dropdown-menu-item/dropdown-menu-item";
import type { UserDocument } from "@/types/template";

export interface DocumentActionItemsProps {
  document: UserDocument;
  /** Opens the document in the editor. */
  onEdit: (document: UserDocument) => void;
  /** Opens the PDF export. */
  onDownload: (document: UserDocument) => void;
  /**
   * Adds "Duplicate". Also hidden for a document without a template snapshot,
   * which can't be copied.
   */
  onDuplicate?: (document: UserDocument) => void;
  /** Adds "Share". Omit while sharing is off. */
  onShare?: (document: UserDocument) => void;
  /** Adds "View shared copy". Pass it only for a document that has been shared. */
  onViewShared?: (document: UserDocument) => void;
  /** Adds a red "Delete" after a divider. The caller confirms before deleting. */
  onDelete?: (document: UserDocument) => void;
}

/**
 * Every action on one of the user's own documents, in one fixed order, for a
 * row's ⋮ menu (`Dropdown` children: a popover on desktop, a bottom sheet on
 * phones): Edit, Download PDF, Duplicate, Share, View shared copy, then a
 * divider and Delete. Each is a {@link DropdownMenuItem} (`role="menuitem"`),
 * so the Dropdown's arrow-key navigation reaches it. Shared by the My documents / CVs rows and the Companies
 * rows so the two menus never drift apart. Optional actions appear only when
 * their handler is passed.
 *
 * @example
 * <Dropdown ariaLabel="More actions for Invoice" sheetTitle="Invoice">
 *   <DocumentActionItems document={doc} onDownload={print} onEdit={edit} onDelete={askToDelete} />
 * </Dropdown>
 */
export const DocumentActionItems = ({
  document,
  onDelete,
  onDownload,
  onDuplicate,
  onEdit,
  onShare,
  onViewShared,
}: DocumentActionItemsProps) => (
  <>
    <DropdownMenuItem
      icon={PencilSimpleIcon}
      onClick={() => onEdit(document)}
    >
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem
      icon={DownloadSimpleIcon}
      onClick={() => onDownload(document)}
    >
      Download PDF
    </DropdownMenuItem>
    {onDuplicate && document.templateSnapshot ? (
      <DropdownMenuItem
        icon={CopyIcon}
        onClick={() => onDuplicate(document)}
      >
        Duplicate
      </DropdownMenuItem>
    ) : null}
    {onShare ? (
      <DropdownMenuItem
        icon={ShareNetworkIcon}
        onClick={() => onShare(document)}
      >
        Share
      </DropdownMenuItem>
    ) : null}
    {onShare && onViewShared ? (
      <DropdownMenuItem
        icon={ArrowSquareOutIcon}
        onClick={() => onViewShared(document)}
      >
        View shared copy
      </DropdownMenuItem>
    ) : null}
    {onDelete ? (
      <>
        <div
          className="my-1 h-px bg-steel-mist/60"
          role="separator"
        />
        <DropdownMenuItem
          icon={TrashIcon}
          onClick={() => onDelete(document)}
          tone="danger"
        >
          Delete
        </DropdownMenuItem>
      </>
    ) : null}
  </>
);
