import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";

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

export const Authenticated: Story = {
  decorators: [
    (Story) => {
      useAuthStore.setState({
        status: "authenticated",
        user: {
          displayName: "Anthony Alverizko",
          email: "anthony@dokiments.com",
          provider: "password",
          role: "free",
          uid: "story-uid",
        },
      });
      return <Story />;
    },
  ],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  },
};
