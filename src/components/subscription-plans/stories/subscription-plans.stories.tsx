import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";

import { SubscriptionPlans } from "../subscription-plans";

const meta = {
  component: SubscriptionPlans,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => {
      useAuthStore.setState({
        status: "authenticated",
        user: {
          displayName: "Anthony Alverizko",
          email: "anthony@dokiments.com",
          role: "silver",
          uid: "story-uid",
        },
      });
      return (
        <div className="min-h-screen bg-app-panel p-6">
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof SubscriptionPlans>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /plans/i })).toBeVisible();
    // Current role (silver) shows a disabled "Current plan" button.
    await expect(canvas.getByRole("button", { name: /current plan/i })).toBeDisabled();
  },
};
