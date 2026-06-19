import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import type { MarketplaceTemplate } from "@/types/template";

import { TemplateDocument } from "../template-document";

const template = getTemplateById("classic-contract") as MarketplaceTemplate;

const meta = {
  component: TemplateDocument,
  tags: ["ai-generated"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[600px] bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
  args: { template },
} satisfies Meta<typeof TemplateDocument>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
  args: {
    values: {
      clientName: "Acme Co.",
      scope: "Design and build a marketing website.",
      title: "Website Build Agreement",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Website Build Agreement")).toBeVisible();
    await expect(canvas.getByText("Acme Co.")).toBeVisible();
  },
};

export const ModernStyle: Story = {
  args: { template: getTemplateById("modern-invoice") as MarketplaceTemplate },
};
