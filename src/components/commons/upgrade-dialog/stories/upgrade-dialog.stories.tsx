import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { mockPhoneViewport } from "@/lib/storybook/mock-phone-viewport";

import { UpgradeDialog } from "../upgrade-dialog";

const meta = {
  title: "Commons/Upgrade Dialog",
  component: UpgradeDialog,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  args: {
    onClose: () => {},
    open: true,
    reason: "saved_template_limit",
  },
} satisfies Meta<typeof UpgradeDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // The whole page, not just the canvas: on phones this renders as a portalled bottom sheet.
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(
      canvas.getByRole("heading", { name: /upgrade to add more templates/i }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: /view plans/i }),
    ).toBeVisible();
  },
};

/** On phones the same content opens in a bottom sheet. */
export const OnPhone: Story = {
  beforeEach: mockPhoneViewport,
  play: async ({ canvasElement }) => {
    const sheet = within(canvasElement.ownerDocument.body).getByRole("dialog", {
      name: /upgrade to add more templates/i,
    });
    await expect(sheet.closest(".bottom-sheet")).not.toBeNull();
    await expect(
      within(sheet).getByRole("link", { name: /view plans/i }),
    ).toBeVisible();
    await expect(
      within(sheet).getByRole("button", { name: /maybe later/i }),
    ).toBeVisible();
  },
};
