import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Pricing } from "../pricing";

const meta = {
  title: "Website/Pricing",
  component: Pricing,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Pricing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: /start free/i })).toBeVisible();
    await expect(canvas.getByText("Free")).toBeVisible();
    await expect(canvas.getByText("Silver")).toBeVisible();
    await expect(canvas.getByText("Gold")).toBeVisible();
  },
};
