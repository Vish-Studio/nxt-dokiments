import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";
import { useTemplatesStore } from "@/stores/templates-store";

import { MarketplaceBrowser } from "../marketplace-browser";

const meta = {
  component: MarketplaceBrowser,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => {
      useTemplatesStore.setState({ savedByUser: {} });
      useAuthStore.setState({
        status: "authenticated",
        user: {
          displayName: "Anthony Alverizko",
          email: "anthony@dokiments.com",
          role: "free",
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
} satisfies Meta<typeof MarketplaceBrowser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FreeUser: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Template styles" })).toBeVisible();
    await expect(canvas.getByRole("heading", { name: "Classic" })).toBeVisible();
    // Premium styles are locked for a free user.
    await expect(canvas.getAllByRole("link", { name: /upgrade/i }).length).toBeGreaterThan(0);
  },
};
