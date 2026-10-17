import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { SidebarToggleButton } from "../sidebar-toggle-button";

const meta = {
  title: "Dashboard/Sidebar Toggle Button",
  component: SidebarToggleButton,
  args: {
    className: "inline-flex border-none bg-white/45 text-nox-noir",
    isCollapsed: false,
    onToggle: fn(),
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof SidebarToggleButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Expanded: Story = {};

export const Collapsed: Story = {
  args: { isCollapsed: true },
};
