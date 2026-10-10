import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";

import { TemplateStripItem } from "../template-strip-item";

const template = getTemplateById("modern-invoice");

if (!template) {
  throw new Error("modern-invoice template is required for this story");
}

const meta = {
  title: "Website/Template Strip Item",
  component: TemplateStripItem,
  tags: ["ai-generated"],
  args: { template },
  decorators: [
    (Story) => (
      <div className="bg-play-blue p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TemplateStripItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    // The thumbnail renders the template name too, so match every occurrence.
    await expect(
      canvas.getAllByText("Standard Invoice").length,
    ).toBeGreaterThan(1);
    await expect(canvas.getByText("Modern")).toBeVisible();
  },
};
