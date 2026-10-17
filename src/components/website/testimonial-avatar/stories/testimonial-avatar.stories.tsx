import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { TestimonialAvatar } from "../testimonial-avatar";

const meta = {
  title: "Website/Testimonial Avatar",
  component: TestimonialAvatar,
  tags: ["ai-generated"],
  args: {
    accent: "bg-play-teal",
    name: "Maya Chen",
  },
} satisfies Meta<typeof TestimonialAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Medium: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("MC")).toBeVisible();
  },
};

export const Large: Story = {
  args: { size: "lg" },
};
