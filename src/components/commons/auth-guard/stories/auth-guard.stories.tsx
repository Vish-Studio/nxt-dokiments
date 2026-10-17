import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";

import { AuthGuard } from "../auth-guard";

const meta = {
  title: "Commons/Auth Guard",
  component: AuthGuard,
  tags: ["ai-generated"],
  args: {
    children: <p>Protected content</p>,
  },
  parameters: {
    layout: "fullscreen",
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
      status: "authenticated",
      user: {
        displayName: "Story User",
        email: "story@dokiments.test",
        provider: "password",
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
    useAuthStore.setState({ status: "loading", user: null });
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Checking your account" }),
    ).toBeVisible();
    // Announced while it waits, and nothing protected leaks through.
    await expect(canvas.getByRole("status")).toHaveAttribute("aria-busy", "true");
    await expect(canvas.queryByText("Protected content")).not.toBeInTheDocument();
  },
};
