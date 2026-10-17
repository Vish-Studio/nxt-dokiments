import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Confidence } from "../confidence";

const meta = {
  title: "Website/Confidence",
  component: Confidence,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Confidence>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: /sign in once/i }),
    ).toBeVisible();
    await expect(canvas.getByText("Access follows the account")).toBeVisible();
  },
};
