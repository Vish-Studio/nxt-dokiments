import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";

import { AuthGuard } from "../auth-guard";

const meta = {
  component: AuthGuard,
  tags: ["ai-generated"],
  args: {
    children: <p>Protected content</p>,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof AuthGuard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Authenticated: Story = {
  beforeEach: () => {
    useAuthStore.setState({
      session: {
        expiresAt: Date.now() + 60_000,
        idToken: "story-token",
        refreshToken: "story-refresh",
        user: {
          displayName: "Story User",
          email: "story@dokiments.test",
          role: "free",
          uid: "story-user",
        },
      },
      status: "authenticated",
      user: {
        displayName: "Story User",
        email: "story@dokiments.test",
        role: "free",
        uid: "story-user",
      },
    });
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Protected content")).toBeVisible();
  },
};

export const Loading: Story = {
  beforeEach: () => {
    useAuthStore.setState({ session: null, status: "loading", user: null });
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Checking account access")).toBeVisible();
  },
};
