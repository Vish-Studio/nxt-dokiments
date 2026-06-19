import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";

import { SidebarAccount } from "../sidebar-account";

const meta = {
  component: SidebarAccount,
  tags: ["ai-generated"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => {
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
        <div className="w-60 bg-app-chrome p-4">
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof SidebarAccount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Anthony Alverizko")).toBeVisible();
    await expect(canvas.getByRole("button", { name: /log out/i })).toBeVisible();
  },
};

export const Collapsed: Story = {
  args: { isCollapsed: true },
};
