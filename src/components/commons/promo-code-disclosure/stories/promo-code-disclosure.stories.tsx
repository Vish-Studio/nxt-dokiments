import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Input } from "@/components/commons/input/input";

import { PromoCodeDisclosure } from "../promo-code-disclosure";

const meta = {
  title: "Commons/Promo Code Disclosure",
  component: PromoCodeDisclosure,
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "centered" },
  args: {
    children: (
      <Input
        label="Promo code (optional)"
        placeholder="Enter your promo code"
      />
    ),
  },
} satisfies Meta<typeof PromoCodeDisclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Have a promo code?")).toBeVisible();
    await expect(
      canvas.getByPlaceholderText("Enter your promo code"),
    ).not.toBeVisible();
  },
};

export const Opened: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("Have a promo code?"));
    await expect(
      canvas.getByPlaceholderText("Enter your promo code"),
    ).toHaveFocus();
  },
};

/** Collapsed again after typing: the toggle keeps the entered code in view. */
export const WithEnteredCode: Story = {
  args: { value: "ViSHDOK2026!" },
};
