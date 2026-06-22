import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Footer } from "../footer";

const meta = {
  title: "Website/Footer",
  component: Footer,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    await expect(canvas.getByRole("link", { name: "Cookie Policy" })).toHaveAttribute(
      "href",
      "/cookies",
    );
    await expect(canvas.getByRole("button", { name: "Cookie settings" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: /vish studio/i })).toHaveAttribute(
      "href",
      "https://www.vish.studio",
    );
  },
};
