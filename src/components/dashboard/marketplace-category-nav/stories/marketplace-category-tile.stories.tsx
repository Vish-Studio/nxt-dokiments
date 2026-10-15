import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { MarketplaceCategoryTile } from "../marketplace-category-tile";

const meta = {
  title: "Dashboard/Marketplace Category Tile",
  component: MarketplaceCategoryTile,
  parameters: { layout: "centered" },
  args: {
    documentType: "quotation",
    isActive: false,
    onSelect: fn(),
  },
} satisfies Meta<typeof MarketplaceCategoryTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Quotation" }));
    await expect(args.onSelect).toHaveBeenCalledWith("quotation");
  },
};
