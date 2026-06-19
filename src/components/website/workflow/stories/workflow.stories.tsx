import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Workflow } from "../workflow";

const meta = {
  component: Workflow,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Workflow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Choose a document")).toBeVisible();
    await expect(canvas.getByText("Export or share")).toBeVisible();
  },
};
