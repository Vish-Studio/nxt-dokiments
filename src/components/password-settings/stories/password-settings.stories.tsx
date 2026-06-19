import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";

import { PasswordSettings } from "../password-settings";

const meta = {
  component: PasswordSettings,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => {
      useAuthStore.setState({
        session: {
          expiresAt: Date.now() + 3_600_000,
          idToken: "story-id-token",
          refreshToken: "story-refresh-token",
          user: {
            displayName: "Anthony Alverizko",
            email: "anthony@dokiments.com",
            role: "free",
            uid: "story-uid",
          },
        },
        status: "authenticated",
      });
      return (
        <div className="min-h-screen bg-app-panel p-6">
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof PasswordSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /password/i })).toBeVisible();
    await expect(canvas.getByRole("button", { name: /change password/i })).toBeVisible();
  },
};
