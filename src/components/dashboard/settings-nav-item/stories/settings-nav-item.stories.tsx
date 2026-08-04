import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import SettingsNavItem from "../settings-nav-item";

const meta = {
  title: "Dashboard/Settings Nav Item",
  component: SettingsNavItem,
  tags: ["ai-generated"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof SettingsNavItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  render: (args) => (
    <div className="w-64 bg-app-chrome p-4">
      <SettingsNavItem {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /settings/i })).toHaveAttribute(
      "href",
      "/settings",
    );
  },
};

export const Collapsed: Story = {
  args: {
    isCollapsed: true,
  },
  render: (args) => (
    <div className="hidden bg-app-chrome p-4 lg:block">
      <SettingsNavItem {...args} />
    </div>
  ),
};

export const Active: Story = {
  args: {
    isActive: true,
  },
  render: (args) => (
    <div className="w-64 bg-app-chrome p-4">
      <SettingsNavItem {...args} />
    </div>
  ),
};
