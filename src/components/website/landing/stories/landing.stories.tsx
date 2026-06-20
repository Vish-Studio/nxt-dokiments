import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";

import { Landing } from "../landing";

const meta = {
  title: "Website/Landing",
  component: Landing,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Landing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(
        canvas.getByRole("heading", { name: /business documents/i }),
      ).toBeVisible();
    });
    await expect(canvas.getByRole("heading", { name: /start free/i })).toBeInTheDocument();
  },
};
