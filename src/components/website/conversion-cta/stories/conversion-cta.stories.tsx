import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";
import { ConversionCtaDocuments } from "@/components/website/conversion-cta-documents/conversion-cta-documents";

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
    await expect(
      canvas.getByRole("link", { name: /sign in/i }),
    ).toHaveAttribute("href", "/sign-in");
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

/**
 * With a `visual` (the documents fan): buttons under the text, and signed-out
 * visitors also get "Create a free account". The fan shows from `lg`.
 */
export const WithDocuments: Story = {
  args: {
    title: "Already know which template you need? Sign in and keep moving.",
    visual: <ConversionCtaDocuments className="hidden lg:block" />,
  },
  decorators: Default.decorators,
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("link", { name: /sign in/i }),
    ).toHaveAttribute("href", "/sign-in");
    await expect(
      canvas.getByRole("link", { name: "Create a free account" }),
    ).toHaveAttribute("href", "/sign-up");
  },
};
