import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { ThemeToggle } from "../theme-toggle";

const meta = {
  component: ThemeToggle,
  tags: ["ai-generated"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  render: (args) => (
    <div className="w-64 bg-app-chrome p-4">
      <ThemeToggle {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /light/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  },
};

export const Collapsed: Story = {
  args: {
    isCollapsed: true,
  },
  render: (args) => (
    <div className="hidden bg-app-chrome p-4 lg:block">
      <ThemeToggle {...args} />
    </div>
  ),
};
