import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { MarketplaceShowcase } from "../marketplace-showcase";

const meta = {
  title: "Website/Marketplace Showcase",
  component: MarketplaceShowcase,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof MarketplaceShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: /real templates/i }),
    ).toBeVisible();
    await expect(canvas.getAllByRole("button", { name: /preview/i }).length).toBeGreaterThan(3);
  },
};
