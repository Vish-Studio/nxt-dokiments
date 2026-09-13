import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MarketplacePromoCarousel } from "../marketplace-promo-carousel";

const slides = [
  {
    actionHref: "/settings",
    actionLabel: "Apply offer",
    detail: "Use the launch offer on a polished business document.",
    eyebrow: "Launch promo",
    icon: "offer" as const,
    imageSrc:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&fm=webp&q=84&w=1800",
    promoCode: "VISHOK2026!",
    title: "A sharper start for every document.",
  },
  {
    actionHref: "/my-clients",
    actionLabel: "Manage clients",
    detail: "Keep client details close to the documents you create for them.",
    eyebrow: "New workspace tool",
    icon: "clients" as const,
    imageSrc:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&fm=webp&q=84&w=1800",
    title: "Your clients, right where your work happens.",
  },
];

const meta = {
  title: "Dashboard/Marketplace Promo Carousel",
  component: MarketplacePromoCarousel,
  parameters: { layout: "padded" },
  args: { slides },
} satisfies Meta<typeof MarketplacePromoCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
