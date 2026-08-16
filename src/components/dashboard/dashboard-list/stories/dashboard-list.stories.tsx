import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { DashboardList } from "../dashboard-list";

const meta = {
  title: "Dashboard/Dashboard List",
  component: DashboardList,
  args: {
    children: <li className="border-t border-steel-mist/70 p-4">List item</li>,
    columns: [
      { className: "col-span-5", label: "Name" },
      { className: "col-span-3", label: "Details" },
      { className: "col-span-2", label: "Created" },
      { className: "col-span-2 text-right", label: "Actions" },
    ],
  },
} satisfies Meta<typeof DashboardList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("List item")).toBeVisible();
  },
};
