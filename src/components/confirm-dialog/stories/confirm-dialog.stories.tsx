import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { ConfirmDialog } from "../confirm-dialog";

const meta = {
  component: ConfirmDialog,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  args: {
    confirmLabel: "Add template",
    description:
      'Free accounts can keep 2 templates and can\'t remove them later. Add "Contract"? You\'ll have used 1 of 2.',
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
    await expect(canvas.getByRole("heading", { name: /add to my templates/i })).toBeVisible();
    await expect(canvas.getByRole("button", { name: /add template/i })).toBeVisible();
  },
};
