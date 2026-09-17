import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { NEWSLETTER_STATUS_STORAGE_KEY } from "@/lib/newsletter";

import { NewsletterForm } from "../newsletter-form";

const meta = {
  title: "Commons/Newsletter Form",
  component: NewsletterForm,
  beforeEach: () => {
    const originalFetch = window.fetch;
    window.fetch = async () => new Response(JSON.stringify({ status: "subscribed" }));

    return () => {
      window.fetch = originalFetch;
    };
  },
} satisfies Meta<typeof NewsletterForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = {};

export const Dark: Story = {
  args: { appearance: "dark" },
  decorators: [(Story) => <div className="bg-nox-noir p-6"><Story /></div>],
};

export const Submits: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Email address" }), "hello@example.com");
    await userEvent.click(canvas.getByRole("button", { name: "Subscribe" }));
    await expect(canvas.getByText(/you're on the list/i)).toBeVisible();
    await expect(window.localStorage.getItem(NEWSLETTER_STATUS_STORAGE_KEY)).toBe("subscribed");
  },
};
