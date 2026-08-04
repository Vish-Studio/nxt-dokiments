import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Header } from "../header";

const meta = {
  title: "Website/Header",
  component: Header,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /dokiments home/i })).toBeVisible();
    await expect(canvas.getByRole("link", { name: /sign up/i })).toBeVisible();
  },
};

export const AuthChrome: Story = {
  args: {
    showAuthActions: false,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /dokiments home/i })).toBeVisible();
  },
};
