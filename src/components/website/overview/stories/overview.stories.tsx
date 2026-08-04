import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Overview } from "../overview";

const meta = {
  title: "Website/Overview",
  component: Overview,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Overview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: /document workspace/i })).toBeVisible();
    await expect(canvas.getByText("Dashboard overview")).toBeVisible();
  },
};
