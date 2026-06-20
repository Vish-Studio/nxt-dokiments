import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import type { MarketplaceTemplate } from "@/types/template";

import { TemplatePreviewDialog } from "../template-preview-dialog";

const template = getTemplateById("modern-quotation") as MarketplaceTemplate;

const meta = {
  component: TemplatePreviewDialog,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  args: {
    onClose: () => {},
    onSave: () => {},
    template,
  },
} satisfies Meta<typeof TemplatePreviewDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: /save template/i })).toBeVisible();
  },
};

export const Locked: Story = {
  args: { locked: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: /upgrade to use/i })).toBeVisible();
  },
};
