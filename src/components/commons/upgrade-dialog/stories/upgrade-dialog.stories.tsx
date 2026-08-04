import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { UpgradeDialog } from "../upgrade-dialog";

const meta = {
  title: "Commons/Upgrade Dialog",
  component: UpgradeDialog,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  args: {
    onClose: () => {},
    open: true,
  },
} satisfies Meta<typeof UpgradeDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /upgrade to add more templates/i })).toBeVisible();
    await expect(canvas.getByRole("link", { name: /view plans/i })).toBeVisible();
  },
};
