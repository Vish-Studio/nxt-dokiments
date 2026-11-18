import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { ConfirmDialog } from "../confirm-dialog";

const meta = {
  title: "Commons/Confirm Dialog",
  component: ConfirmDialog,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  args: {
    confirmLabel: "Add template",
    description:
      "Free accounts can keep 2 templates and can't remove them later. Add \"Contract\"? You'll have used 1 of 2.",
    onClose: () => {},
    onConfirm: () => {},
    open: true,
    title: "Add to My Templates?",
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: /add to my templates/i }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: /add template/i }),
    ).toBeVisible();
  },
};

export const Success: Story = {
  args: {
    cancelLabel: null,
    confirmLabel: "Continue",
    description: '"Lumina Events Invoice" has been saved successfully.',
    dismissible: false,
    title: "Document saved",
    tone: "success",
  },
};

export const Danger: Story = {
  args: {
    confirmLabel: "Delete document",
    confirmVariant: "danger",
    description:
      'Delete "Lumina Events Invoice"? This action cannot be undone.',
    title: "Delete document?",
  },
  play: async ({ canvasElement }) => {
    const dialog = within(canvasElement).getByRole("dialog", {
      name: "Delete document?",
    });
    await expect(dialog).toHaveAttribute("data-layout", "centered");
    await expect(dialog).toHaveAttribute("data-tone", "danger");
    await expect(dialog).toHaveAccessibleDescription(
      'Delete "Lumina Events Invoice"? This action cannot be undone.',
    );
    // Decisions have no close X: the user picks Cancel or the action.
    await expect(
      within(dialog).queryByRole("button", { name: "Close" }),
    ).toBeNull();
    await expect(
      within(dialog).getByRole("button", { name: "Delete document" }),
    ).toHaveClass("btn-error");
  },
};

/** Warnings list what is affected in the body, so the user sees exactly what will happen. */
export const WarningWithList: Story = {
  args: {
    cancelLabel: "Fix document",
    children: (
      <ul
        aria-label="Empty fields"
        className="flex flex-wrap gap-2"
      >
        {["Client address", "Due date", "Payment instructions"].map((label) => (
          <li
            className="rounded-field bg-golden-harvest/30 px-2.5 py-1 text-xs font-semibold text-nox-noir"
            key={label}
          >
            {label}
          </li>
        ))}
      </ul>
    ),
    confirmLabel: "Save anyway",
    description:
      "If you save now, these fields stay blank in the document.",
    title: "Some fields are empty",
    tone: "warning",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvas.getByRole("dialog", { name: "Some fields are empty" });
    // Decisions stay centred, never a bottom sheet.
    await expect(dialog).toHaveAttribute("data-layout", "centered");
    await expect(dialog).toHaveAttribute("data-tone", "warning");
    await expect(
      within(dialog).getByRole("list", { name: "Empty fields" }),
    ).toBeVisible();
  },
};

export const ConfirmLoading: Story = {
  args: {
    confirmLoading: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const confirmButton = canvas.getByRole("button", { name: /add template/i });
    await expect(confirmButton).toBeDisabled();
    const cancelButton = canvas.getByRole("button", { name: /cancel/i });
    await expect(cancelButton).toBeDisabled();
  },
};
