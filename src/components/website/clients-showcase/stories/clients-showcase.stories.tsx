import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { ClientsShowcase } from "../clients-showcase";

const meta = {
  title: "Website/Clients Showcase",
  component: ClientsShowcase,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ClientsShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: /already filled in/i, level: 2 }),
    ).toBeVisible();
    await expect(canvas.getByText("Prefill in one click")).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: /add your first client/i }),
    ).toHaveAttribute("href", "/sign-up");
  },
};
