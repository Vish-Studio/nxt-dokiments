import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import Sidebar from "../sidebar";

const meta = {
  title: "Dashboard/Sidebar",
  component: Sidebar,
  tags: ["ai-generated"],
  args: {
    activeItem: "Dashboard",
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  render: (args) => (
    <div className="min-h-screen bg-app-chrome">
      <Sidebar {...args} isMobileOpen />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  },
};

export const Collapsed: Story = {
  args: {
    isCollapsed: true,
  },
  render: (args) => (
    <div className="hidden min-h-screen bg-app-chrome lg:block">
      <Sidebar {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /expand sidebar/i })).toBeVisible();
  },
};

export const MobileOpen: Story = {
  args: {
    isMobileOpen: true,
  },
  render: (args) => (
    <div className="min-h-screen bg-app-panel">
      <Sidebar {...args} />
    </div>
  ),
};
