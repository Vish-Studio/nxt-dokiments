import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { appScreens } from "@/lib/website/app-screens";

import { FeatureTabVisual } from "../feature-tab-visual";

const meta = {
  title: "Website/Feature Tab Visual",
  component: FeatureTabVisual,
  tags: ["ai-generated"],
  args: {
    background: "bg-play-teal",
    isActive: true,
    screen: appScreens.marketplace,
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

/** A pastel page tone: the browser casts the soft shadow. */
export const Light: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByAltText(/marketplace/i)).toBeInTheDocument();
  },
};

/** The CVs tab: a noir panel with the dark browser ring. */
export const Dark: Story = {
  args: { background: "bg-nox-noir", screen: appScreens.cv, tone: "dark" },
};

/** Inactive tabs fade out and are hidden from assistive technology. */
export const Inactive: Story = {
  args: { isActive: false },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector(".feature-tab-visual"),
    ).toHaveAttribute("aria-hidden", "true");
  },
};
