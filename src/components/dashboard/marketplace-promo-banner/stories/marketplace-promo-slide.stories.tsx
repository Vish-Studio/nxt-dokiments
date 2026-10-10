import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MarketplacePromoSlide } from "../marketplace-promo-slide";

const meta = {
  title: "Dashboard/Marketplace Promo Slide",
  component: MarketplacePromoSlide,
  parameters: { layout: "padded" },
  args: {
    actionHref: "/my-clients",
    actionLabel: "Explore client portal",
    backgroundClassName: "bg-play-blue",
    detail: "Manage client details in one place and keep them connected to the documents you create.",
    imageSrc: "/images/marketplace/marketplace-promo-placeholder.png",
    title: "Keep your clients organized.",
  },
} satisfies Meta<typeof MarketplacePromoSlide>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
