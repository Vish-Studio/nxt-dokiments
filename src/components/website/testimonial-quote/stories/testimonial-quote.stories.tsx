import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { TestimonialQuote } from "../testimonial-quote";

const meta = {
  title: "Website/Testimonial Quote",
  component: TestimonialQuote,
  tags: ["ai-generated"],
  args: {
    accent: "bg-golden-harvest",
    isActive: true,
    name: "Maya Chen",
    quote:
      "The workspace makes repeat document work feel far less scattered. I can return to the right template and get a polished draft moving quickly.",
    role: "Independent consultant",
  },
  decorators: [
    (Story) => (
      <div className="grid max-w-3xl bg-nox-noir p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TestimonialQuote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Maya Chen")).toBeVisible();
    await expect(canvas.getByText(/far less scattered/i)).toBeVisible();
  },
};

export const Inactive: Story = {
  args: { isActive: false },
};
