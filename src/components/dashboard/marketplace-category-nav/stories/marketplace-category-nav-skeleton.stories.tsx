import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { MarketplaceCategoryNavSkeleton } from "../marketplace-category-nav-skeleton";

const meta = {
  title: "Dashboard/Marketplace Category Nav Skeleton",
  component: MarketplaceCategoryNavSkeleton,
  parameters: { layout: "padded" },
} satisfies Meta<typeof MarketplaceCategoryNavSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // Hidden from assistive tech; the marketplace's LoadingStatus speaks instead.
    const skeleton = canvasElement.querySelector(
      ".marketplace-category-nav-skeleton",
    );
    await expect(skeleton).toHaveAttribute("aria-hidden", "true");
    const tiles = canvasElement.querySelectorAll(
      ".marketplace-category-nav-skeleton .rounded-box.border",
    );
    await expect(tiles).toHaveLength(10);
  },
};

/** Narrow viewport: the bordered card, with smaller tiles. */
export const Mobile: Story = {
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
};
