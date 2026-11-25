import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { CvShowcase } from "../cv-showcase";

const meta = {
  title: "Website/CV Showcase",
  component: CvShowcase,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof CvShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: /first CV that gets you noticed/i }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("link", { name: /Write your CV for free/ }),
    ).toHaveAttribute("href", "/sign-up");
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
  },
};

export const Phone: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
