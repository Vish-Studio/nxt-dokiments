"use client";

import { SpinnerGapIcon } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import type { ButtonProps } from "@/components/commons/button/button";
import { Button } from "@/components/commons/button/button";
import { Modal } from "@/components/commons/modal/modal";
import type { ModalTone } from "@/components/commons/modal/modal-icon";
import { iconSize } from "@/lib/icons";

export type ConfirmDialogProps = {
  /** The dismissive button. `null` hides it (an acknowledgement with one action). */
  cancelLabel?: string | null;
  /** Optional body under the description, e.g. the list of affected items. */
  children?: ReactNode;
  confirmLabel?: string;
  /** Shows a spinner on the confirm button and disables both buttons. */
  confirmLoading?: boolean;
  confirmVariant?: ButtonProps["variant"];
  /** What happens if the user confirms, in one or two plain sentences. */
  description?: ReactNode;
  /** When `false`, Escape and the backdrop do nothing; only the buttons close it. */
  dismissible?: boolean;
  /** Replaces the tone's default glyph, e.g. `TrashIcon` for a delete. */
  icon?: Icon;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
  /**
   * The kind of decision, shown as the icon tile's colour. Defaults to
   * `danger` when `confirmVariant` is `danger`, otherwise `info`.
   */
  tone?: ModalTone;
};

/**
 * Asks the user to confirm a decision: a centred {@link Modal} on every screen
 * size (never a bottom sheet), with a tone icon, the question as the title, the
 * consequence as the description, and the actions bottom-right (stacked on
 * phones, the confirm button on top).
 *
 * Rendered in place rather than portalled, as before, so callers inside panels
 * keep working unchanged.
 */
export const ConfirmDialog = ({
  cancelLabel = "Cancel",
  children,
  confirmLabel = "Confirm",
  confirmLoading = false,
  confirmVariant = "primary",
  description,
  dismissible = true,
  icon,
  onClose,
  onConfirm,
  open,
  title,
  tone,
}: ConfirmDialogProps) => (
  <Modal
    actions={
      <>
        {cancelLabel ? (
          <Button
            disabled={confirmLoading}
            onClick={onClose}
            size="sm"
            variant="outline"
          >
            {cancelLabel}
          </Button>
        ) : null}
        <Button
          disabled={confirmLoading}
          icon={
            confirmLoading ? (
              <SpinnerGapIcon
                aria-hidden
                className="animate-spin"
                size={iconSize.control}
                weight="bold"
              />
            ) : null
          }
          iconPosition="left"
          onClick={onConfirm}
          size="sm"
          variant={confirmVariant}
        >
          {confirmLabel}
        </Button>
      </>
    }
    className="confirm-dialog"
    description={description}
    dismissible={dismissible && !confirmLoading}
    icon={icon}
    onClose={onClose}
    open={open}
    phoneLayout="centered"
    portal={false}
    showClose={false}
    title={title}
    tone={tone ?? (confirmVariant === "danger" ? "danger" : "info")}
  >
    {children}
  </Modal>
);

export default ConfirmDialog;
