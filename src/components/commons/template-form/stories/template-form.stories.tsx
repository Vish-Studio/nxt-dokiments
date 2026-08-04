import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import type { MarketplaceTemplate } from "@/types/template";

import { TemplateForm } from "../template-form";

const template = getTemplateById("classic-invoice") as MarketplaceTemplate;

const meta = {
  title: "Commons/Template Form",
  component: TemplateForm,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    fields: template.fields,
    onChange: () => {},
    values: { invoiceNumber: "INV-0001" },
  },
} satisfies Meta<typeof TemplateForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByDisplayValue("INV-0001")).toBeVisible();
  },
};
