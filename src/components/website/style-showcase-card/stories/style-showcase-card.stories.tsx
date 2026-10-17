import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";

import { StyleShowcaseCard } from "../style-showcase-card";

const template = getTemplateById("modern-contract");

if (!template) {
  throw new Error("modern-contract template is required for this story");
}

const meta = {
  title: "Website/Style Showcase Card",
  component: StyleShowcaseCard,
  tags: ["ai-generated"],
  args: {
    accent: "bg-play-purple",
    description:
      "Bold headers and accent blocks for a confident, branded look.",
    name: "Modern",
    onPreview: fn(),
    template,
    tierLabel: "Silver",
    tierVariant: "silver",
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StyleShowcaseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas }) => {
    const card = canvas.getByRole("button", {
      name: /preview the modern style/i,
    });
    await expect(card).toBeVisible();
    await expect(canvas.getByText("Silver")).toBeVisible();

    await userEvent.click(card);
    await expect(args.onPreview).toHaveBeenCalled();
  },
};

export const FreeTier: Story = {
  args: {
    accent: "bg-play-blue",
    name: "Classic",
    tierLabel: "Free",
    tierVariant: "free",
  },
};
