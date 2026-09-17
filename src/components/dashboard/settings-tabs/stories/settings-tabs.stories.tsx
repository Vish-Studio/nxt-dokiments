import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";

import { SettingsTabs } from "../settings-tabs";

const meta = {
  title: "Dashboard/Settings Tabs",
  component: SettingsTabs,
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
          provider: "password",
          role: "free",
          uid: "story-uid",
        },
      });
      return (
        <div className="min-h-screen bg-app-panel">
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof SettingsTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("tab", { name: /profile/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.click(canvas.getByRole("tab", { name: /password/i }));
    await expect(
      canvas.getByRole("heading", { name: /password/i }),
    ).toBeVisible();
  },
};
