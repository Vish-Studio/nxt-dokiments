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
