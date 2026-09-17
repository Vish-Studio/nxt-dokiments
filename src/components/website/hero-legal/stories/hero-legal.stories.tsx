import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { HeroLegal } from "../hero-legal";

const meta = {
  title: "Website/Hero Legal",
  component: HeroLegal,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof HeroLegal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/Dokiments\. All rights reserved\./)).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    await expect(canvas.getByRole("link", { name: "Terms of Use" })).toHaveAttribute(
      "href",
      "/terms",
    );
  },
};
