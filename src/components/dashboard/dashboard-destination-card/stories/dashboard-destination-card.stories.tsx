import { FileTextIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { DashboardDestinationCard } from "../dashboard-destination-card";

const meta = {
  title: "Dashboard/Dashboard Destination Card",
  component: DashboardDestinationCard,
  tags: ["ai-generated"],
  parameters: { layout: "centered", nextjs: { appDirectory: true } },
  args: {
    description: "Open saved templates and create polished client-ready files.",
    href: "/my-documents",
    icon: FileTextIcon,
    label: "My Documents",
    metric: "3 active files",
    tone: "blue",
  },
} satisfies Meta<typeof DashboardDestinationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="w-80 bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("link", { name: /my documents/i }),
    ).toBeVisible();
    await expect(canvas.getByText("3 active files")).toBeVisible();
  },
};
