import { PlusIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { FloatingActionButton } from "../floating-action-button";

const meta = {
  title: "Commons/Floating Action Button",
  component: FloatingActionButton,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    icon: <PlusIcon aria-hidden size={18} weight="bold" />,
    label: "New document",
    onClick: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="min-h-96 bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FloatingActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /new document/i })).toBeVisible();
  },
};
