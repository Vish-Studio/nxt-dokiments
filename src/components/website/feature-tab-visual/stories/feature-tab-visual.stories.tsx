import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { FeatureTabVisual } from "../feature-tab-visual";

const meta = {
  title: "Website/Feature Tab Visual",
  component: FeatureTabVisual,
  tags: ["ai-generated"],
  args: {
    accent: "bg-play-teal",
    fit: "cover",
    imageAlt: "Four document templates laid out on a teal surface",
    imageSrc: "/images/page-headers/marketplace.webp",
    isActive: true,
  },
  decorators: [
    (Story) => (
      <div className="relative aspect-4/3 max-w-xl overflow-hidden rounded-box">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FeatureTabVisual>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cover: Story = {};

export const Contain: Story = {
  args: {
    accent: "bg-golden-harvest",
    fit: "contain",
    imageAlt: "Dokiments dashboard",
    imageSrc: "/images/mockups/hero-laptop-cutout.webp",
  },
};
