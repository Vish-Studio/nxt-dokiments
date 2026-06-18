import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { PageIntro } from "../page-intro";

const meta = {
  component: PageIntro,
  tags: ["ai-generated"],
  args: {
    description: "Here's your overview of your documents.",
    title: "Hello, Anthony!",
  },
} satisfies Meta<typeof PageIntro>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: /hello, anthony/i })).toBeVisible();
  },
};
