import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Pricing } from "../pricing";

const meta = {
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
    await expect(canvas.getByText("Starter")).toBeVisible();
    await expect(canvas.getByText("Studio")).toBeVisible();
    await expect(canvas.getByText("Business")).toBeVisible();
  },
};
