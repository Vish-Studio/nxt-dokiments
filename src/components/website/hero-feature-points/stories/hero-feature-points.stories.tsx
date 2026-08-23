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
    await expect(canvas.getByText("Smart templates")).toBeVisible();
    await expect(canvas.getByText("It's free")).toBeVisible();
  },
};
