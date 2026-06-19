import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Topbar } from "../topbar";

const meta = {
  component: Topbar,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Topbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="bg-app-chrome">
      <Topbar {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  },
};

export const CustomUser: Story = {
  args: {
    userInitials: "ND",
    userName: "Dokiments Team",
  },
  render: (args) => (
    <div className="bg-app-chrome">
      <Topbar {...args} />
    </div>
  ),
};
