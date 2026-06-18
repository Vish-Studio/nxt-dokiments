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
    <div className="bg-background">
      <Topbar {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: /hello, anthony/i })).toBeVisible();
  },
};

export const CustomUser: Story = {
  args: {
    userEmail: "product@nudocuments.com",
    userInitials: "ND",
    userName: "NuDocuments Team",
  },
  render: (args) => (
    <div className="bg-background">
      <Topbar {...args} />
    </div>
  ),
};
