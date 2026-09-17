import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";

import { ConversionCta } from "../conversion-cta";

const meta = {
  title: "Website/Conversion CTA",
  component: ConversionCta,
  args: {
    description:
      "Return to your workspace, save a template, and create the next document without rebuilding from scratch.",
    placement: "story",
    title: "Pick up the document workflow inside Dokiments.",
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ConversionCta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => {
      useAuthStore.setState({ status: "unauthenticated", user: null });
      return <Story />;
    },
  ],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/sign-in",
    );
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
