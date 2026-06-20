import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";

import { Hero } from "../hero";

const meta = {
  component: Hero,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(
        canvas.getByRole("heading", { name: /business documents without the blank page/i }),
      ).toBeVisible();
    });
    await expect(canvas.getAllByRole("link", { name: /browse marketplace/i })[0]).toBeVisible();
  },
};
