import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { HeroCredit } from "../hero-credit";

const meta = {
  title: "Website/Hero Credit",
  component: HeroCredit,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="bg-white p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HeroCredit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("link", { name: /digital product of vish\.studio/i }),
    ).toHaveAttribute("href", "https://www.vish.studio");
  },
};
