import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { SidebarToggleButton } from "../sidebar-toggle-button";

const meta = {
  title: "Dashboard/Sidebar Toggle Button",
  component: SidebarToggleButton,
  args: {
    className: "inline-flex",
    isCollapsed: false,
    onToggle: fn(),
  },
  decorators: [
    (Story) => (
      <div className="rounded-box bg-app-chrome p-4">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "centered" },
} satisfies Meta<typeof SidebarToggleButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Expanded: Story = {};

export const Collapsed: Story = {
  args: { isCollapsed: true },
};
