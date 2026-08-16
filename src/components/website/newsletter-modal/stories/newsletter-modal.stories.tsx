import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { NEWSLETTER_STATUS_STORAGE_KEY } from "@/lib/newsletter";

import { NewsletterModal } from "../newsletter-modal";

const meta = {
  title: "Website/Newsletter Modal",
  component: NewsletterModal,
  parameters: { layout: "fullscreen" },
  beforeEach: () =>
    window.localStorage.removeItem(NEWSLETTER_STATUS_STORAGE_KEY),
} satisfies Meta<typeof NewsletterModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstVisit: Story = {
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("dialog", {
        name: "Make the next document easier.",
      }),
    ).toBeVisible();
  },
};
