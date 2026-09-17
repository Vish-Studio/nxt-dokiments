import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { activePromoCode } from "@/lib/promo/promo-codes";

import { PromoCodeCallout } from "../promo-code-callout";

const meta = {
  title: "Commons/Promo Code Callout",
  component: PromoCodeCallout,
  tags: ["ai-generated"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md bg-white p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PromoCodeCallout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(activePromoCode.label)).toBeVisible();
    // Asserted against the registry rather than a literal, so the advertised code
    // and the one the server accepts can never drift apart in a passing test.
    await expect(canvas.getByText(activePromoCode.code)).toBeVisible();
  },
};
