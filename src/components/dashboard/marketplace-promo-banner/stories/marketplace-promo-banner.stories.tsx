import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { MarketplacePromoBanner } from "../marketplace-promo-banner";

const meta = {
  title: "Dashboard/Marketplace Promo Banner",
  component: MarketplacePromoBanner,
  parameters: { layout: "padded" },
} satisfies Meta<typeof MarketplacePromoBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Opens on the offer slide: a label, a benefit title, proof points counted
 * from the real catalog, and one action.
 */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    // The copy fades in on entry, so check it is rendered, not yet opaque.
    await expect(canvas.getByText(/^\d+ templates$/)).toBeInTheDocument();
    await expect(canvas.getAllByRole("link")).toHaveLength(1);
  },
};
