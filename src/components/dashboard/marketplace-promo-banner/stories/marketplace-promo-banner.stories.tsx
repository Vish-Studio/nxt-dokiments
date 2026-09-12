import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MarketplacePromoBanner } from "../marketplace-promo-banner";

const meta = {
  title: "Dashboard/Marketplace Promo Banner",
  component: MarketplacePromoBanner,
  parameters: { layout: "padded" },
} satisfies Meta<typeof MarketplacePromoBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
