import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { HeroIntro } from "../hero-intro";

const meta = {
  title: "Website/Hero Intro",
  component: HeroIntro,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen max-w-2xl bg-white p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HeroIntro>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: /without the blank page/i }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /add your client/i }));
    await expect(
      canvas.getByRole("heading", { level: 1, name: /filled in for you/i }),
    ).toBeVisible();
  },
};
