import { ClockIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { mockPhoneViewport } from "@/lib/storybook/mock-phone-viewport";

import { MarketplacePromoSlide } from "../marketplace-promo-slide";

const meta = {
  title: "Dashboard/Marketplace Promo Slide",
  component: MarketplacePromoSlide,
  parameters: { layout: "padded" },
  args: {
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
  decorators: [
    (Story) => (
      <div className="h-[35rem] sm:h-[23rem]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MarketplacePromoSlide>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Label, benefit title, one sentence, three proof points, one action. */
export const Default: Story = {
  play: async ({ canvas }) => {
    // The copy fades in on entry, so check it is rendered, not yet opaque.
    await expect(canvas.getByText("Save time")).toBeInTheDocument();
    await expect(
      canvas.getByRole("heading", {
        name: "Add a client once. Reuse them everywhere.",
      }),
    ).toBeInTheDocument();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    await expect(
      canvas.getByRole("link", { name: /Add a client/ }),
    ).toHaveAttribute("href", "/my-clients");
  },
};

/** Without proof points the list is left out entirely. */
export const WithoutPoints: Story = {
  args: { points: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("list")).toBeNull();
  },
};

/** Phones: the copy first, the app screen underneath. */
export const OnPhone: Story = {
  beforeEach: mockPhoneViewport,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
