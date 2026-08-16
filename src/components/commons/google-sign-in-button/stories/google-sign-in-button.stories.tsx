import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { GoogleSignInButton } from "../google-sign-in-button";

const meta = {
  title: "Commons/Google Sign In Button",
  component: GoogleSignInButton,
  tags: ["ai-generated"],
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof GoogleSignInButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: /continue with google/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      "/api/auth/google/start?next=%2Fdashboard",
    );
  },
};

export const CustomLabel: Story = {
  args: {
    label: "Sign up with Google",
    next: "/settings",
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: /sign up with google/i });
    await expect(link).toHaveAttribute(
      "href",
      "/api/auth/google/start?next=%2Fsettings",
    );
  },
};
