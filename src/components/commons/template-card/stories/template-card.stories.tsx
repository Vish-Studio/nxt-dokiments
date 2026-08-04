import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import type { MarketplaceTemplate } from "@/types/template";

import { TemplateCard } from "../template-card";

const template = getTemplateById("classic-proposal") as MarketplaceTemplate;

const meta = {
  title: "Commons/Template Card",
  component: TemplateCard,
  tags: ["ai-generated"],
  parameters: { layout: "centered", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="w-80 bg-app-panel p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    onPreview: () => {},
    template,
  },
} satisfies Meta<typeof TemplateCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: /preview/i }),
    ).toBeVisible();
  },
};

export const Locked: Story = {
  args: { locked: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: /locked/i })).toBeVisible();
  },
};

export const Saved: Story = {
  args: { saved: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: /saved/i })).toBeVisible();
  },
};
