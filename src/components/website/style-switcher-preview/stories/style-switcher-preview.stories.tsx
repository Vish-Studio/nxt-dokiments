import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";

import { StyleSwitcherPreview } from "../style-switcher-preview";

const template = getTemplateById("modern-invoice");

if (!template) {
  throw new Error("modern-invoice template is required for this story");
}

const meta = {
  title: "Website/Style Switcher Preview",
  component: StyleSwitcherPreview,
  tags: ["ai-generated"],
  args: {
    accent: "bg-play-purple",
    isActive: true,
    template,
  },
  decorators: [
    (Story) => (
      <div className="relative h-136 max-w-xl overflow-hidden rounded-box">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StyleSwitcherPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("article")).toBeVisible();
  },
};

export const Inactive: Story = {
  args: { isActive: false },
};
