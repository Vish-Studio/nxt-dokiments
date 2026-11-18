import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { mockPhoneViewport } from "@/lib/storybook/mock-phone-viewport";

import { UpgradeDialog } from "../upgrade-dialog";

const meta = {
  title: "Commons/Upgrade Dialog",
  component: UpgradeDialog,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  args: {
    onClose: fn(),
    open: true,
    reason: "saved_template_limit",
  },
} satisfies Meta<typeof UpgradeDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    // The whole page, not just the canvas: the modal is portalled into `document.body`.
    const canvas = within(canvasElement.ownerDocument.body);
    const dialog = canvas.getByRole("dialog", {
      name: /upgrade to add more templates/i,
    });
    // Desktop is always a centred modal, never a bottom sheet.
    await expect(dialog).toHaveAttribute("data-layout", "centered");
    await expect(dialog).toHaveAccessibleDescription(
      /2-template limit on the free plan/,
    );
    await expect(
      within(dialog).getByRole("link", { name: /view plans/i }),
    ).toHaveAttribute("href", "/subscription");

    await userEvent.click(
      within(dialog).getByRole("button", { name: /maybe later/i }),
    );
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

/** The share-limit copy the share dialog passes in. */
export const ShareLimit: Story = {
  args: {
    description:
      "You've used all 3 shares on the free plan this month. Upgrade to share Lumina Events Invoice with your client.",
    reason: "share_limit",
    title: "Upgrade to share more documents",
  },
  play: async ({ canvasElement }) => {
    const dialog = within(canvasElement.ownerDocument.body).getByRole(
      "dialog",
      { name: "Upgrade to share more documents" },
    );
    await expect(dialog).toHaveAccessibleDescription(
      /all 3 shares on the free plan/,
    );
  },
};

/** On phones the same content opens in a bottom sheet. */
export const OnPhone: Story = {
  beforeEach: mockPhoneViewport,
  play: async ({ canvasElement }) => {
    const sheet = within(canvasElement.ownerDocument.body).getByRole("dialog", {
      name: /upgrade to add more templates/i,
    });
    await expect(sheet).toHaveAttribute("data-layout", "sheet");
    await expect(
      within(sheet).getByRole("link", { name: /view plans/i }),
    ).toBeVisible();
    await expect(
      within(sheet).getByRole("button", { name: /maybe later/i }),
    ).toBeVisible();
  },
};
