import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MarketplacePromoSlide } from "../marketplace-promo-slide";

const meta = {
  title: "Dashboard/Marketplace Promo Slide",
  component: MarketplacePromoSlide,
  parameters: { layout: "padded" },
  args: {
    actionHref: "/my-clients",
    actionLabel: "Manage clients",
    detail: "Keep client details close to the documents you create for them.",
    eyebrow: "New workspace tool",
    icon: "clients",
    imageSrc:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&fm=webp&q=84&w=1800",
    title: "Your clients, right where your work happens.",
  },
} satisfies Meta<typeof MarketplacePromoSlide>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
