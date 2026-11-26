"use client";

import {
  EyeIcon,
  FilePdfIcon,
  FloppyDiskIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/commons/button/button";
import { iconSize } from "@/lib/icons";
import { cn } from "@/lib/utils";

import { EditorActionButton } from "./editor-action-button";

export interface DocumentEditorActionsProps {
  className?: string;
  /** Opens the PDF export for the current draft (saved or not). */
  onDownload: () => void;
  /** Opens the document preview. Shown below `lg` only, where the live preview is hidden. */
  onPreview?: () => void;
  onSave: () => void;
  /** Opens the share dialog. Omit when sharing is off or the document is unsaved. */
  onShare?: () => void;
  /** Disables Save while a create or duplicate request is in flight. */
  saveDisabled?: boolean;
  /** "Save changes", "Create document", "Duplicating…" and so on. */
  saveLabel: string;
}

/**
 * The document editor's floating action bar: a dark pill (the sidebar's
 * `app-chrome` colour, `rounded-full`), so the actions for the document being
 * written are always in reach. On desktop it hugs its actions, centred at the
 * bottom of the content area; on phones it runs from left to right, with Save
 * pushed to its right end and Preview as a round button just outside it.
 *
 * Only what you do *with the draft* belongs here, in the order you do it:
 * Download PDF, Share (saved documents, when sharing is on),
 * then Save, styled like every page's main action (the accent button with
 * an icon, bold, as "Browse marketplace"). Preview (below `lg` only, since the side-by-side preview is hidden there)
 * sits outside the bar as its own round button. Delete is deliberately not
 * here: a destructive action does not belong in a bar used constantly, next to
 * Save. It stays in each document's row menu. On desktop the icons show their
 * label on hover or focus ({@link EditorActionButton}).
 *
 * Renders `sticky bottom-0` inside `ContentContainer`, so it centres on the
 * page content rather than the window and floats the container's padding above
 * the edge. Make it the editor's last child: being in the flow, it leaves room
 * after the last field, so nothing is hidden behind it.
 */
export const DocumentEditorActions = ({
  className,
  onDownload,
  onPreview,
  onSave,
  onShare,
  saveDisabled = false,
  saveLabel,
}: DocumentEditorActionsProps) => (
  <div
    className={cn(
      "document-editor-actions pointer-events-none sticky bottom-0 z-40 flex items-center gap-2 lg:justify-center",
      className,
    )}
  >
    <div
      aria-label="Document actions"
      className="pointer-events-auto flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-app-chrome p-2 shadow-lg ring-1 ring-white/10 lg:flex-none"
      role="toolbar"
    >
      <EditorActionButton
        icon={FilePdfIcon}
        label="Download PDF"
        onClick={onDownload}
      />
      {onShare ? (
        <EditorActionButton
          icon={ShareNetworkIcon}
          label="Share"
          onClick={onShare}
        />
      ) : null}
      <Button
        className="ml-auto rounded-full! lg:ml-1.5"
        disabled={saveDisabled}
        icon={
          <FloppyDiskIcon
            aria-hidden
            size={iconSize.control}
            weight="bold"
          />
        }
        iconPosition="left"
        onClick={onSave}
        size="sm"
        type="button"
        variant="accent"
      >
        {saveLabel}
      </Button>
    </div>

    {onPreview ? (
      // Outside the bar, so the bar keeps to actions on the draft.
      <button
        aria-label="Preview"
        className="pointer-events-auto flex size-14 shrink-0 items-center justify-center rounded-full bg-app-chrome text-white shadow-lg ring-1 ring-white/10 transition-colors hover:bg-nox-noir focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-golden-harvest lg:hidden"
        onClick={onPreview}
        type="button"
      >
        <EyeIcon
          aria-hidden
          size={iconSize.feature}
          weight="bold"
        />
      </button>
    ) : null}
  </div>
);

export default DocumentEditorActions;
