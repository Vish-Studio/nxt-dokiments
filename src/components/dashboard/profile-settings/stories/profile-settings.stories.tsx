import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";

import { ProfileSettings } from "../profile-settings";

const seedSession = () => {
  useAuthStore.setState({
    status: "authenticated",
    user: {
      displayName: "Anthony Alverizko",
      email: "anthony@dokiments.com",
      role: "free",
      uid: "story-uid",
    },
  });
};

const meta = {
  title: "Dashboard/Profile Settings",
  component: ProfileSettings,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => {
      seedSession();
      return (
        <div className="min-h-screen bg-app-panel p-6">
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof ProfileSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /profile/i })).toBeVisible();
    await expect(canvas.getByDisplayValue("Anthony Alverizko")).toBeVisible();
    await expect(canvas.getByText("anthony@dokiments.com")).toBeVisible();
  },
};
