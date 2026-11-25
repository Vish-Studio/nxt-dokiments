import {
  ArrowSquareOutIcon,
  CopyIcon,
  DownloadSimpleIcon,
  type Icon,
  PencilSimpleIcon,
  ShareNetworkIcon,
  TrashIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/commons/button/button";
import { iconSize } from "@/lib/icons";
import { cn } from "@/lib/utils";
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

/** One menu action: icon and label, red for destructive ones. */
const ActionItem = ({
  icon: ItemIcon,
  label,
  onClick,
  tone = "default",
}: {
  icon: Icon;
  label: string;
  onClick: () => void;
  tone?: "danger" | "default";
}) => (
  <Button
    className={cn(
      "w-full justify-start gap-2 px-3 whitespace-nowrap",
      tone === "danger" && "text-error hover:bg-error/10",
    )}
    icon={
      <ItemIcon
        aria-hidden
        size={iconSize.control}
        weight="bold"
      />
    }
    iconPosition="left"
    onClick={onClick}
    size="sm"
    variant="ghost"
  >
    {label}
  </Button>
);

/**
 * Every action on one of the user's own documents, in one fixed order, for a
 * row's ⋮ menu (`Dropdown` children: a popover on desktop, a bottom sheet on
 * phones): Edit, Download PDF, Duplicate, Share, View shared copy, then a
 * divider and Delete. Shared by the My documents / CVs rows and the Companies
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
    <ActionItem
      icon={PencilSimpleIcon}
      label="Edit"
      onClick={() => onEdit(document)}
    />
    <ActionItem
      icon={DownloadSimpleIcon}
      label="Download PDF"
      onClick={() => onDownload(document)}
    />
    {onDuplicate && document.templateSnapshot ? (
      <ActionItem
        icon={CopyIcon}
        label="Duplicate"
        onClick={() => onDuplicate(document)}
      />
    ) : null}
    {onShare ? (
      <ActionItem
        icon={ShareNetworkIcon}
        label="Share"
        onClick={() => onShare(document)}
      />
    ) : null}
    {onShare && onViewShared ? (
      <ActionItem
        icon={ArrowSquareOutIcon}
        label="View shared copy"
        onClick={() => onViewShared(document)}
      />
    ) : null}
    {onDelete ? (
      <>
        <div
          aria-hidden
          className="my-1 h-px bg-steel-mist/60"
        />
        <ActionItem
          icon={TrashIcon}
          label="Delete"
          onClick={() => onDelete(document)}
          tone="danger"
        />
      </>
    ) : null}
  </>
);
