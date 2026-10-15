import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { documentTypes } from "@/types/template";

import { MarketplaceCategoryNav } from "../marketplace-category-nav";

const meta = {
  title: "Dashboard/Marketplace Category Nav",
  component: MarketplaceCategoryNav,
  parameters: { layout: "padded" },
  args: {
    categories: documentTypes,
    onChange: fn(),
    value: "all",
  },
} satisfies Meta<typeof MarketplaceCategoryNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const quotation = canvas.getByRole("button", { name: "Quotation" });

    await userEvent.click(quotation);
    await expect(args.onChange).toHaveBeenCalledWith("quotation");
  },
};
