import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { TestimonialPersonButton } from "../testimonial-person-button";

const meta = {
  title: "Website/Testimonial Person Button",
  component: TestimonialPersonButton,
  tags: ["ai-generated"],
  args: {
    accent: "bg-play-teal",
    isActive: false,
    name: "Omar Williams",
    onSelect: () => undefined,
    role: "Operations lead",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm bg-nox-noir p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TestimonialPersonButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inactive: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Omar Williams, Operations lead" }),
    ).toHaveAttribute("aria-pressed", "false");
  },
};

export const Active: Story = {
  args: { isActive: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Omar Williams, Operations lead" }),
    ).toHaveAttribute("aria-pressed", "true");
  },
};
