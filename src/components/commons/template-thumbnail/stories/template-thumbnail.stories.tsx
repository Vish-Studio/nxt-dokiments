import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { getTemplateById } from "@/lib/market-place";
import type { MarketplaceTemplate } from "@/types/template";

import { TemplateThumbnail } from "../template-thumbnail";

const template = getTemplateById("classic-contract") as MarketplaceTemplate;

const meta = {
  title: "Commons/Template Thumbnail",
  component: TemplateThumbnail,
  tags: ["ai-generated"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-72 bg-app-panel p-4">
        <Story />
      </div>
    ),
  ],
  args: { template },
} satisfies Meta<typeof TemplateThumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
  args: {
    values: { clientName: "Acme Co.", title: "Website Build Agreement" },
  },
};

export const ModernStyle: Story = {
  args: { template: getTemplateById("modern-invoice") as MarketplaceTemplate },
};
