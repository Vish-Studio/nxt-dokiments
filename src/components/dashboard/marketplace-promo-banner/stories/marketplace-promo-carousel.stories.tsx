import { ClockIcon, GiftIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MarketplacePromoCarousel } from "../marketplace-promo-carousel";
import type { MarketplacePromoSlideProps } from "../marketplace-promo-slide";

const slides: MarketplacePromoSlideProps[] = [
  {
    actionHref: "/marketplace#marketplace-template-sections",
    actionLabel: "Browse all templates",
    backgroundClassName: "bg-golden-harvest",
    detail: "Silver and Gold included. Save the ones your business reuses.",
    eyebrow: "Launch offer",
    eyebrowIcon: GiftIcon,
    imageSrc: "/images/marketplace/promo-templates.webp",
    points: ["60 templates", "15 document types", "4 design styles"],
    title: "Every template is free during launch.",
  },
  {
    actionHref: "/my-clients",
    actionLabel: "Add a client",
    backgroundClassName: "bg-play-blue",
    detail:
      "Their name, email and address fill every invoice, quote and contract.",
    eyebrow: "Save time",
    eyebrowIcon: ClockIcon,
    imageSrc: "/images/marketplace/promo-clients.webp",
    points: ["Prefilled details", "Grouped by company", "Every document type"],
    title: "Add a client once. Reuse them everywhere.",
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
