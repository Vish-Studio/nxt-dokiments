import { HouseIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import SidebarItem from "../sidebar-item";

const meta = {
  title: "Dashboard/Sidebar Item",
  component: SidebarItem,
  args: {
    href: "/dashboard",
    icon: HouseIcon,
    label: "Dashboard",
  },
  decorators: [
    (Story) => (
      <div className="w-60 bg-app-chrome p-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SidebarItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = {
  args: {
    isActive: true,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  },
};

export const Collapsed: Story = {
  args: {
    isCollapsed: true,
  },
  decorators: [
    (Story) => (
      <div className="w-24 bg-app-chrome p-5">
        <Story />
      </div>
    ),
  ],
};
