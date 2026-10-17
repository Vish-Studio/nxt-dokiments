import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MarketplacePromoCarousel } from "../marketplace-promo-carousel";

const slides = [
  {
    actionHref: "/my-documents",
    actionLabel: "Explore Dokiments",
    backgroundClassName: "bg-golden-harvest",
    detail: "Create professional quotations, invoices, contracts and more with ready-to-go templates.",
    eyebrow: "Dokiments",
    imageSrc: "/images/mockups/marketplace/home-mockup.svg",
    title: "Business documents, without the blank page.",
  },
  {
    actionHref: "/my-clients",
    actionLabel: "Explore client portal",
    backgroundClassName: "bg-play-blue",
    detail: "Manage client details in one place and keep them connected to the documents you create.",
    imageSrc: "/images/marketplace/marketplace-promo-placeholder.png",
    title: "Keep your clients organized.",
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
