import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { HeroFeaturePoints } from "../hero-feature-points";

const meta = {
  title: "Website/Hero Feature Points",
  component: HeroFeaturePoints,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof HeroFeaturePoints>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    for (const label of [
      "Smart templates",
      "Role access",
      "Mobile ready",
      "Team friendly",
    ]) {
      await expect(canvas.getByText(label)).toBeVisible();
    }
  },
};
