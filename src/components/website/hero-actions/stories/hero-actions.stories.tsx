import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";

import { HeroActions } from "../hero-actions";

const meta = {
  title: "Website/Hero Actions",
  component: HeroActions,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HeroActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {
  decorators: [
    (Story) => {
      useAuthStore.setState({ status: "unauthenticated", user: null });
      return <Story />;
    },
  ],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Sign In" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
    await expect(
      canvas.getByRole("link", { name: "Create a free account" }),
    ).toHaveAttribute("href", "/sign-up");
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
    await expect(
      canvas.getByRole("link", { name: "Go to my dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
  },
};
