import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { PromoStatusBanner } from "../promo-status-banner";

/**
 * Every story passes `status` explicitly rather than manipulating the URL, so the
 * stories don't depend on the query string the component reads at runtime.
 */
const meta = {
  title: "Dashboard/Promo Status Banner",
  component: PromoStatusBanner,
  tags: ["ai-generated"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PromoStatusBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Applied: Story = {
  args: { status: "applied" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Launch promo applied.",
    );
  },
};

export const AlreadyRedeemed: Story = {
  args: { status: "already_redeemed" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "This promo code has already been used for your account.",
    );
  },
};

export const Invalid: Story = {
  args: { status: "invalid" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Invalid promo code.",
    );
  },
};

/** The redemption couldn't be processed — distinct from the code being wrong. */
export const Failed: Story = {
  args: { status: "failed" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "We couldn't apply your promo code. Please try again from Settings.",
    );
  },
};

/** No promo code was submitted, so nothing renders at all. */
export const NoStatus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("status")).toBeNull();
    await expect(canvas.queryByRole("alert")).toBeNull();
  },
};
