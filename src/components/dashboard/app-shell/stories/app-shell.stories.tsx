import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";

import { AppShell } from "../app-shell";

const meta = {
  title: "Dashboard/App Shell",
  component: AppShell,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: () => {
    useAuthStore.setState({
      status: "authenticated",
      user: {
        displayName: "Anthony Alverizko",
        email: "anthony@dokiments.test",
        role: "free",
        uid: "story-user",
      },
    });
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /collapse sidebar/i })).toBeVisible();
  },
};
