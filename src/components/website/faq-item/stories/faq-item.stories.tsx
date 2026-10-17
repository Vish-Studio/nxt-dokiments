import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { FaqItem } from "../faq-item";

const meta = {
  title: "Website/Faq Item",
  component: FaqItem,
  tags: ["ai-generated"],
  args: {
    answer:
      "An invoice requests payment; a quotation estimates the price before work starts.",
    question: "What is the difference between an invoice and a quotation?",
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FaqItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: { defaultOpen: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/requests payment/i)).toBeVisible();
  },
};

export const Closed: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText(/difference between an invoice and a quotation/i),
    ).toBeVisible();
    await expect(canvas.getByText(/requests payment/i)).not.toBeVisible();
  },
};
